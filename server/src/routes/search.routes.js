const router = require('express').Router();
const searchController = require('../controllers/search.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), searchController.search);
router.post('/semantic', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), searchController.semanticSearch);

module.exports = router;
