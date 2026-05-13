# WordPress Contact Migration Guide

This guide explains how to migrate all existing contacts/customers from your WordPress site to the MSTY-CRM MongoDB database.

## Overview

The migration tool:
- ✅ Fetches contact data from WordPress (users, form submissions, custom posts)
- ✅ Excludes file attachments (photos, PDFs, documents)
- ✅ Imports only text data: name, email, phone, age, address
- ✅ Deduplicates contacts by email and phone
- ✅ Skips existing contacts already in MongoDB
- ✅ Provides detailed logs and statistics

## Prerequisites

Ensure these environment variables are set in `.env.local`:

```env
WORDPRESS_URL=https://tirthyatrawala.com
WORDPRESS_API_USER=admin
WORDPRESS_API_PASSWORD=Utkarsh@123
MONGODB_URI=mongodb+srv://mstymainak_db_user:Mahesh123@msty.c0xncnx.mongodb.net/
MIGRATION_KEY=your_secure_migration_key_here
```

## Migration Methods

### Method 1: HTTP API (Recommended)

**Secure with Bearer Token:**

```bash
curl -X POST http://localhost:3000/api/migrate/wordpress-contacts \
  -H "Authorization: Bearer your_secure_migration_key_here" \
  -H "Content-Type: application/json"
```

**Check status:**

```bash
curl http://localhost:3000/api/migrate/wordpress-contacts?key=your_secure_migration_key_here
```

**Response Example:**
```json
{
  "success": true,
  "message": "WordPress contacts migrated successfully",
  "stats": {
    "imported": 45,
    "skipped": 12,
    "errors": 2
  }
}
```

### Method 2: Node.js CLI Script

Run the migration from terminal:

```bash
# From project root
node migrate-wordpress-contacts.js
```

**Sample Output:**
```
🚀 Starting WordPress Contact Migration...

📋 Configuration:
   WordPress URL: https://tirthyatrawala.com
   WordPress User: admin
   MongoDB: ✅ Connected

📥 Fetching WordPress users...
✅ Fetched 45 users from WordPress
📥 Fetching Contact Form 7 submissions...
✅ Fetched 23 form submissions
📥 Fetching custom contact posts...
✅ Fetched 12 custom contact posts

📊 Total unique contacts found: 67

✅ Imported: Rajesh Kumar (rajesh@example.com)
✅ Imported: Priya Singh (priya@example.com)
...

==================================================
📈 MIGRATION SUMMARY
==================================================
✅ Imported: 45
⏭️  Skipped (duplicates/invalid): 20
❌ Errors: 2
Total processed: 67
==================================================
```

### Method 3: Via Docker

If running in Docker container:

```bash
# From host machine, execute command in container
docker exec msty-crm node migrate-wordpress-contacts.js
```

## Data Mapping

WordPress data is mapped to MongoDB Customer schema as follows:

| WordPress Field | MongoDB Field | Notes |
|---|---|---|
| user.name | customer.name | User display name |
| user.email | customer.email | User email |
| user.meta.phone | customer.phone | From user metadata |
| user.meta.age | customer.age | From user metadata |
| user.meta.address | customer.address | From user metadata |
| form.submission_date | customer.createdAt | Submission timestamp |

## Data Sources

The migration fetches from three WordPress sources:

### 1. WordPress Users
- Path: `/wp-json/wp/v2/users`
- Includes custom post meta fields (phone, age, address)
- Excludes: admin user, users without name/email

### 2. Contact Form 7 Submissions
- Path: `/wp-json/wp/v2/contact-form-7`
- Requires CF7 to store submission metadata
- Fields: name, email, phone, message

### 3. Custom Post Types
- Post Types: contacts, enquiry, contact-form
- Fetches from post meta fields
- Non-HTML content only

## Excluded Data

The following are **NOT** imported:

- ❌ Photos/Images (profile pictures, attachments)
- ❌ PDF documents
- ❌ Word documents (.doc, .docx)
- ❌ HTML formatting (stripped from messages)
- ❌ File URLs/paths
- ❌ Binary data
- ❌ WordPress admin user

## Security

**Important:** Always use a secure migration key

### Set Migration Key
Update `.env.local`:
```env
MIGRATION_KEY=your_very_secure_random_key_here
```

Generate a secure key:
```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell (Windows)
[System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32) | ForEach-Object { "{0:X2}" -f $_ } | Join-String
```

### API Security
- Requires `Authorization: Bearer {MIGRATION_KEY}` header
- Only POST requests trigger actual migration
- GET requests only show status (read-only)
- Logs all imported contacts

## Troubleshooting

### Error: "Invalid credentials"
```
❌ Error fetching WordPress users: Invalid credentials
```
**Solution:** Check WORDPRESS_API_USER and WORDPRESS_API_PASSWORD in .env.local

### Error: "Connection refused"
```
❌ Sync error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running and MONGODB_URI is correct

### Contacts not imported
```
⏭️  Skipped (duplicates/invalid): 45
✅ Imported: 0
```
**Causes:**
- Contacts already exist in MongoDB → Safe (skipped)
- Missing required fields (name AND email/phone) → Filtered out
- Invalid email format → Skipped

### WordPress returns empty results
**Check:**
1. WordPress API is enabled: `yoursite.com/wp-json/wp/v2/users` returns data?
2. Basic Auth is working with provided credentials
3. User role has API access permission
4. Data actually exists in WordPress database

### Duplicate contacts
The system checks for duplicates on email + phone combination. If a contact exists with the same email OR phone, it's skipped automatically.

## After Migration

### Verify Import
Check MongoDB directly:

```bash
# MongoDB Atlas Dashboard or mongosh
db.customers.find({ createdAt: { $gte: ISODate("2024-01-01") } }).count()
```

### Update Dashboard
The CRM dashboard automatically includes all migrated contacts in:
- Customer list: `/dashboard`
- Enquiries: `/dashboard/enquiries`
- Analytics: Dashboard shows total customers count

## Rollback

If migration needs to be undone:

```bash
# MongoDB - Remove migrated contacts (use cautiously!)
db.customers.deleteMany({ createdAt: { $gte: ISODate("2024-01-01") } })
```

Or in CRM dashboard, manually delete imported contacts from the UI.

## Support

For issues or questions:
1. Check logs: `npm run dev` shows detailed migration logs
2. Verify .env.local configuration
3. Ensure MongoDB connection works: `MongoDB Atlas` dashboard shows connected
4. Test WordPress API directly in browser: `https://yoursite.com/wp-json/wp/v2/users`

## Next Steps

After successful migration:
- ✅ All historical contacts are now in MongoDB
- ✅ New enquiries are auto-created from webhooks (Meta, WordPress forms)
- ✅ Contacts can be viewed/edited in CRM dashboard
- ✅ Use contact information for follow-ups and bookings
