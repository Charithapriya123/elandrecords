import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DigiLockerRequest from '@/lib/models/DigiLockerRequest';
import { getSessionCookieName } from '@/lib/utils/auth';
import { getSession } from '@/lib/utils/session';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const cookieName = getSessionCookieName('user');
    const sessionToken = req.cookies.get(cookieName)?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, action, response } = await req.json();
    if (!requestId || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const request = await DigiLockerRequest.findOneAndUpdate(
      { _id: requestId, citizenUsername: session.username, status: 'pending' },
      {
        status: action,
        respondedAt: new Date(),
        citizenResponse: response || (action === 'approved' ? 'Access granted' : 'Access denied')
      },
      { new: true }
    );

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
  }
}
