import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DigiLockerRequest from '@/lib/models/DigiLockerRequest';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { requestId, action } = await req.json();

    if (!requestId || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const request = await DigiLockerRequest.findByIdAndUpdate(
      requestId,
      {
        status: action,
        respondedAt: new Date(),
        citizenResponse: action === 'approved' ? 'Access granted' : 'Access denied'
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
