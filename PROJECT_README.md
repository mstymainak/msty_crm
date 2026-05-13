# MSTY-CRM: Centralized Enquiry Management System

**Mahesh Sharma Tirth Yatra (MSTY)** - A complete CRM system for centralized enquiry management from multiple sources for a pilgrimage company serving senior citizens.

## 🎯 Features

### Core CRM Functionality
- ✅ **Centralized Contact Management** - All customer data in one place
- ✅ **Enquiry Tracking** - Track all incoming enquiries by source
- ✅ **Booking Management** - Convert enquiries into bookings
- ✅ **User Authentication** - Secure login for staff management
- ✅ **Dashboard Analytics** - Overview of contacts, bookings, and enquiries
- ✅ **Package Management** - Define yatra packages and pricing

### Multi-Channel Integration
- ✅ **Facebook Messenger** - Receive enquiries from Facebook page
- ✅ **Website Contact Form** - Direct contact submissions
- ✅ **WordPress Integration** - Migrate existing contacts from WordPress

### Data Management
- ✅ **Bulk Migration** - Import all WordPress contacts (text data only)
- ✅ **Automatic Deduplication** - Prevent duplicate entries
- ✅ **Medical Information** - Store health details for senior citizens
- ✅ **Emergency Contacts** - Record emergency contact information

## 📋 Prerequisites

- **Docker Desktop** (for containerized deployment) - [Download](https://www.docker.com/products/docker-desktop)
- **Node.js 20+** (for local development)
- **MongoDB** (included in docker-compose or external)
- **Git** (for version control)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone/navigate to project
cd msty-crm

# Windows
powershell -ExecutionPolicy Bypass -File docker-start.ps1

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

- **CRM Dashboard:** http://localhost:3000
- **MongoDB:** mongodb://localhost:27017

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Configure environment (update .env.local)
# MONGODB_URI, API keys, etc.

# Start development server
npm run dev

# Open http://localhost:3000
```

### Option 3: Production Build

```bash
# Build for production
npm run build

# Start server
npm start
```

## 📚 Documentation

- **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)** - Complete Docker setup and troubleshooting
- **[WORDPRESS_MIGRATION_GUIDE.md](./WORDPRESS_MIGRATION_GUIDE.md)** - Migrate contacts from WordPress
- **[AGENTS.md](./AGENTS.md)** - Agent customization and configuration

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Meta Business Suite (Facebook)
META_VERIFY_TOKEN=your_token_here
META_PAGE_ACCESS_TOKEN=your_token_here
META_APP_SECRET=your_secret_here

# WordPress (for migration)
WORDPRESS_URL=https://yoursite.com
WORDPRESS_API_USER=admin
WORDPRESS_API_PASSWORD=password

# Security
NEXTAUTH_SECRET=generate-secure-key
MIGRATION_KEY=secure-migration-key
```

Generate secure keys:
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32) | ForEach-Object { "{0:X2}" -f $_ } | Join-String
```

## 📱 API Endpoints

### Customers
```
GET    /api/customers          - List all customers
POST   /api/customers          - Create new customer
GET    /api/customers/:id      - Get customer details
PUT    /api/customers/:id      - Update customer
DELETE /api/customers/:id      - Delete customer
```

### Enquiries
```
GET    /api/enquiries          - List all enquiries
POST   /api/enquiries          - Create new enquiry
GET    /api/enquiries/:id      - Get enquiry details
PUT    /api/enquiries/:id      - Update enquiry
DELETE /api/enquiries/:id      - Delete enquiry
```

### Bookings
```
GET    /api/bookings           - List all bookings
POST   /api/bookings           - Create booking
GET    /api/bookings/:id       - Get booking details
PUT    /api/bookings/:id       - Update booking status
```

### Webhooks
```
POST   /api/webhook/meta       - Facebook Messenger webhook
POST   /api/webhook/wordpress  - WordPress form submissions
```

### Migration
```
GET    /api/migrate/wordpress-contacts?key=KEY      - Check status
POST   /api/migrate/wordpress-contacts               - Run migration
```

## 📦 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.1 |
| Language | TypeScript | 5.x |
| Database | MongoDB | 7.x |
| ORM | Mongoose | 9.3.3 |
| Auth | JWT + NextAuth | 9.0.3 |
| Styling | Tailwind CSS | 4.x |
| HTTP Client | Axios | 1.14.0 |
| Container | Docker | Latest |

## 🗂️ Project Structure

```
msty-crm/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── api/                      # API routes
│   │   │   ├── customers/            # Customer CRUD
│   │   │   ├── enquiries/            # Enquiry CRUD
│   │   │   ├── bookings/             # Booking CRUD
│   │   │   ├── packages/             # Package management
│   │   │   ├── users/                # User management
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── webhook/              # External integrations
│   │   │   │   ├── meta/             # Facebook webhooks
│   │   │   │   └── wordpress/        # WordPress webhooks
│   │   │   └── migrate/              # Data migration
│   │   ├── dashboard/                # CRM dashboard
│   │   ├── login/                    # Login page
│   │   ├── contact/                  # Contact form
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── lib/                          # Utilities & services
│   │   ├── mongodb.ts                # Database connection
│   │   ├── customerService.ts        # Customer operations
│   │   ├── enquiryService.ts         # Enquiry operations
│   │   ├── bookingService.ts         # Booking operations
│   │   ├── userService.ts            # User operations
│   │   ├── packageService.ts         # Package operations
│   │   ├── metaService.ts            # Facebook integration
│   │   ├── wordpressSync.ts          # WordPress migration
│   │   └── auth.ts                   # Authentication logic
│   └── models/                       # Mongoose schemas
│       ├── Customer.ts               # Customer schema
│       ├── Enquiry.ts                # Enquiry schema
│       ├── Booking.ts                # Booking schema
│       ├── User.ts                   # User schema
│       └── YatraPackage.ts           # Package schema
├── docker-compose.yml                # Docker services (App + MongoDB)
├── Dockerfile                        # App container definition
├── .env.local                        # Local environment config
├── .env.docker                       # Docker environment template
├── docker-start.ps1                  # Windows startup script
├── docker-start.sh                   # Linux/Mac startup script
├── migrate-wordpress-contacts.js     # CLI migration tool
├── DOCKER_DEPLOYMENT_GUIDE.md        # Docker documentation
├── WORDPRESS_MIGRATION_GUIDE.md      # Migration documentation
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Password Hashing** - bcryptjs for secure password storage
3. **Environment Variables** - Sensitive data kept secure
4. **CORS Protection** - Controlled cross-origin requests
5. **Input Validation** - Schema validation with Mongoose
6. **HTTPS Ready** - Production-ready SSL/TLS support

