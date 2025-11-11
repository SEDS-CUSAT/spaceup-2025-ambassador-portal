import mongoose from "mongoose";

const AmbassadorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    whatsapp_status: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        points: { type: Number, default: 0 },
        approval_status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    ],
    instagram_story: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        points: { type: Number, default: 0 },
        approval_status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    ],
    whatsapp_group: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        points: { type: Number, default: 0 },
        approval_status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    ],
    role: {
      type: String,
      enum: ["ambassador", "coordinator", "admin"],
      default: "ambassador",
    },
    manualPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Ambassador = mongoose.models.Ambassador || mongoose.model("Ambassador", AmbassadorSchema);

export default Ambassador;
