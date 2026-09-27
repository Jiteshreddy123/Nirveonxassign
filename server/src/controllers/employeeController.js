const Employee = require('../models/Employee');

/**
 * @desc    Get all employees with search, filter, and pagination
 * @route   GET /api/employees
 * @access  Private (Admin & Viewer)
 */
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Search by name or employee ID
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
      ];
    }

    // Filter by department
    if (department && department.trim() !== '' && department !== 'All') {
      query.department = department.trim();
    }

    // Filter by status
    if (status && status.trim() !== '' && status !== 'All') {
      query.status = status.trim();
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortField = sortBy;
    const sortDirection = order === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee details
 * @route   GET /api/employees/:id
 * @access  Private (Admin & Viewer)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee record
 * @route   POST /api/employees
 * @access  Private (Admin only)
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      fullName,
      employeeId,
      department,
      designation,
      email,
      dateOfJoining,
      status,
    } = req.body;

    // Basic presence check
    if (!fullName || !employeeId || !department || !designation || !email || !dateOfJoining) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, employeeId, department, designation, email, dateOfJoining',
      });
    }

    // Check duplicate employeeId
    const existingEmpId = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: `An employee with ID '${employeeId.toUpperCase()}' already exists.`,
      });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `An employee with email '${email.toLowerCase()}' already exists.`,
      });
    }

    const employee = await Employee.create({
      fullName: fullName.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      department: department.trim(),
      designation: designation.trim(),
      email: email.trim().toLowerCase(),
      dateOfJoining: new Date(dateOfJoining),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Employee record created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee record
 * @route   PUT /api/employees/:id
 * @access  Private (Admin only)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      fullName,
      employeeId,
      department,
      designation,
      email,
      dateOfJoining,
      status,
    } = req.body;

    // Check uniqueness if employeeId is being modified
    if (employeeId && employeeId.trim().toUpperCase() !== employee.employeeId) {
      const existingEmpId = await Employee.findOne({
        employeeId: employeeId.trim().toUpperCase(),
        _id: { $ne: employee._id },
      });
      if (existingEmpId) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${employeeId.toUpperCase()}' is already in use by another record.`,
        });
      }
      employee.employeeId = employeeId.trim().toUpperCase();
    }

    // Check uniqueness if email is being modified
    if (email && email.trim().toLowerCase() !== employee.email) {
      const existingEmail = await Employee.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: employee._id },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: `Email '${email.toLowerCase()}' is already in use by another record.`,
        });
      }
      employee.email = email.trim().toLowerCase();
    }

    if (fullName) employee.fullName = fullName.trim();
    if (department) employee.department = department.trim();
    if (designation) employee.designation = designation.trim();
    if (dateOfJoining) employee.dateOfJoining = new Date(dateOfJoining);
    if (status) employee.status = status;

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee record
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin only)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Employee '${employee.fullName}' (${employee.employeeId}) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export all employee records as CSV (Stretch goal)
 * @route   GET /api/employees/export/csv
 * @access  Private (Admin only)
 */
const exportEmployeesCSV = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ employeeId: 1 });

    // Build CSV string
    const headers = ['Employee ID', 'Full Name', 'Email', 'Department', 'Designation', 'Status', 'Date of Joining'];
    const rows = employees.map((emp) => [
      `"${emp.employeeId}"`,
      `"${emp.fullName.replace(/"/g, '""')}"`,
      `"${emp.email}"`,
      `"${emp.department}"`,
      `"${emp.designation}"`,
      `"${emp.status}"`,
      `"${new Date(emp.dateOfJoining).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  exportEmployeesCSV,
};
