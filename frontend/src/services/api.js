// Grab the API URL from our environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const registerGuest = async (guestData) => {
    const context = '[Frontend API Service]';
    console.log(`${context} Step 1: Initiating guest registration payload...`, guestData);

    try {
        console.log(`${context} Step 2: Sending POST request to ${API_URL}/guests/register`);
        
        // We use the native fetch API to send the data
        const response = await fetch(`${API_URL}/guests/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestData),
        });

        console.log(`${context} Step 3: Awaiting server response... Status: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
            // Failure Point L (Frontend API catch - Server rejected the payload)
            console.warn(`${context} Failure Point L: Server rejected the registration. Reason:`, data.message);
            throw new Error(data.message || 'Registration failed at the server layer.');
        }

        console.log(`${context} Step 4: Guest registration successful! ID: ${data.guestId}`);
        return data;

    } catch (error) {
        // Failure Point M (Network error, CORS block, or server is completely down)
        console.error(`${context} CRITICAL FAILURE (Failure Point M): Network error or API crash.`, error.message);
        throw error;
    }
};

// --- ADMIN READ PIPELINE ---
export const getAllGuests = async (page = 1, stateFilter = null) => {
    const context = '[Frontend API Service - getAllGuests]';
    console.log(`${context} Step 1: Initiating fetch for guest ledger. Page: ${page}, State: ${stateFilter}`);

    try {
        const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
        if (!adminKey) {
            console.error(`${context} Failure Point O: NEXT_PUBLIC_ADMIN_KEY missing from frontend .env.local!`);
            throw new Error('Admin key not configured on frontend.');
        }

        // Build the dynamic URL
        let url = `${API_URL}/guests?page=${page}`;
        if (stateFilter !== null && stateFilter !== '') {
            url += `&state=${stateFilter}`;
        }

        console.log(`${context} Step 2: Sending secure GET request to ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-admin-key': adminKey }
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point P: Server rejected admin fetch. Reason:`, data.message);
            throw new Error(data.message || 'Failed to fetch guests.');
        }

        console.log(`${context} Step 3: Successfully retrieved ${data.data.length} guests from backend.`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point Q): Network error during admin fetch.`, error.message);
        throw error;
    }
};

// --- ADMIN STATE TRANSITION PIPELINE ---
export const updateGuestState = async (guestId, newState, errorLog = null) => {
    const context = '[Frontend API Service - updateGuestState]';
    console.log(`${context} Step 1: Initiating state transition for ${guestId} to State ${newState}`);

    try {
        const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
        
        console.log(`${context} Step 2: Sending secure PATCH request to API...`);
        const response = await fetch(`${API_URL}/guests/${guestId}/state`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminKey
            },
            body: JSON.stringify({ newState, errorLog })
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point R: Server rejected state transition. Reason:`, data.message);
            throw new Error(data.message || 'Failed to update guest state.');
        }

        console.log(`${context} Step 3: State transition for ${guestId} committed successfully.`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point S): Network error during state transition.`, error.message);
        throw error;
    }
};