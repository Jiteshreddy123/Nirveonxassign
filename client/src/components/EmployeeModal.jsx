import React, { useState, useEffect } from 'react';
import { X, User, Hash, Building2, Briefcase, Mail, Calendar, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Design',
  'Legal',
];

const EmployeeModal = ({
  isOpen,
  mode = 'add', // 'add', 'edit', 'view'
  employee = null,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    department: 'Engineering',
    designation: '',
    email: '',
    dateOfJoining: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (employee && (mode === 'edit' || mode === 'view')) {
      const formattedDate = employee.dateOfJoining
        ? new Date(employee.dateOfJoining).toISOString().split('T')[0]
        : '';
      setFormData({
        fullName: employee.fullName || '',
        employeeId: employee.employeeId || '',
        department: employee.department || 'Engineering',
        designation: employee.designation || '',
        email: employee.email || '',
        dateOfJoining: formattedDate,
        status: employee.status || 'Active',
      });
    } else {
      setFormData({
        fullName: '',
        employeeId: '',
        department: 'Engineering',
        designation: '',
        email: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
    setErrors({});
    setServerError('');
  }, [employee, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.designation.trim()) errs.designation = 'Designation is required';
    if (!formData.department.trim()) errs.department = 'Department is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.dateOfJoining) errs.dateOfJoining = 'Date of Joining is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'An error occurred while saving employee record.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isViewOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'add' && 'Add New Employee'}
              {mode === 'edit' && 'Edit Employee Details'}
              {mode === 'view' && 'Employee Details'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'view'
                ? 'Read-only profile information'
                : 'Fill in the information below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start space-x-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  disabled={isViewOnly}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors dark:bg-slate-900 dark:text-white ${
                    errors.fullName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="employeeId"
                  disabled={isViewOnly}
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP-101"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-colors dark:bg-slate-900 dark:text-white ${
                    errors.employeeId
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                />
              </div>
              {errors.employeeId && (
                <p className="text-xs text-rose-500 mt-1">{errors.employeeId}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  disabled={isViewOnly}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors dark:bg-slate-900 dark:text-white ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="department"
                  disabled={isViewOnly}
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors dark:bg-slate-900 dark:text-white appearance-none ${
                    errors.department
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="text-xs text-rose-500 mt-1">{errors.department}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Designation / Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="designation"
                  disabled={isViewOnly}
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Lead Engineer"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors dark:bg-slate-900 dark:text-white ${
                    errors.designation
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                />
              </div>
              {errors.designation && (
                <p className="text-xs text-rose-500 mt-1">{errors.designation}</p>
              )}
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date of Joining <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  name="dateOfJoining"
                  disabled={isViewOnly}
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors dark:bg-slate-900 dark:text-white ${
                    errors.dateOfJoining
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  } ${isViewOnly ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-90' : ''}`}
                />
              </div>
              {errors.dateOfJoining && (
                <p className="text-xs text-rose-500 mt-1">{errors.dateOfJoining}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-4 pt-2">
                <label className="inline-flex items-center text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    disabled={isViewOnly}
                    value="Active"
                    checked={formData.status === 'Active'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    Active
                  </span>
                </label>
                <label className="inline-flex items-center text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    disabled={isViewOnly}
                    value="Inactive"
                    checked={formData.status === 'Inactive'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    Inactive
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-100 dark:border-slate-700/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>

            {!isViewOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 flex items-center"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {mode === 'add' ? 'Create Employee' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
