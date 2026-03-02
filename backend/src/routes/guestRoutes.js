const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const logger = require('../utils/logger');
const { requireAdminKey } = require('../middleware/authMiddleware');

/**
 * Route: POST /api/guests/:eventSlug/register
 * Purpose: Receives the guest's form data for a specific event.
 */
router.post('/:eventSlug/register', (req, res) => {
    logger.info('GuestRoutes', `Incoming POST request to register for event: ${req.params.eventSlug}`);
    if (!req.params.eventSlug) {
        logger.warn('GuestRoutes', 'Failure Point R1: Missing eventSlug in register route.');
    }
    guestController.registerGuest(req, res);
});

/**
 * Route: POST /api/guests/:eventSlug/login
 * Purpose: Authenticates a guest for a specific event using their email and 6-character access code.
 */
router.post('/:eventSlug/login', (req, res) => {
    logger.info('GuestRoutes', `Incoming POST request to login for event: ${req.params.eventSlug}`);
    guestController.guestLogin(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug/:id/status
 * Purpose: Lightweight endpoint to fetch the live verification state for the guest dashboard.
 */
router.get('/:eventSlug/:id/status', (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch status for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.getGuestStatus(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug
 * Purpose: Retrieves a paginated list of guests for a specific event.
 */
router.get('/:eventSlug', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch guest ledger for event: ${req.params.eventSlug}. Query params: ${JSON.stringify(req.query)}`);
    guestController.getAllGuests(req, res);
});

/**
 * Route: GET /api/guests/:eventSlug/:id
 * Purpose: Lazy-loads the extended details (PII) of a specific guest for the Admin Vault. Protected by middleware.
 */
router.get('/:eventSlug/:id', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to fetch extended details for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.getGuestById(req, res);
});

/**
 * Route: PATCH /api/guests/:eventSlug/:id/state
 * Purpose: Updates the verification state (0, 1, 2, -1) of a specific guest within an event.
 */
router.patch('/:eventSlug/:id/state', requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming PATCH request to update state for guest ${req.params.id} at event: ${req.params.eventSlug}`);
    guestController.updateGuestState(req, res);
});

module.exports = router;