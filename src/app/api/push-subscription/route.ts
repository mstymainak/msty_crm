import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    
    const { endpoint, keys } = body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Upsert subscription to avoid duplicate endpoints
    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      { 
        endpoint,
        keys,
        userId: user ? user.userId : null,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ status: 'success', subscriptionId: subscription._id }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Push subscription registration error:', error.message);
    return NextResponse.json({ error: 'Failed to register subscription' }, { status: 500 });
  }
}
