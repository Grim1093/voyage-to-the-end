// ARCHITECT NOTE: Nodemailer and raw SMTP protocols are completely purged from this architecture.
// We are pivoting to a direct HTTPS REST API transport (Port 443) to guarantee firewall penetration.

console.log('[EmailService] Step 0: Initializing HTTP-based Email API module...');

// ARCHITECT NOTE: Added eventName parameter to distinguish multi-tenant event registrations
const sendAccessCode = async (email, fullName, accessCode, eventName) => {
    const context = `[EmailService - ${eventName}]`;
    console.log(`${context} Step 1: Preparing HTTP email payload for ${email}`);

    try {
        // Infrastructure Check: Prevent silent failures if the environment is misconfigured
        if (!process.env.RESEND_API_KEY) {
            console.error(`${context} CRITICAL FAILURE: RESEND_API_KEY environment variable is missing from Render.`);
            throw new Error('Email API key not configured in the Control Plane.');
        }

        console.log(`${context} Step 2: Constructing JSON payload for HTTP dispatch...`);
        
        // Construct the exact JSON structure required by the Resend REST API
        const payload = {
            // If you verify a custom domain later, change this. Resend allows 'onboarding@resend.dev' for testing.
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev', 
            to: [email],
            subject: `Your Access Code for ${eventName}`,
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

        console.log(`${context} Step 3: Payload constructed. Initiating secure HTTPS dispatch to Resend API (Port 443)...`);

        // Step 4: Network Dispatch via native Node.js fetch
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // Failure Point Y: Caught if the API rejects our payload (e.g., invalid email formatting, bad API key)
            console.error(`${context} Failure Point Y: External API rejected the payload. Reason:`, data);
            throw new Error(data.message || 'Email API strictly rejected the HTTP request.');
        }
        
        console.log(`${context} Step 4: SUCCESS. HTTP Transporter verified delivery. Provider Trace ID: ${data.id}`);
        return true;

    } catch (error) {
        // Failure Point Z: Caught if the network is completely down and the fetch fails to execute
        console.error(`${context} CRITICAL FAILURE (Failure Point Z): Network or API dispatch pipeline shattered for ${email}.`, error.message);
        throw error; // Rethrow to the controller
    }
};

module.exports = {
    sendAccessCode
};
