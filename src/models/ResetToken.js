import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Ambassador', 'Admin']
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index to automatically delete expired tokens
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure only one token exists per user
ResetTokenSchema.index({ userId: 1, userModel: 1 }, { unique: true });

const ResetToken = mongoose.models.ResetToken || mongoose.model("ResetToken", ResetTokenSchema);

export default ResetToken;
