import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, or, ilike, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const role = searchParams.get('role');

    if (!query || !role) {
      return NextResponse.json({ error: 'Query and role are required' }, { status: 400 });
    }

    const users = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(
        and(
          eq(user.role, role),
          or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`)),
        ),
      )
      .limit(10);

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
