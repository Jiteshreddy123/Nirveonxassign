const User = require('../models/User');

/**
 * @desc    Get all users (for Admin to view and manage roles)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (e.g., promote Viewer to Admin)
 * @route   PATCH /api/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!role || !['Admin', 'Viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Role must be either 'Admin' or 'Viewer'.",
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Safety: Prevent an Admin from accidentally demoting themselves if they are the last Admin
    if (user._id.toString() === req.user._id.toString() && role !== 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote yourself: system requires at least one active Admin.',
        });
      }
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User '${user.name || user.email}' successfully updated to role '${role}'.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
};
