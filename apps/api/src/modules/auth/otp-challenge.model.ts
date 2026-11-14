import { Schema, model } from 'mongoose';
const otpChallengeSchema = new Schema({
  emailHash: { type: String, required: true, unique: true },
  challengeId: { type: String, required: true, unique: true },
  sessionHash: { type: String, required: true },
  codeHash: { type: String, required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  expiresAt: { type: Date, required: true },
  nextSendAt: { type: Date, required: true },
  windowEnd: { type: Date, required: true },
  sendCount: { type: Number, required: true },
  attempts: { type: Number, default: 0 },
  usedAt: { type: Date, default: null },
  // Keep cooldown/send-count records beyond code expiry; expiry is always checked explicitly.
  purgeAt: { type: Date, required: true },
}, { timestamps: true, strict: 'throw' });
otpChallengeSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
export const OtpChallenge = model('OtpChallenge', otpChallengeSchema);
