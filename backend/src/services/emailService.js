const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Step 1: Configure the Transporter (The Mail Carrier)
// We pull credentials from the secure environment variables so they never touch the codebase.
const transporter = nodemailer.createTransport({
    service: 'gmail', // For production, you might swap this to AWS SES, SendGrid, or Mailgun
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD 
    }
});

// ARCHITECT NOTE: Added eventName parameter to distinguish multi-tenant event registrations
const sendAccessCode = async (email, fullName, accessCode, eventName) => {
    const context = 'EmailService';
    logger.info(context, `Step 1: Preparing to send access code for event [${eventName}] to ${email}`);

    try {
        // Step 2: Construct the email payload dynamically with the event name
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Your Access Code for ${eventName}`,
            text: `Hello ${fullName},\n\nYour registration for ${eventName} is confirmed. Your secure access code is: ${accessCode}\n\nPlease keep this code safe. You will need it to access your personalized event dashboard.\n\nBest,\nThe ${eventName} Team`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to ${eventName}, ${fullName}!</h2>
                    <p>Your registration is confirmed. To track your verification status and access your dashboard for <strong>${eventName}</strong>, use the secure code below:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="letter-spacing: 5px; color: #2563eb; margin: 0;">${accessCode}</h1>
                    </div>
                    <p>Keep this code safe. Do not share it with anyone.</p>
                    <br/>
                    <p>Best regards,<br/><strong>The ${eventName} Administration Team</strong></p>
                </div>
            `
        };

        logger.info(context, `Step 2: Payload constructed for ${email}. Attempting network dispatch...`);

        // Step 3: Send the email
        const info = await transporter.sendMail(mailOptions);
        
        logger.info(context, `Step 3: SUCCESS. Email dispatched! Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        // Failure Point Y: Caught if SMTP authentication fails or network is down
        logger.error(context, `CRITICAL FAILURE (Failure Point Y): Nodemailer failed to dispatch email to ${email}.`, error);
        throw error; // Rethrow to let the controller handle it gracefully
    }
};

module.exports = {
    sendAccessCode
};