import 'dotenv/config';
import { db } from '../src/db';
import { user, account } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Hash password using bcrypt (compatible with better-auth)
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

const DEFAULT_ADMIN = {
  email: 'admin@myscholar.com',
  password: 'Admin@123',
  name: 'Admin User',
  role: 'admin',
};

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Check if admin user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, DEFAULT_ADMIN.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping seed.');
      console.log(`Email: ${DEFAULT_ADMIN.email}`);
      return;
    }

    // Create admin user
    const userId = crypto.randomUUID();
    const now = new Date();

    await db.insert(user).values({
      id: userId,
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      emailVerified: true, // Auto-verify admin
      role: DEFAULT_ADMIN.role,
      createdAt: now,
      updatedAt: now,
      banned: false,
      image: null,
      banReason: null,
      banExpires: null,
    });

    // Create account with hashed password
    const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
    const accountId = crypto.randomUUID();

    await db
      .insert(account)
      .values({
        id: accountId,
        accountId: DEFAULT_ADMIN.email,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
      });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`Email: ${DEFAULT_ADMIN.email}`);
    console.log(`Password: ${DEFAULT_ADMIN.password}`);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
