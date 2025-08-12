import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo.png";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = "Dashboard",
  showSidebar = true,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      description: "Overview & Analytics",
    },
    {
      path: "/salary",
      label: "Income",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      description: "Salary & Goals",
    },
    {
      path: "/expenses",
      label: "Expenses",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      description: "Track & Budget",
    },
    {
      path: "/investments",
      label: "Investments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      description: "AI Suggestions",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-success-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-warning-200/30 to-brand-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-br from-success-200/20 to-warning-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Premium Top Header Bar */}
      <div className="fixed top-0 w-full h-1 bg-gradient-to-r from-brand-500 via-success-500 to-warning-500 z-50"></div>

      {/* Main Header */}
      <header className="fixed top-1 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-xl shadow-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Left Section - Logo Only */}
            <div className="flex items-center space-x-4">
              {showSidebar && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-3 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-300 group shadow-lg"
                >
                  <svg
                    className="w-5 h-5 text-slate-700 group-hover:text-brand-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}

              <Link to="/dashboard" className="flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-success-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={logo}
                    alt="Wealthify"
                    className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            </div>

            {/* Center Section - Quick Stats */}
            <div className="hidden xl:flex items-center space-x-6">
              <div className="flex items-center space-x-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm border border-white/30 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse shadow-lg shadow-success-500/50"></div>
                  <span className="text-sm font-semibold text-slate-700">
                    Live
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="text-sm">
                  <span className="text-slate-500 font-medium">Portfolio:</span>
                  <span className="text-slate-800 font-bold ml-1">$12,450</span>
                </div>
                <div className="text-sm">
                  <span className="text-success-600 font-bold">+2.4%</span>
                </div>
              </div>
            </div>

            {/* Right Section - User & Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-300 group shadow-lg">
                <svg
                  className="w-5 h-5 text-slate-600 group-hover:text-brand-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h4m4 0V3a2 2 0 00-2-2H7a2 2 0 00-2 2v2"
                  />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm border border-white/30 shadow-lg">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-success-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    Premium Member
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/60 hover:bg-red-50 border-white/30 hover:border-red-200 text-slate-700 hover:text-red-600 shadow-lg transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-21">
        {/* Premium Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-30 lg:hidden bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`
              fixed lg:static top-21 bottom-0 left-0 z-40 w-80
              transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } 
              lg:translate-x-0 transition-all duration-500 ease-out
              backdrop-blur-xl bg-gradient-to-b from-white/90 via-white/80 to-white/70
              border-r border-white/30 shadow-2xl shadow-black/10
            `}
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800">
                      Navigation
                    </h2>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-success-500 text-xs font-bold text-white shadow-lg">
                      PRO
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Financial Management Suite
                  </p>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
                  {navigationItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          relative group block p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02]
                          ${
                            isActive
                              ? "bg-gradient-to-r from-brand-500 to-success-500 text-white shadow-2xl shadow-brand-500/25"
                              : "bg-white/40 hover:bg-white/60 text-slate-700 hover:text-brand-600 border border-white/30 hover:border-brand-200"
                          }
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`
                            p-3 rounded-xl transition-all duration-300
                            ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-white/60 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600"
                            }
                          `}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-bold text-sm ${
                                isActive ? "text-white" : "text-slate-800"
                              }`}
                            >
                              {item.label}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${
                                isActive ? "text-white/80" : "text-slate-500"
                              }`}
                            >
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                          )}
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Sidebar Footer - User Card */}
                <div className="p-6 border-t border-white/20">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-400/20 to-success-400/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-success-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">
                            {user?.name || "User Name"}
                          </p>
                          <p className="text-xs text-white/70">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">Account Status</span>
                        <span className="px-2 py-1 bg-success-500/20 text-success-200 rounded-full font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-white/60 via-white/40 to-white/60 backdrop-blur-sm border-b border-white/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-brand-600 to-slate-800 bg-clip-text text-transparent mb-2">
                    {title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="hidden lg:flex items-center space-x-3">
                  <button className="px-4 py-2 bg-white/60 hover:bg-white/80 border border-white/30 rounded-xl text-sm font-medium text-slate-700 hover:text-brand-600 transition-all duration-300 shadow-lg">
                    <svg
                      className="w-4 h-4 mr-2 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Quick Add
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-brand-500 to-success-500 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg">
                    <svg
                      className="w-4 h-4 mr-2 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-fade-in-up">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
