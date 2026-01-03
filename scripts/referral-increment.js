// Run: deno run --allow-net --allow-env scripts/referral-increment.js
import "jsr:@std/dotenv/load";

const API_URL = Deno.env.get("NEXTAUTH_URL") || 'http://localhost:3040';
const REFERRAL_ENDPOINT = `${API_URL}/api/ambassadors/referrals/increment`;
const API_KEY = Deno.env.get("API_KEY") || '';
const REFERRAL_CODE = process.env.REFERRAL_CODE || '';

const incrementReferralCount = async (referralCode) => {
    try {
        const response = await fetch(REFERRAL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                referralCode: referralCode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error incrementing referral count:', data);
            return;
        }

        console.log('Referral count incremented successfully:', data);
    } catch (error) {
        console.error('Error incrementing referral count:', error.message);
    }
};

incrementReferralCount(REFERRAL_CODE);