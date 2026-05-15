import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';
import Booking from '@/models/Booking';
import YatraPackage from '@/models/YatraPackage';

export async function GET() {
  try {
    await dbConnect();

    const [
      totalCustomers,
      totalEnquiries,
      newEnquiries,
      totalBookings,
      totalPackages,
      recentEnquiries,
      recentBookings,
      enquiriesByStatus,
      enquiriesBySource,
      bookingsByStatus,
      upcomingBookings,
      enquiryHistory,
    ] = await Promise.all([
      Customer.countDocuments({ isDeleted: { $ne: true } }),
      Enquiry.countDocuments({ isDeleted: { $ne: true } }),
      Enquiry.countDocuments({ status: 'new', isDeleted: { $ne: true } }),
      Booking.countDocuments(),
      YatraPackage.countDocuments({ isActive: true }),
      Enquiry.find({ isDeleted: { $ne: true } }).populate('customer', 'name phone').sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find({}).populate('customer', 'name phone').populate('package', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      Enquiry.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Enquiry.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.find({ travelDate: { $gte: new Date() }, status: { $nin: ['cancelled', 'completed'] } })
        .populate('customer', 'name phone')
        .populate('package', 'name')
        .sort({ travelDate: 1 })
        .limit(5)
        .lean(),
      // Add historical enquiries for graph (last 7 days)
      Enquiry.aggregate([
        {
          $match: {
            isDeleted: { $ne: true },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
    ]);

    const bookingRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, collected: { $sum: '$advancePaid' } } },
    ]);

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalEnquiries,
        newEnquiries,
        totalBookings,
        totalPackages,
        revenue: bookingRevenue[0]?.total || 0,
        collected: bookingRevenue[0]?.collected || 0,
      },
      recentEnquiries,
      recentBookings,
      enquiriesByStatus,
      enquiriesBySource,
      bookingsByStatus,
      upcomingBookings,
      enquiryHistory: enquiryHistory || [],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
