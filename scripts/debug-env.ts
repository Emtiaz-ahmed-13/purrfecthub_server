import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
const result = dotenv.config({ path: path.join(__dirname, '../.env') });

if (result.error) {
  console.log("❌ Error loading .env file:", result.error);
} else {
  console.log("✅ .env loaded successfully");
}

console.log("--- Debug Env Variables ---");
console.log(`SMTP_HOST: '${process.env.SMTP_HOST}'`);
console.log(`SMTP_USER: '${process.env.SMTP_USER}'`);
console.log(`IMAGEKIT_PUBLIC_KEY: ${process.env.IMAGEKIT_PUBLIC_KEY ? 'Present (Length: ' + process.env.IMAGEKIT_PUBLIC_KEY.length + ')' : 'MISSING'}`);
console.log(`IMAGEKIT_PRIVATE_KEY: ${process.env.IMAGEKIT_PRIVATE_KEY ? 'Present' : 'MISSING'}`);
console.log(`IMAGEKIT_URL_ENDPOINT: ${process.env.IMAGEKIT_URL_ENDPOINT ? 'Present' : 'MISSING'}`);
