const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const logger = require('../utils/logger');
const { requireAdminKey } = require('../middleware/authMiddleware');

/**
 * Route: GET /api/events
 * Purpose: Fetch all public events for the Global Hub.
 */
router.get('/', (req, res) => {
    logger.info('EventRoutes', 'Incoming GET request to fetch all public events.');
    eventController.getPublicEvents(req, res);
});

/**
 * Route: GET /api/events/admin/all
 * Purpose: Fetch ALL events (public & private) for the Master Admin Dashboard.
 * ARCHITECT NOTE: Placed above /:eventSlug to prevent route collision!
 */
router.get('/admin/all', requireAdminKey, (req, res) => {
    logger.info('EventRoutes', 'Incoming GET request for Master Admin event ledger.');
    eventController.getAllAdminEvents(req, res);
});

/**
 * Route: POST /api/events
 * Purpose: Admin creates a new event tenant. Protected by middleware.
 */
router.post('/', requireAdminKey, (req, res) => {
    logger.info('EventRoutes', 'Incoming POST request to create a new event.');
    eventController.createEvent(req, res);
});

/**
 * Route: GET /api/events/:eventSlug
 * Purpose: Fetch metadata for a specific event to populate the Event Hub.
 */
router.get('/:eventSlug', (req, res) => {
    logger.info('EventRoutes', `Incoming GET request to fetch data for event: ${req.params.eventSlug}`);
    eventController.getEventBySlug(req, res);
});

/**
 * Route: PATCH /api/events/:eventSlug
 * Purpose: Admin updates an existing event tenant. Protected by middleware.
 */
router.patch('/:eventSlug', requireAdminKey, (req, res) => {
    logger.info('EventRoutes', `Incoming PATCH request to update event: ${req.params.eventSlug}`);
    eventController.updateEvent(req, res);
});

module.exports = router;