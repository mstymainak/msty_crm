import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const updates: any = {};
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
