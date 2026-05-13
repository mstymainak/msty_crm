import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Customer from '@/models/Customer';

export async function GET() {
  try {
    await dbConnect();

    // Auto-purge items soft-deleted more than 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await Enquiry.deleteMany({ isDeleted: true, deletedAt: { $lt: sevenDaysAgo } });
    await Customer.deleteMany({ isDeleted: true, deletedAt: { $lt: sevenDaysAgo } });

    // Fetch remaining soft-deleted records
    const enquiries = await Enquiry.find({ isDeleted: true })
      .populate('customer')
      .populate('package')
      .sort({ deletedAt: -1 });

    const customers = await Customer.find({ isDeleted: true })
      .sort({ deletedAt: -1 });

    return NextResponse.json({ enquiries, customers });
  } catch (err: any) {
    console.error('Recycle bin fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch recycle bin content' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { type, id, action } = await req.json(); // type: 'enquiry' | 'customer', action: 'restore' | 'delete'

    if (type === 'enquiry') {
      if (action === 'restore') {
        await Enquiry.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null });
      } else if (action === 'delete') {
        await Enquiry.findByIdAndDelete(id);
      }
    } else if (type === 'customer') {
      if (action === 'restore') {
        await Customer.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null });
      } else if (action === 'delete') {
        // Also clean up references if needed, but simple delete is fine
        await Customer.findByIdAndDelete(id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Recycle bin action error:', err);
    return NextResponse.json({ error: 'Failed to perform recycle bin action' }, { status: 500 });
  }
}
