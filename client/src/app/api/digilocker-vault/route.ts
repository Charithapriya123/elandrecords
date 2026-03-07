import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DigiLockerVault from '@/lib/models/DigiLockerVault';

// GET - fetch documents for a citizen by aadhar
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const aadhar = searchParams.get('aadhar');
    const email = searchParams.get('email');

    if (!aadhar && !email) {
      return NextResponse.json({ error: 'Aadhar or email required' }, { status: 400 });
    }

    const query = aadhar ? { citizenAadhar: aadhar } : { citizenEmail: email };
    const documents = await DigiLockerVault.find(query);
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST - authority uploads document for citizen
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { citizenAadhar, citizenName, citizenEmail, documentType, ipfsHash, fileName, uploadedBy } = body;

    if (!citizenAadhar || !citizenName || !citizenEmail || !documentType || !ipfsHash || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if document already exists — update if so
    const existing = await DigiLockerVault.findOne({ citizenAadhar, documentType });
    if (existing) {
      existing.ipfsHash = ipfsHash;
      existing.fileName = fileName;
      existing.verifiedAt = new Date();
      await existing.save();
      return NextResponse.json({ success: true, data: existing, updated: true });
    }

    const doc = await DigiLockerVault.create({
      citizenAadhar, citizenName, citizenEmail,
      documentType, ipfsHash, fileName,
      uploadedBy: uploadedBy || 'government_authority',
      isVerified: true,
      verifiedAt: new Date()
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
