import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, getCustomers } from '@/lib/customerService';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    
    if (user) {
      body.createdBy = user.userId;
    }
    
    const customer = await createCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}