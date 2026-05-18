import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';
import Booking from '@/models/Booking';
import YatraPackage from '@/models/YatraPackage';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const timeline = searchParams.get('timeline') || 'this_week';
    const userId = searchParams.get('userId');

    let startDate = new Date();
    if (timeline === 'this_week') {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0,0,0,0);
    } else if (timeline === 'last_30_days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeline === 'last_90_days') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (timeline === 'this_year') {
      startDate = new Date(startDate.getFullYear(), 0, 1);
    }

    const customerMatch: any = { isDeleted: { $ne: true } };
    const enquiryMatch: any = { isDeleted: { $ne: true } };
    const bookingMatch: any = { status: { $ne: 'cancelled' } };

    if (timeline !== 'all') {
      customerMatch.createdAt = { $gte: startDate };
      enquiryMatch.createdAt = { $gte: startDate };
      bookingMatch.createdAt = { $gte: startDate };
    }

    if (userId && userId !== 'all') {
      const objectId = new mongoose.Types.ObjectId(userId);
      customerMatch.createdBy = objectId;
      bookingMatch.bookedBy = objectId;
    }

    // Convert match objects for aggregation (need to ensure ObjectId for user fields)
    const customerAggMatch = { ...customerMatch };
    const bookingAggMatch = { ...bookingMatch };
    const enquiryAggMatch = { ...enquiryMatch };

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
        { $match: enquiryAggMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Enquiry.aggregate([
        { $match: enquiryAggMatch },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: bookingAggMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.find({ ...bookingMatch, travelDate: { $gte: new Date() }, status: { $nin: ['cancelled', 'completed'] } })
        .populate('customer', 'name phone')
        .populate('package', 'name')
        .sort({ travelDate: 1 })
        .limit(5)
        .lean(),
      // Add historical enquiries for graph
      Enquiry.aggregate([
        { $match: enquiryAggMatch },
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
      { $match: bookingAggMatch },
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
