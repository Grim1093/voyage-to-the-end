const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// ARCHITECT NOTE: The transport layer has been overhauled to use Nodemailer with Gmail OAuth2.
// This architecture penetrates Render's data center IP blocks and bypasses "sandbox" restrictions without requiring a custom domain.
// Strict Requirement: GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN must be in the environment variables.

logger.info('[EmailService]', 'Step 0: Initializing OAuth2-based SMTP Email API module...');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN
        }
    });
};

// --- 1. ACCESS CODE PIPELINE ---
const sendAccessCode = async (email, fullName, accessCode, eventName) => {
    const context = `[EmailService - Access - ${eventName}]`;
    logger.info(context, `Step 1: Preparing OAuth2 email payload for ${email}`);

    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_REFRESH_TOKEN) {
            logger.error(context, 'Failure Point E1: Missing OAuth2 environment variables.');
            throw new Error('Email OAuth2 credentials not configured in the Control Plane.');
        }

        logger.info(context, 'Step 2: Constructing HTML payload...');
        
        const htmlContent = `
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
        `;

        logger.info(context, 'Step 3: Initiating secure OAuth2 SMTP dispatch...');

        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: `Your Access Code for ${eventName}`,
            html: htmlContent
        });

        logger.info(context, `Step 4: SUCCESS. Transporter verified delivery. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error(context, `Failure Point E2: Network or SMTP dispatch pipeline shattered. Details: ${error.message}`);
        throw error; 
    }
};

// --- 2. THE ABYSS DISSOLVE PIPELINE ---
const sendMeshExport = async (targetEmail, targetName, eventName, connections) => {
    const context = `[EmailService - Abyss Export - ${eventName}]`;
    logger.info(context, `Step 1: Preparing Mesh Export payload for ${targetEmail} with ${connections.length} echos.`);

    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_REFRESH_TOKEN) {
            logger.error(context, 'Failure Point E3: Missing OAuth2 environment variables.');
            throw new Error('Email OAuth2 credentials not configured.');
        }

        let connectionsHtml = '';
        if (connections.length === 0) {
            connectionsHtml = '<p>You did not finalize any echos during this event.</p>';
        } else {
            connectionsHtml = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #111827; color: #ffffff; text-align: left;">
                            <th style="padding: 12px; border: 1px solid #374151;">Name</th>
                            <th style="padding: 12px; border: 1px solid #374151;">Email</th>
                            <th style="padding: 12px; border: 1px solid #374151;">Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${connections.map(conn => `
                            <tr>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>${conn.full_name}</strong></td>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;"><a href="mailto:${conn.email}" style="color: #2563eb;">${conn.email}</a></td>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;">${conn.phone || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        logger.info(context, 'Step 2: Dynamic HTML matrix generated. Constructing final transport payload...');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #111827; margin: 0;">${eventName}</h1>
                    <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">The Abyss Dissolved</p>
                </div>
                
                <p>Hello ${targetName},</p>
                <p>The event has concluded, and the ephemeral network has been permanently dissolved. Below is the finalized graph of the echos you secured during your session.</p>
                
                ${connectionsHtml}
                
                <br/>
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 40px;">
                    This is an automated transmission from the Nexus Control Plane.
                </p>
            </div>
        `;

        logger.info(context, 'Step 3: Initiating OAuth2 SMTP dispatch for Mesh Export...');

        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: targetEmail,
            subject: `Your Connections from ${eventName} - The Abyss`,
            html: htmlContent
        });

        logger.info(context, `Step 4: SUCCESS. Abyss Export delivered to ${targetEmail}. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        logger.error(context, `Failure Point E4: Network failure on Mesh Export. Details: ${error.message}`);
        throw error; 
    }
};

module.exports = {
    sendAccessCode,
    sendMeshExport
};