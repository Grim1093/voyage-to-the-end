const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const logger = require('../utils/logger');

/**
 * Route: POST /api/guests/register
 * Purpose: Receives the guest's form data and passes it to the controller logic.
 */
router.post('/register', (req, res) => {
    logger.info('GuestRoutes', 'Incoming POST request to /api/guests/register');
    
    // Hand the request off to our Controller (The Brain)
    guestController.registerGuest(req, res);
});

module.exports = router;