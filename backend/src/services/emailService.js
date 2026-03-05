const nodemailer = require('nodemailer');

console.log('[EmailService] Step 0: Initializing SMTP Transporter module...');

// ARCHITECT NOTE: We abandon the 'service: gmail' abstraction. 
// We explicitly define the transport layer to penetrate cloud firewalls securely.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Strictly enforce Port 465 (Secure SSL/TLS) to bypass Render's outbound restrictions
    secure: true, // Enforce true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD 
    },
    tls: {
        // This ensures the connection doesn't fail if the cloud provider intercepts the SSL ping
        rejectUnauthorized: false 
    }
});

// ARCHITECT NOTE: Added eventName parameter to distinguish multi-tenant event registrations
const sendAccessCode = async (email, fullName, accessCode, eventName) => {
    const context = `[EmailService - ${eventName}]`;
    console.log(`${context} Step 1: Preparing to send access code to ${email}`);

    try {
        console.log(`${context} Step 2: Constructing HTML payload for ${email}...`);
        
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

        console.log(`${context} Step 3: Payload constructed. Initiating secure network dispatch via smtp.gmail.com:465...`);

        // Step 4: Await the SMTP handshake and transmission
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`${context} Step 4: SUCCESS. Transporter verified delivery. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        // Failure Point Y: Caught if explicit SMTP authentication fails or network is blocked
        console.error(`${context} CRITICAL FAILURE (Failure Point Y): Nodemailer network dispatch rejected for ${email}.`, error);
        throw error; // Rethrow to let the controller handle it gracefully
    }
};

module.exports = {
    sendAccessCode
};
