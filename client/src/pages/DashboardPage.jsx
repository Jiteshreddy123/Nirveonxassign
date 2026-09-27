import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import UserManagementModal from '../components/UserManagementModal';
import Pagination from '../components/Pagination';
import {
  Search,
  Plus,
  Download,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Design',
  'Legal',
];

const DashboardPage = () => {
  const { isAdmin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [userModalOpen, setUserModalOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/api/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch employees error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load employees. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedDept, selectedStatus]);

  useEffect(() => {
    // Debounce search input
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Handle Add / Edit submit
  const handleEmployeeSubmit = async (formData) => {
    if (modalMode === 'add') {
      const res = await api.post('/api/employees', formData);
      if (res.data.success) {
        showToast('Employee created successfully!');
        fetchEmployees();
      }
    } else if (modalMode === 'edit') {
      const res = await api.put(`/api/employees/${selectedEmployee._id}`, formData);
      if (res.data.success) {
        showToast('Employee updated successfully!');
        fetchEmployees();
      }
    }
  };

  // Handle Delete confirm
  const handleDeleteConfirm = async (id) => {
    try {
      const res = await api.delete(`/api/employees/${id}`);
      if (res.data.success) {
        showToast('Employee record permanently deleted.');
        fetchEmployees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employee', 'error');
    }
  };

  // Export CSV (Stretch goal)
  const handleExportCSV = async () => {
    try {
      const res = await api.get('/api/employees/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV exported successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to export CSV', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar onOpenUserManagement={() => setUserModalOpen(true)} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-md animate-fadeIn transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white text-xs font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employee Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse, search, and manage personnel records with role-based permissions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchEmployees}
              title="Refresh Directory"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* CSV Export Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </button>
            )}

            {/* Add Employee Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setModalMode('add');
                  setModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, ID, email, or designation..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline">
              Dept:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
            <p className="font-semibold">Unable to fetch records</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Employee Table */}
        <EmployeeTable
          employees={employees}
          loading={loading}
          isAdmin={isAdmin}
          onView={(emp) => {
            setSelectedEmployee(emp);
            setModalMode('view');
            setModalOpen(true);
          }}
          onEdit={(emp) => {
            setSelectedEmployee(emp);
            setModalMode('edit');
            setModalOpen(true);
          }}
          onDelete={(emp) => {
            setEmployeeToDelete(emp);
            setDeleteModalOpen(true);
          }}
        />

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </main>

      {/* Employee Modal (Add / Edit / View) */}
      <EmployeeModal
        isOpen={modalOpen}
        mode={modalMode}
        employee={selectedEmployee}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEmployeeSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        employee={employeeToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* User Management Modal (Admin Only) */}
      {isAdmin && (
        <UserManagementModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
