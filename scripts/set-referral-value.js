const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const REFERRAL_CODE = process.env.REFERRAL_CODE || '';
const TARGET_VALUE = 0;

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is not set.");
    process.exit(1);
}

const setReferralValue = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Access the collection directly to avoid importing ESM models in CJS script
        const collection = mongoose.connection.db.collection("ambassadors");

        const result = await collection.updateOne(
            { referralCode: REFERRAL_CODE },
            { $set: { totalReferrals: TARGET_VALUE } }
        );

        if (result.matchedCount === 0) {
            console.log(`No ambassador found with referral code: ${REFERRAL_CODE}`);
        } else {
            console.log(`Successfully updated referral count for ${REFERRAL_CODE} to ${TARGET_VALUE}.`);
            console.log(`Modified count: ${result.modifiedCount}`);
        }

    } catch (error) {
        console.error("Error updating referral count:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Connection closed.");
    }
};

setReferralValue();
