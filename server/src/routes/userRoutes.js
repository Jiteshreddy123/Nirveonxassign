const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All user management routes require valid authentication & Admin role
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);

module.exports = router;
