import { NextRequest, NextResponse } from 'next/server';
import wordpressSync from '@/lib/wordpressSync';

/**
 * Migration API Endpoint
 * POST /api/migrate/wordpress-contacts
 * 
 * Fetches all contacts from WordPress backend and imports to MongoDB
 * Only text data is imported (name, email, phone, age, address)
 * Files (photos, PDFs, docs) are excluded
 * 
 * Security: Requires MIGRATION_KEY in Authorization header
 * Set MIGRATION_KEY in .env.local for access
 */
export async function POST(request: NextRequest) {
  try {
    // Security check - require migration key
    const authHeader = request.headers.get('authorization') || '';
    const migrationKey = process.env.MIGRATION_KEY;
    
    if (!migrationKey || !authHeader.includes(migrationKey)) {
      return NextResponse.json(
        { error: 'Unauthorized. Set ?key=YOUR_MIGRATION_KEY in URL or Authorization header' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting WordPress contact migration...');
    
    const result = await wordpressSync.syncAllContacts();

    return NextResponse.json(
      {
        success: true,
        message: 'WordPress contacts migrated successfully',
        stats: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Check migration status and logs
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');
  const migrationKey = process.env.MIGRATION_KEY;

  if (!migrationKey || migrationKey !== key) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'ready',
    message: 'POST to /api/migrate/wordpress-contacts with Authorization header to start migration',
    requirements: {
      WORDPRESS_URL: process.env.WORDPRESS_URL ? '✅ Set' : '❌ Missing',
      WORDPRESS_API_USER: process.env.WORDPRESS_API_USER ? '✅ Set' : '❌ Missing',
      WORDPRESS_API_PASSWORD: process.env.WORDPRESS_API_PASSWORD ? '✅ Set' : '❌ Missing',
      MIGRATION_KEY: migrationKey ? '✅ Set (required for access)' : '❌ Missing',
    },
  });
}
