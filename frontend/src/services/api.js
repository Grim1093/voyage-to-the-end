// Grab the API URL from our environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const registerGuest = async (guestData) => {
    const context = '[Frontend API Service]';
    console.log(`${context} Step 1: Initiating guest registration payload...`, guestData);

    try {
        console.log(`${context} Step 2: Sending POST request to ${API_URL}/guests/register`);
        
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
            console.warn(`${context} Failure Point L: Server rejected the registration. Reason:`, data.message);
            throw new Error(data.message || 'Registration failed at the server layer.');
        }

        console.log(`${context} Step 4: Guest registration successful! ID: ${data.guestId}`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point M): Network error or API crash.`, error.message);
        throw error;
    }
};

// --- SESSION VALIDATOR ---
const getValidSessionKey = (context) => {
    if (typeof window === 'undefined') return null;

    const sessionString = sessionStorage.getItem('adminSession');
    if (!sessionString) {
        console.error(`${context} Failure Point O: Session data missing!`);
        throw new Error('Unauthorized: Please log in.');
    }

    try {
        const sessionData = JSON.parse(sessionString);
        
        if (Date.now() > sessionData.expiresAt) {
            console.warn(`${context} Failure Point W: Session TTL expired. Purging vault.`);
            sessionStorage.removeItem('adminSession');
            throw new Error('Session Expired: Your secure session has timed out.');
        }

        return sessionData.key;
    } catch (error) {
        if (error.message.includes('Session Expired')) throw error;
        console.error(`${context} Failure Point X: Session data corrupted.`);
        sessionStorage.removeItem('adminSession');
        throw new Error('Unauthorized: Invalid session data.');
    }
};

// --- ADMIN READ PIPELINE ---
export const getAllGuests = async (page = 1, stateFilter = null) => {
    const context = '[Frontend API Service - getAllGuests]';
    console.log(`${context} Step 1: Initiating fetch for guest ledger. Page: ${page}, State: ${stateFilter}`);

    try {
        const adminKey = getValidSessionKey(context);
        
        if (!adminKey) {
            console.error(`${context} Failure Point O: Admin key missing from sessionStorage! User is unauthenticated.`);
            throw new Error('Unauthorized: Please log in.');
        }

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
        const adminKey = getValidSessionKey(context);
        
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

// --- GUEST PORTAL PIPELINE ---
export const loginGuest = async (email, accessCode) => {
    const context = '[Frontend API Service - loginGuest]';
    console.log(`${context} Step 1: Initiating guest portal login for ${email}`);

    try {
        console.log(`${context} Step 2: Sending POST request to ${API_URL}/guests/login`);
        
        const response = await fetch(`${API_URL}/guests/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, accessCode }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point DD: Server rejected login. Reason:`, data.message);
            throw new Error(data.message || 'Login failed at the server layer.');
        }

        console.log(`${context} Step 3: Login successful! Retrieved guest data.`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point DD): Network error or API crash.`, error.message);
        throw error;
    }
};

// --- NEW LIVE STATE SYNC PIPELINE ---
export const fetchGuestStatus = async (guestId) => {
    const context = '[Frontend API Service - fetchGuestStatus]';
    console.log(`${context} Step 1: Initiating live status sync for guest ID: ${guestId}`);

    try {
        console.log(`${context} Step 2: Sending GET request to ${API_URL}/guests/${guestId}/status`);
        
        const response = await fetch(`${API_URL}/guests/${guestId}/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point GG: Server rejected status sync. Reason:`, data.message);
            throw new Error(data.message || 'Failed to fetch live status.');
        }

        console.log(`${context} Step 3: Live status synced successfully! Current State: ${data.currentState}`);
        return data.currentState;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point GG): Network error during status sync.`, error.message);
        throw error;
    }
};