import React from 'react';
import { useAuth } from '../context/AuthContext-Simple';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Wealthify Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Salary Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Salary:</span>
                  <span className="font-semibold">$5,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Income:</span>
                  <span className="font-semibold">$4,200</span>
                </div>
              </div>
            </div>

            {/* Expense Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-semibold">$2,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Budget:</span>
                  <span className="font-semibold text-green-600">$1,400</span>
                </div>
              </div>
            </div>

            {/* Investment Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Portfolio Value:</span>
                  <span className="font-semibold">$15,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Return:</span>
                  <span className="font-semibold text-green-600">+5.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Salary Management</h3>
              <p className="text-gray-600">Manage your salary details and track income</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Tracking</h3>
              <p className="text-gray-600">Track and categorize your expenses</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Suggestions</h3>
              <p className="text-gray-600">Get AI-powered investment recommendations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
