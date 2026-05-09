import { NextRequest, NextResponse } from 'next/server';
import { createPackage, getPackages } from '@/lib/packageService';

export async function GET() {
  try {
    const packages = await getPackages();
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pkg = await createPackage(body);
    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
