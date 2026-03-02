// Grab the API URL from our environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const registerGuest = async (eventSlug, guestData) => {
    const context = `[Frontend API Service - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating guest registration payload...`, guestData);

    try {
        console.log(`${context} Step 2: Sending POST request to ${API_URL}/guests/${eventSlug}/register`);
        
        const response = await fetch(`${API_URL}/guests/${eventSlug}/register`, {
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
export const getAllGuests = async (eventSlug, page = 1, limit = 10, stateFilter = null) => {
    const context = `[Frontend API Service - getAllGuests - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating fetch for guest ledger. Page: ${page}, Limit: ${limit}, State: ${stateFilter}`);

    try {
        const adminKey = getValidSessionKey(context);
        
        if (!adminKey) {
            console.error(`${context} Failure Point O: Admin key missing from sessionStorage! User is unauthenticated.`);
            throw new Error('Unauthorized: Please log in.');
        }

        const params = new URLSearchParams({
            page: page,
            limit: limit
        });
        
        if (stateFilter !== null && stateFilter !== '') {
            params.append('state', stateFilter);
        }

        const url = `${API_URL}/guests/${eventSlug}?${params.toString()}`;

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

        console.log(`${context} Step 3: Successfully retrieved ${data.data?.length || 0} guests from backend.`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE (Failure Point Q): Network error during admin fetch.`, error.message);
        throw error;
    }
};

// --- NEW LAZY LOAD GUEST DETAIL PIPELINE ---
export const fetchGuestDetails = async (eventSlug, guestId) => {
    const context = `[Frontend API Service - fetchGuestDetails - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating fetch for extended guest profile ID: ${guestId}`);

    try {
        const adminKey = getValidSessionKey(context);
        if (!adminKey) throw new Error('Unauthorized: Please log in.');

        const url = `${API_URL}/guests/${eventSlug}/${guestId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-admin-key': adminKey }
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point F-G8: Server rejected detail fetch.`, data.message);
            throw new Error(data.message || 'Failed to fetch extended guest details.');
        }

        return data.data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error fetching guest details.`, error.message);
        throw error;
    }
};

// --- ADMIN STATE TRANSITION PIPELINE ---
export const updateGuestState = async (eventSlug, guestId, newState, errorLog = null) => {
    const context = `[Frontend API Service - updateGuestState - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating state transition for ${guestId} to State ${newState}`);

    try {
        const adminKey = getValidSessionKey(context);
        
        console.log(`${context} Step 2: Sending secure PATCH request to API...`);
        const response = await fetch(`${API_URL}/guests/${eventSlug}/${guestId}/state`, {
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
export const loginGuest = async (eventSlug, email, accessCode) => {
    const context = `[Frontend API Service - loginGuest - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating guest portal login for ${email}`);

    try {
        console.log(`${context} Step 2: Sending POST request to ${API_URL}/guests/${eventSlug}/login`);
        
        const response = await fetch(`${API_URL}/guests/${eventSlug}/login`, {
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
export const fetchGuestStatus = async (eventSlug, guestId) => {
    const context = `[Frontend API Service - fetchGuestStatus - ${eventSlug}]`;
    console.log(`${context} Step 1: Initiating live status sync for guest ID: ${guestId}`);

    try {
        console.log(`${context} Step 2: Sending GET request to ${API_URL}/guests/${eventSlug}/${guestId}/status`);
        
        const response = await fetch(`${API_URL}/guests/${eventSlug}/${guestId}/status`, {
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

// --- EVENT MANAGEMENT PIPELINES ---

export const fetchPublicEvents = async () => {
    const context = '[Frontend API Service - fetchPublicEvents]';
    console.log(`${context} Step 1: Fetching public events directory.`);

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point EV-F1: Failed to fetch public events.`, data.message);
            throw new Error(data.message || 'Failed to fetch public events.');
        }

        return data.data; 

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error during event fetch.`, error.message);
        throw error;
    }
};

// ARCHITECT NOTE: The highly secured Master Admin Fetcher
export const fetchAllAdminEvents = async () => {
    const context = '[Frontend API Service - fetchAllAdminEvents]';
    console.log(`${context} Step 1: Fetching master ledger of all tenants.`);

    try {
        const adminKey = getValidSessionKey(context);
        if (!adminKey) throw new Error('Unauthorized: Please log in.');

        const response = await fetch(`${API_URL}/events/admin/all`, {
            method: 'GET',
            headers: { 'x-admin-key': adminKey }
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point EV-F11: Failed to fetch master ledger.`, data.message);
            throw new Error(data.message || 'Failed to fetch the master ledger.');
        }

        return data.data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error fetching master ledger.`, error.message);
        throw error;
    }
};

export const fetchEventDetails = async (eventSlug) => {
    const context = `[Frontend API Service - fetchEventDetails - ${eventSlug}]`;
    console.log(`${context} Step 1: Fetching specific event metadata.`);

    try {
        const response = await fetch(`${API_URL}/events/${eventSlug}`, {
            method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point EV-F2: Failed to fetch event details.`, data.message);
            throw new Error(data.message || 'Event not found.');
        }

        return data.data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error fetching event ${eventSlug}.`, error.message);
        throw error;
    }
};

export const createEvent = async (eventData) => {
    const context = '[Frontend API Service - createEvent]';
    console.log(`${context} Step 1: Initiating event creation payload...`, eventData);

    try {
        const adminKey = getValidSessionKey(context);

        if (!adminKey) {
            throw new Error('Unauthorized: Please log in.');
        }

        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminKey
            },
            body: JSON.stringify(eventData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point EV-F3: Server rejected event creation.`, data.message);
            throw new Error(data.message || 'Failed to create new event.');
        }

        console.log(`${context} Step 2: Event created successfully!`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error during event creation.`, error.message);
        throw error;
    }
};

export const updateEventDetails = async (currentSlug, eventData) => {
    const context = `[Frontend API Service - updateEventDetails - ${currentSlug}]`;
    console.log(`${context} Step 1: Initiating event update payload...`, eventData);

    try {
        const adminKey = getValidSessionKey(context);

        if (!adminKey) {
            throw new Error('Unauthorized: Please log in.');
        }

        const response = await fetch(`${API_URL}/events/${currentSlug}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminKey
            },
            body: JSON.stringify(eventData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`${context} Failure Point EV-F4: Server rejected event update.`, data.message);
            throw new Error(data.message || 'Failed to update event details.');
        }

        console.log(`${context} Step 2: Event updated successfully!`);
        return data;

    } catch (error) {
        console.error(`${context} CRITICAL FAILURE: Network error during event update.`, error.message);
        throw error;
    }
};