## 🚀 Deployment

### Docker Deployment (Production)

```bash
# Build production image
docker-compose -f docker-compose.yml up -d

# MongoDB automatic backup
docker exec msty-crm-mongodb mongodump \
  --username mstymainak_db_user \
  --password Mahesh123
```

### Kubernetes (Advanced)

Convert docker-compose to Kubernetes manifests:
```bash
kompose convert -f docker-compose.yml
```

## 📊 Database Schema

### Customer
```
{
  name: String (required)
  email: String (required)
  phone: String
  age: Number
  address: String
  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String]
  }
  emergencyContact: {
    name: String,
    phone: String
  }
  createdAt: Date
  updatedAt: Date
}
```

### Enquiry
```
{
  customerId: ObjectId (ref: Customer)
  packageId: ObjectId (ref: YatraPackage)
  source: String (contact-form, facebook, wordpress, instagram)
  message: String
  status: String (new, contacted, interested, converted, lost)
  notes: String
  createdAt: Date
  updatedAt: Date
}
```

### Booking
```
{
  customerId: ObjectId (ref: Customer)
  packageId: ObjectId (ref: YatraPackage)
  enquiryId: ObjectId (ref: Enquiry)
  status: String (pending, confirmed, cancelled)
  totalPrice: Number
  paymentStatus: String (pending, paid, refunded)
  startDate: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### Docker Issues
See [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md#troubleshooting)

### WordPress Migration Issues
See [WORDPRESS_MIGRATION_GUIDE.md](./WORDPRESS_MIGRATION_GUIDE.md#troubleshooting)

### Local Development
```bash
# Clear cache
rm -rf .next node_modules
npm install

# Check MongoDB connection
npm run dev  # Check console logs

# Verify environment
cat .env.local
```

## 📞 Support

1. Check relevant documentation files
2. Review error logs: `docker-compose logs app`
3. Test API endpoints manually
4. Verify environment configuration
5. Check MongoDB connection status

## 📄 License

Private project for Mahesh Sharma Tirth Yatra

## 🤝 Contributing

Internal development. Contact project lead for guidelines.

## 📝 Changelog

### v0.1.0 (Current)
- Initial CRM system setup
- Customer and enquiry management
- Facebook Messenger integration
- WordPress contact migration
- Docker containerization
- Complete API endpoints
- Dashboard interface
- Authentication system

---

**Last Updated:** May 2026
**Maintained by:** Development Team
**Status:** ✅ Production Ready
