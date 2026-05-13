#!/usr/bin/env node

/**
 * WordPress Contact Migration Script
 * Run: node migrate-wordpress-contacts.js
 * 
 * This script fetches all contacts from WordPress backend
 * and imports them into MongoDB
 */

require('dotenv').config({ path: `.env.local` });

const wordpressSync = require('./src/lib/wordpressSync').default;

async function main() {
  console.log('\n🚀 Starting WordPress Contact Migration...\n');
  console.log('📋 Configuration:');
  console.log(`   WordPress URL: ${process.env.WORDPRESS_URL}`);
  console.log(`   WordPress User: ${process.env.WORDPRESS_API_USER}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not configured'}\n`);

  try {
    const result = await wordpressSync.syncAllContacts();
    
    process.exit(result.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
