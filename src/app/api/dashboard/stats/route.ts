import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';
import Booking from '@/models/Booking';
import YatraPackage from '@/models/YatraPackage';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let enquiryMatch: any = { isDeleted: { $ne: true } };
    let customerMatch: any = { isDeleted: { $ne: true } };
    let bookingMatch: any = {};
    let enquiryHistoryMatch: any = { isDeleted: { $ne: true } };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end day

      enquiryMatch.createdAt = { $gte: start, $lte: end };
      customerMatch.createdAt = { $gte: start, $lte: end };
      bookingMatch.createdAt = { $gte: start, $lte: end };
      
      // Graph shows last 7 days only acc to end date of timeline
      const startForHistory = new Date(end);
      startForHistory.setDate(startForHistory.getDate() - 6);
      startForHistory.setHours(0, 0, 0, 0);
      enquiryHistoryMatch.createdAt = { $gte: startForHistory, $lte: end };
    } else {
      // Default to last 7 days for history if no range specified
      enquiryHistoryMatch.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

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
      Customer.countDocuments(customerMatch),
      Enquiry.countDocuments(enquiryMatch),
      Enquiry.countDocuments({ ...enquiryMatch, status: 'new' }),
      Booking.countDocuments(bookingMatch),
      YatraPackage.countDocuments({ isActive: true }),
      Enquiry.find(enquiryMatch).populate('customer', 'name phone').sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find(bookingMatch).populate('customer', 'name phone').populate('package', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      Enquiry.aggregate([
        { $match: enquiryMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Enquiry.aggregate([
        { $match: enquiryMatch },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { ...bookingMatch, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.find({ travelDate: { $gte: new Date() }, status: { $nin: ['cancelled', 'completed'] } })
        .populate('customer', 'name phone')
        .populate('package', 'name')
        .sort({ travelDate: 1 })
        .limit(5)
        .lean(),
      // Add historical enquiries for graph
      Enquiry.aggregate([
        { $match: enquiryHistoryMatch },
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
      { $match: { ...bookingMatch, status: { $ne: 'cancelled' } } },
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
