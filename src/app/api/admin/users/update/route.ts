import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin(req);

    const body = await req.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { message: 'User ID and name are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Update user name
    await db
      .update(user)
      .set({ name: name.trim() })
      .where(eq(user.id, userId));

    return NextResponse.json({
      message: 'User name updated successfully',
      userId,
      name: name.trim(),
    });
  } catch (error) {
    console.error('Error updating user name:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to update user name' },
      { status: 500 }
    );
  }
}
