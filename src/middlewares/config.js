const dotenv = require("dotenv");

// getting all ENV variables before starting another processes
dotenv.config();

module.exports = {
    mongoDbUrl: process.env.MONGO_DB_URL,
    tokenSecretKey: process.env.TOKEN_SECRET_KEY,
    customerTokenSecretKey: process.env.CUSTOMER_TOKEN_SECRET_KEY,
    port: process.env.PORT,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioAccSID: process.env.TWILIO_ACCOUNT_SID,
    twilioVerifySID: process.env.TWILIO_VERIFY_SID,
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsS3Region: process.env.S3_REGION,
    awsS3Bucket: process.env.S3_BUCKET,
};
