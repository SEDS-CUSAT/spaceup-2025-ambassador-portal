const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.API_KEY;
const PORT = 3040; // Based on package.json "dev": "next dev -p 3040"
const BASE_URL = `http://localhost:${PORT}`;

async function verifyReferralCode(code) {
  if (!API_KEY) {
    console.error('Error: API_KEY is not defined in .env file');
    process.exit(1);
  }

  const url = `${BASE_URL}/api/ambassadors/referrals/verify`;
  
  console.log(`Testing URL: ${url}`);
  console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);
  console.log(`Verifying code: ${code}`);
  console.log('-----------------------------------');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ referralCode: code })
    });

    const data = await response.json();

    console.log(`Status Code: ${response.status}`);
    console.log('Response Body:');
    console.dir(data, { depth: null, colors: true });

  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    console.log('\nMake sure the development server is running on port ' + PORT);
    console.log('Run: npm run dev');
  }
}

// Get code from command line arg or use default
const codeToTest = process.argv[2] || 'NAN-6EEB45';

verifyReferralCode(codeToTest);
