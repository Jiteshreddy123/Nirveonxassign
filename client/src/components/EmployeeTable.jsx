import React from 'react';
import { Eye, Edit3, Trash2, Calendar, Mail, Briefcase, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeTable = ({
  employees,
  loading,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden md:block"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block"></div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto rounded-2xl flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          No employee records found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Try adjusting your search criteria or filter tags to find what you are looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Employee</th>
              <th className="py-4 px-6">Employee ID</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Designation</th>
              <th className="py-4 px-6">Date of Joining</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
            {employees.map((emp) => (
              <tr
                key={emp._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group"
              >
                {/* Name & Email */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-semibold flex items-center justify-center text-xs shadow-sm shadow-indigo-500/10">
                      {emp.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <span
                        onClick={() => navigate(`/employees/${emp._id}`)}
                        className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {emp.fullName}
                      </span>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" />
                        {emp.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="py-4 px-6">
                  <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {emp.employeeId}
                  </span>
                </td>

                {/* Department */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {emp.department}
                  </span>
                </td>

                {/* Designation */}
                <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                  {emp.designation}
                </td>

                {/* Date of Joining */}
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {formatDate(emp.dateOfJoining)}
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    ></span>
                    {emp.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {/* View Details - Accessible by both Admin and Viewer */}
                    <button
                      onClick={() => (onView ? onView(emp) : navigate(`/employees/${emp._id}`))}
                      title="View Details"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit & Delete - ONLY for Admin */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(emp)}
                          title="Edit Employee"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(emp)}
                          title="Delete Employee"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
