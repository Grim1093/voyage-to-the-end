const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const logger = require('../utils/logger');
const { requireAdminKey } = require('../middleware/authMiddleware');

/**
 * Route: POST /api/guests/register
 * Purpose: Receives the guest's form data and passes it to the controller logic.
 */
router.post('/register', (req, res) => {
    logger.info('GuestRoutes', 'Incoming POST request to /api/guests/register');
    guestController.registerGuest(req, res);
});

/**
 * Route: GET /api/guests
 * Purpose: Retrieves a paginated list of guests.
 * Query Params: ?page=1 (defaults to 1)
 */
router.get('/',requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming GET request to /api/guests. Query params: ${JSON.stringify(req.query)}`);
    guestController.getAllGuests(req, res);
});

/**
 * Route: PATCH /api/guests/:id/state
 * Purpose: Updates the verification state (0, 1, 2, -1) of a specific guest.
 * Body: { "newState": 2, "errorLog": "Optional error reason if state is -1" }
 */

router.patch('/:id/state',requireAdminKey, (req, res) => {
    logger.info('GuestRoutes', `Incoming PATCH request to /api/guests/${req.params.id}/state`);
    guestController.updateGuestState(req, res);
});

module.exports = router;