import mongoose, { Schema, Document } from 'mongoose';

export interface IDigiLockerVault extends Document {
  citizenAadhar: string;
  citizenName: string;
  citizenEmail: string;
  documentType: 'aadhaar_card' | 'land_deed';
  ipfsHash: string;
  fileName: string;
  uploadedBy: string;
  isVerified: boolean;
  verifiedAt: Date;
}

const DigiLockerVaultSchema = new Schema({
  citizenAadhar: { type: String, required: true },
  citizenName: { type: String, required: true },
  citizenEmail: { type: String, required: true },
  documentType: { type: String, enum: ['aadhaar_card', 'land_deed'], required: true },
  ipfsHash: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedBy: { type: String, required: true, default: 'government_authority' },
  isVerified: { type: Boolean, default: true },
  verifiedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.DigiLockerVault ||
  mongoose.model<IDigiLockerVault>('DigiLockerVault', DigiLockerVaultSchema);
