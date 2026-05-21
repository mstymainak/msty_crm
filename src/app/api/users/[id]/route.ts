import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

type UserUpdateBody = {
  password?: string;
  isActive?: boolean;
  role?: string;
  name?: string;
  email?: string;
};

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can delete staff' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json() as UserUpdateBody;
    
    const updates: Record<string, unknown> = {};
    if (body.password) {
      updates.password = await bcrypt.hash(body.password, 10);
      updates.visiblePassword = body.password;
    }
    if (body.isActive !== undefined) {
      updates.isActive = body.isActive;
    }
    if (body.role !== undefined) {
      updates.role = body.role;
    }
    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.email !== undefined) {
      updates.email = body.email;
    }
    
    await User.findByIdAndUpdate(id, updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
