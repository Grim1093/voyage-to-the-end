const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const logger = require('../utils/logger');
// [Architecture] Imported the new Guest Bouncer alongside the Admin Gatekeeper
const { requireAdminKey, requireGuestToken } = require('../middleware/authMiddleware');

/**
 * Route: GET /api/guests/admin/all
 * Purpose: Fetch ALL global identities and their aggregated events for the Master Admin Dashboard.
 * ARCHITECT NOTE: Placed at the very top to prevent route collision with /:eventSlug!
 */
router.get('/admin/all', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', 'Incoming GET request for Global Guest Directory.');
    guestController.getGlobalGuests(req, res);
});

/**
 * Route: POST /api/guests/:eventSlug/register
 * Purpose: Receives the guest's form data for a specific event. Publicly accessible.
 */
router.post('/:eventSlug/register', (req, res) => {
    logger.info('GuestRoutes', `Incoming POST request to register for event: ${req.params.eventSlug}`);
    if (!req.params.eventSlug) {
        logger.warn('GuestRoutes', 'Failure Point R1: Missing eventSlug in register route.');
    }
    guestController.registerGuest(req, res);
});

/**
 * Route: POST /api/guests/:eventSlug/resend-code
 * Purpose: Recovery mechanism to re-trigger the access code email. Publicly accessible.
 */
router.post('/:eventSlug/resend-code', (req, res) => {
    logger.info('GuestRoutes', `Incoming POST request to resend code for event: ${req.params.eventSlug}`);
    guestController.resendAccessCode(req, res);
});

/**
 * Route: POST /api/guests/:eventSlug/login
 * Purpose: Authenticates a guest and mints their JWT. Publicly accessible.
 */
router.post('/:eventSlug/login', (req, res) => {
    logger.info('GuestRoutes', `Incoming POST request to login for event: ${req.params.eventSlug}`);
    guestController.guestLogin(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug/:id/status
 * Purpose: Lightweight endpoint to fetch the live verification state for the guest dashboard.
 * ARCHITECT NOTE: Secured by the Guest Bouncer and IDOR Shield.
 */
router.get('/:eventSlug/:id/status', requireGuestToken, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch status for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.getGuestStatus(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug
 * Purpose: Retrieves a paginated list of guests for a specific event. Strictly Admin.
 */
router.get('/:eventSlug', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch guest ledger for event: ${req.params.eventSlug}. Query params: ${JSON.stringify(req.query)}`);
    guestController.getAllGuests(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug/:id
 * Purpose: Lazy-loads the extended details (PII) of a specific guest for the Admin Vault. Strictly Admin.
 */
router.get('/:eventSlug/:id', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch extended details for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.getGuestById(req, res);
});

/**
 * Route: PATCH /api/guests/:eventSlug/:id/state
 * Purpose: Updates the verification state (0, 1, 2, -1) of a specific guest within an event. Strictly Admin.
 */
router.patch('/:eventSlug/:id/state', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming PATCH request to update state for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.updateGuestState(req, res);
});

module.exports = router;