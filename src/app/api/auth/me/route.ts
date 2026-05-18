import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    await dbConnect();
    await User.findByIdAndUpdate(user.userId, { lastLogin: new Date() });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
  return response;
}
