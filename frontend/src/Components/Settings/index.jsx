import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { FaUser, FaCog, FaBrain } from "react-icons/fa";
import useStore from "../../hooks/useStore";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Settings() {
  const { user: userStore } = useStore();
  const { getUser, user, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (userStore?.id) {
      getUser(userStore.id);
    }
  }, [userStore?.id]);

  useEffect(() => {
    // Redirect /settings to /settings/user by default
    if (
      location.pathname === "/settings" ||
      location.pathname === "/settings/"
    ) {
      navigate("/settings/user", { replace: true });
    }
  }, [location.pathname, navigate]);

  const navLinkClass = ({ isActive }) =>
    classNames(
      "flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium focus:outline-none cursor-pointer",
      isActive
        ? "text-green-600 border-b-2 border-green-600 bg-white"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    );

  return (
    <div className="mx-auto">
      <div className="bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="flex gap-2 text-3xl font-bold text-white mb-2 items-center">
              <FaCog className="" /> Settings
            </h1>
            <p className="text-green-100">
              Manage your account and application preferences
            </p>
          </div>
        </div>

        {/* Tabs as Navigation Links */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-wrap">
          <NavLink to="/settings/user" className={navLinkClass}>
            <FaUser className="h-4 w-4" />
            <span>User Settings</span>
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/settings/model" className={navLinkClass}>
              <FaBrain className="h-4 w-4" />
              <span>Model Settings</span>
            </NavLink>
          )}
          <NavLink to="/settings/preferences" className={navLinkClass}>
            <FaCog className="h-4 w-4" />
            <span>Preferences</span>
          </NavLink>
        </div>

        {/* Dynamic Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet
            context={{ user, loading, onUpdateUser: (u) => getUser(u.id) }}
          />
        </div>
      </div>
    </div>
  );
}
