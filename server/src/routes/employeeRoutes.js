const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  exportEmployeesCSV,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All employee routes require authentication
router.use(protect);

// Stretch Goal: Export CSV (Admin only) - Must be before /:id route!
router.get('/export/csv', authorize('Admin'), exportEmployeesCSV);

// View routes: Accessible by both Admin and Viewer
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// Modification routes: Strictly restricted to Admin (Returns 403 Forbidden for Viewer)
router.post('/', authorize('Admin'), createEmployee);
router.put('/:id', authorize('Admin'), updateEmployee);
router.delete('/:id', authorize('Admin'), deleteEmployee);

module.exports = router;
