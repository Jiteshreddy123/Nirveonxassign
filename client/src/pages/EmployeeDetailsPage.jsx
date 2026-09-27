import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EmployeeModal from '../components/EmployeeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  ArrowLeft,
  User,
  Hash,
  Mail,
  Building,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Edit / Delete Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchEmployee = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/employees/${id}`);
      if (res.data.success) {
        setEmployee(res.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Employee not found or invalid identifier.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleCopyEmail = () => {
    if (employee?.email) {
      navigator.clipboard.writeText(employee.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditSubmit = async (formData) => {
    const res = await api.put(`/api/employees/${employee._id}`, formData);
    if (res.data.success) {
      setEmployee(res.data.data);
    }
  };

  const handleDeleteConfirm = async (employeeId) => {
    await api.delete(`/api/employees/${employeeId}`);
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Directory
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Loading employee details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-rose-200 dark:border-rose-900/50 text-center">
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-base mb-2">
              Error Loading Employee
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Return to Directory
            </Link>
          </div>
        )}

        {/* Employee Detail Content */}
        {!loading && employee && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    {employee.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {employee.fullName}
                      </h1>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {employee.designation} &bull; {employee.department}
                    </p>
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin ? (
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                    Read-only mode (Viewer)
                  </span>
                )}
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <Hash className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Employee Identifier
                </span>
                <p className="font-mono text-base font-semibold text-slate-900 dark:text-white">
                  {employee.employeeId}
                </p>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    Official Email
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {employee.email}
                  </p>
                </div>
                <button
                  onClick={handleCopyEmail}
                  title="Copy Email"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Department */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <Building className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Department
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {employee.department}
                </p>
              </div>

              {/* Designation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Designation / Job Role
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {employee.designation}
                </p>
              </div>

              {/* Date of Joining */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Date of Joining
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(employee.dateOfJoining)}
                </p>
              </div>

              {/* System Record Creation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Record Created At
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(employee.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal (Admin only) */}
      {isAdmin && (
        <EmployeeModal
          isOpen={editModalOpen}
          mode="edit"
          employee={employee}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Modal (Admin only) */}
      {isAdmin && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          employee={employee}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default EmployeeDetailsPage;
