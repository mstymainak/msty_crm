/**
 * WordPress to MongoDB Contact Migration Service
 * Fetches contacts from WordPress (form submissions, users, posts)
 * Excludes file attachments (photos, PDFs, docs)
 * Imports into MongoDB Customer collection
 */

import axios from 'axios';
import dbConnect from './mongodb';
import Customer from '@/models/Customer';

interface WordPressContact {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  address?: string;
  message?: string;
  submittedAt?: Date;
}

class WordPressSyncService {
  private wpUrl: string;
  private wpUser: string;
  private wpPassword: string;
  private axiosInstance: any;

  constructor() {
    this.wpUrl = process.env.WORDPRESS_URL || 'https://tirthyatrawala.com';
    this.wpUser = process.env.WORDPRESS_API_USER || 'admin';
    this.wpPassword = process.env.WORDPRESS_API_PASSWORD || '';

    // Create axios instance with Basic Auth
    const auth = Buffer.from(`${this.wpUser}:${this.wpPassword}`).toString('base64');
    this.axiosInstance = axios.create({
      baseURL: `${this.wpUrl}/wp-json/wp/v2`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  /**
   * Fetch contacts from WordPress Users endpoint
   */
  async fetchWordPressUsers(): Promise<WordPressContact[]> {
    try {
      console.log('📥 Fetching WordPress users...');
      const response = await this.axiosInstance.get('/users', {
        params: {
          per_page: 100,
          exclude: [1], // Exclude admin user
        },
      });

      const contacts: WordPressContact[] = response.data.map((user: any) => ({
        name: user.name || user.username || 'Unknown',
        email: user.email || '',
        phone: user.meta?.phone || user.acf?.phone || '',
        age: user.meta?.age || user.acf?.age,
        address: user.meta?.address || user.acf?.address || '',
        submittedAt: new Date(user.date_created || Date.now()),
      })).filter((c: WordPressContact) => c.name && c.email); // Filter out incomplete records

      console.log(`✅ Fetched ${contacts.length} users from WordPress`);
      return contacts;
    } catch (error: any) {
      console.error('❌ Error fetching WordPress users:', error.message);
      return [];
    }
  }

  /**
   * Fetch contact form submissions from Contact Form 7 posts
   * Assumes CF7 stores submissions in a custom post type
   */
  async fetchContactFormSubmissions(): Promise<WordPressContact[]> {
    try {
      console.log('📥 Fetching Contact Form 7 submissions...');
      
      // Try to fetch from custom post type if available
      const response = await this.axiosInstance.get('/contact-form-7', {
        params: {
          per_page: 100,
          status: 'publish',
        },
      }).catch(() => ({ data: [] }));

      const contacts: WordPressContact[] = [];

      for (const form of response.data) {
        // Parse form content to extract stored submission data
        if (form.meta?.submissions) {
          const submissions = form.meta.submissions;
          if (Array.isArray(submissions)) {
            submissions.forEach((submission: any) => {
              contacts.push({
                name: submission.name || 'Unknown',
                email: submission.email || '',
                phone: submission.phone || '',
                message: submission.message || '',
                submittedAt: new Date(submission.submitted_at || Date.now()),
              });
            });
          }
        }
      }

      console.log(`✅ Fetched ${contacts.length} form submissions`);
      return contacts;
    } catch (error: any) {
      console.error('⚠️ Contact Form 7 data not available:', error.message);
      return [];
    }
  }

  /**
   * Fetch custom contact posts (if stored as WordPress posts)
   */
  async fetchCustomPostContacts(): Promise<WordPressContact[]> {
    try {
      console.log('📥 Fetching custom contact posts...');
      
      const response = await this.axiosInstance.get('/posts', {
        params: {
          per_page: 100,
          type: ['contacts', 'enquiry', 'contact-form'],
          status: 'publish',
        },
      }).catch(() => ({ data: [] }));

      const contacts = response.data.map((post: any) => ({
        name: post.meta?.contact_name || post.title?.rendered || 'Unknown',
        email: post.meta?.contact_email || '',
        phone: post.meta?.contact_phone || '',
        age: post.meta?.contact_age,
        address: post.meta?.contact_address || '',
        message: post.content?.rendered?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
        submittedAt: new Date(post.date),
      }));

      console.log(`✅ Fetched ${contacts.length} custom contact posts`);
      return contacts;
    } catch (error: any) {
      console.error('⚠️ Custom post contacts not available:', error.message);
      return [];
    }
  }

  /**
   * Clean and validate contact data
   */
  private validateContact(contact: WordPressContact): boolean {
    // Must have at least name and email or phone
    return !!(contact.name && (contact.email || contact.phone));
  }

  /**
   * Main sync function - fetches all contacts and imports to MongoDB
   */
  async syncAllContacts(): Promise<{ imported: number; skipped: number; errors: number }> {
    try {
      await dbConnect();

      // Fetch from all sources
      const [users, formSubmissions, customPosts] = await Promise.all([
        this.fetchWordPressUsers(),
        this.fetchContactFormSubmissions(),
        this.fetchCustomPostContacts(),
      ]);

      // Combine and deduplicate
      const allContacts = [...users, ...formSubmissions, ...customPosts];
      const uniqueContacts = this.deduplicateContacts(allContacts);
      
      console.log(`\n📊 Total unique contacts found: ${uniqueContacts.length}`);

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      // Import into MongoDB
      for (const contact of uniqueContacts) {
        try {
          if (!this.validateContact(contact)) {
            console.log(`⏭️  Skipping invalid contact: ${contact.name}`);
            skipped++;
            continue;
          }

          // Check if already exists (by email or phone)
          const existing = await Customer.findOne({
            $or: [
              { email: contact.email },
              { phone: contact.phone },
            ],
          });

          if (existing) {
            console.log(`⏭️  Contact already exists: ${contact.name}`);
            skipped++;
            continue;
          }

          // Create new customer
          await Customer.create({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            age: contact.age,
            address: contact.address,
            createdAt: contact.submittedAt || new Date(),
          });

          imported++;
          console.log(`✅ Imported: ${contact.name} (${contact.email || contact.phone})`);
        } catch (err: any) {
          errors++;
          console.error(`❌ Error importing ${contact.name}:`, err.message);
        }
      }

      const summary = `\n${'='.repeat(50)}\n📈 MIGRATION SUMMARY\n${'='.repeat(50)}\n✅ Imported: ${imported}\n⏭️  Skipped (duplicates/invalid): ${skipped}\n❌ Errors: ${errors}\nTotal processed: ${imported + skipped + errors}\n${'='.repeat(50)}`;
      console.log(summary);

      return { imported, skipped, errors };
    } catch (error: any) {
      console.error('❌ Sync error:', error.message);
      throw error;
    }
  }

  /**
   * Deduplicate contacts by email and phone
   */
  private deduplicateContacts(contacts: WordPressContact[]): WordPressContact[] {
    const seen = new Set<string>();
    const unique: WordPressContact[] = [];

    for (const contact of contacts) {
      const key = `${contact.email}${contact.phone}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(contact);
      }
    }

    return unique;
  }
}

export default new WordPressSyncService();
