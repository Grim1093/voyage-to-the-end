// ARCHITECT NOTE: Nodemailer and raw SMTP protocols are completely purged from this architecture.
// We are pivoting to a direct HTTPS REST API transport (Port 443) to guarantee firewall penetration.

console.log('[EmailService] Step 0: Initializing HTTP-based Email API module...');

// --- 1. ACCESS CODE PIPELINE ---
const sendAccessCode = async (email, fullName, accessCode, eventName) => {
    const context = `[EmailService - Access - ${eventName}]`;
    console.log(`${context} Step 1: Preparing HTTP email payload for ${email}`);

    try {
        if (!process.env.RESEND_API_KEY) {
            console.error(`${context} CRITICAL FAILURE: RESEND_API_KEY environment variable is missing.`);
            throw new Error('Email API key not configured in the Control Plane.');
        }

        console.log(`${context} Step 2: Constructing JSON payload for HTTP dispatch...`);
        
        const payload = {
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

        console.log(`${context} Step 3: Initiating secure HTTPS dispatch to Resend API (Port 443)...`);

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
            console.error(`${context} Failure Point Y: External API rejected the payload. Reason:`, data);
            throw new Error(data.message || 'Email API strictly rejected the HTTP request.');
        }
        
        console.log(`${context} Step 4: SUCCESS. HTTP Transporter verified delivery. Provider Trace ID: ${data.id}`);
        return true;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point Z): Network or API dispatch pipeline shattered.`, error.message);
        throw error; 
    }
};

// --- 2. THE ABYSS DISSOLVE PIPELINE ---
const sendMeshExport = async (targetEmail, targetName, eventName, connections) => {
    const context = `[EmailService - Abyss Export - ${eventName}]`;
    console.log(`${context} Step 1: Preparing Mesh Export payload for ${targetEmail} with ${connections.length} echos.`);

    try {
        if (!process.env.RESEND_API_KEY) {
            console.error(`${context} CRITICAL FAILURE: RESEND_API_KEY environment variable is missing.`);
            throw new Error('Email API key not configured.');
        }

        // Generate dynamic HTML for the connections list
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

        console.log(`${context} Step 2: Dynamic HTML matrix generated. Constructing final JSON payload...`);

        const payload = {
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev', 
            to: [targetEmail],
            subject: `Your Connections from ${eventName} - The Abyss`,
            html: `
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
            `
        };

        console.log(`${context} Step 3: Initiating HTTPS dispatch to Resend...`);

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
            console.error(`${context} Failure Point Y: External API rejected the Mesh Export. Reason:`, data);
            throw new Error(data.message || 'Email API rejected the HTTP request.');
        }
        
        console.log(`${context} Step 4: SUCCESS. Abyss Export delivered to ${targetEmail}. Trace ID: ${data.id}`);
        return true;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point Z): Network failure on Mesh Export.`, error.message);
        throw error; 
    }
};

module.exports = {
    sendAccessCode,
    sendMeshExport
};