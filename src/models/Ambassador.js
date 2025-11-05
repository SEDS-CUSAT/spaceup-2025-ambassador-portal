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
    role: {
      type: String,
      enum: ["ambassador", "coordinator", "admin"],
      default: "ambassador",
    },
  },
  {
    timestamps: true,
  },
);

const Ambassador = mongoose.models.Ambassador || mongoose.model("Ambassador", AmbassadorSchema);

export default Ambassador;
