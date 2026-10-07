import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import useStore from "../../../hooks/useStore";
import useAuth from "../../../hooks/useAuth";
import { Fragment } from "react";
import {
  FaUser,
  FaHome,
  FaLeaf,
  FaShieldAlt,
  FaInfoCircle,
  FaBell,
  FaSpinner,
} from "react-icons/fa";
import { showNotification } from "../../Common/Notification";
import useClassifier from "../../../hooks/useClassifier";

let defaultPages = [
  {
    title: "Home",
    key: "home",
    url: "/",
    icon: <FaHome />,
  },
  {
    title: "About",
    key: "about",
    url: "/about",
    icon: <FaInfoCircle />,
  },
];

function Header({ className = "" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pages, setPages] = useState(defaultPages);
  const {
    setSelectedPage,
    uiState,
    user,
    logout: logoutFromStore,
    setUiState,
    accessToken,
  } = useStore();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { getTrainingStatus } = useClassifier();
  
  useEffect(() => {
    if (!accessToken) return;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const source = new EventSource(`${apiUrl}/notifications/stream?token=${accessToken}`);
    
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        setNotifications((prev) => {
          // If a success/error message arrives, remove the corresponding 'training' status
          if (data.type === 'success' || data.type === 'error') {
            return [data, ...prev.filter(n => !(n.type === 'training' && n.model === data.model))];
          }
          // If a new training starts, filter out existing training entries for the same model to avoid duplicates
          if (data.type === 'training') {
            return [data, ...prev.filter(n => !(n.type === 'training' && n.model === data.model))];
          }
          return [data, ...prev];
        });
        
        setUnreadCount((prev) => prev + 1);
        showNotification({ type: data.type === 'training' ? 'info' : data.type, title: data.title, message: data.message });
      } catch(e) {
        console.error("Error parsing notification:", e);
      }
    };
    
    return () => source.close();
  }, [accessToken]);

  useEffect(() => {
    // Check initial training status on mount
    if (user?.role === 'ADMIN') {
      const models = ['especies', 'hojas', 'plantas'];
      models.forEach(model => {
        getTrainingStatus(model).then(status => {
          if (status?.is_training) {
            setNotifications(prev => {
              const newNotif = {
                id: `training-${model}-${Date.now()}`,
                type: 'training',
                title: `Training ${model}...`,
                message: `Model ${model} is currently training...`,
                model: model,
                timestamp: status.started_at || new Date().toISOString()
              };
              // Check if already in list
              if (prev.some(n => n.type === 'training' && n.model === model)) return prev;
              
              setUnreadCount(c => c + 1);
              return [newNotif, ...prev];
            });
          }
        }).catch(e => console.error("Error fetching status for", model, e));
      });
    }
  }, [user]);

  const navigate = useNavigate();
  const LogoButton = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };
  const handleSettings = () => {
    setSelectedPage("settings");
    navigate("/settings");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      await logoutFromStore();
      showNotification({ type: "success", message: "Logged out successfully" });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    // Update pages based on user authentication status
    if (user) {
      // User is authenticated
      setPages([
        ...defaultPages,
        { title: "Upload", key: "upload", url: "/upload", icon: <FaLeaf /> },
      ]); // Add upload link

      if (user.role === "ADMIN" || user.role === "MODERATOR") {
        setPages((prevPages) => [
          ...prevPages,
          {
            title: "Admin",
            key: "admin",
            url: "/admin",
            icon: <FaShieldAlt />,
          },
        ]); // Add dashboard link for admin
      }
    } else {
      // User is not authenticated or not logged in
      setPages(defaultPages); // Reset to default pages
    }
  }, [user]);

  return (
    <header
      className={` w-full ${
        className === ""
          ? "bg-white shadow-sm border-b border-gray-200"
          : className
      } `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between  h-16 w-full items-center ">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              LogoButton();
            }}
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FaLeaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                SAPS<span className="text-green-600">AI</span> Dataset
              </h1>
              {user && (
                <p className="text-sm text-gray-500">{user?.fullName}</p>
              )}
            </div>
          </div>
          <div>
            {/* Desktop Menu & User Dropdown */}
            <div className="hidden md:flex items-center gap-6">
              <ul className="flex space-x-8 font-medium">
                {pages.map((page) => (
                  <li key={page.key}>
                    <Link
                      to={page.url}
                      className={`text-gray-600 hover:text-green-300 font-bold flex items-center gap-2 ${
                        uiState.selectedPage === page.key
                          ? "text-green-600"
                          : ""
                      }`}
                      onClick={(e) => {
                        setSelectedPage(page.key);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {page.icon}
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {!user && (
                <div className="relative inline-flex group cursor-pointer">
                  <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                  <a
                    className={`relative inline-flex items-center justify-center px-4 py-2 text-md font-semibold text-green-700 transition-all duration-200 bg-white border-2  font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
                      uiState.selectedPage === "booking"
                        ? "outline outline-2"
                        : ""
                    }`}
                    role="button"
                    onClick={() => {
                      navigate("/login");
                      setUiState({ selectedPage: "login" });
                    }}
                  >
                    Login
                  </a>
                </div>
              )}

              {/* User Dropdown */}
              {user && (
                <Menu as="div" className="relative inline-block text-left">
                  <div
                    className={`${
                      uiState.selectedPage === "settings"
                        ? "text-green-600"
                        : "text-gray-600"
                    } flex items-center hover:outline-2 hover:text-green-600 outline-green-600  rounded-md px-4 py-2`}
                  >
                    <Menu.Button
                      className={`cursor-pointer inline-flex items-center justify-center w-full  text-sm font-medium hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                    >
                      {/* Display user's name, email, or an icon */}
                      {user.displayName || user.email || "Account"}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="z-10 absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1 ">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSettings}
                              className={`${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                              Settings
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              {/* Notifications Dropdown */}
              {user && (
                <Menu as="div" className="relative inline-block text-left ml-2">
                  <div>
                    <Menu.Button
                      onClick={() => setUnreadCount(0)}
                      className="relative p-2 rounded-full text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <FaBell className="h-5 w-5" aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="z-50 absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Notifications</p>
                      </div>
                      <div className="py-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification.id}>
                              {({ active }) => (
                                <div
                                  className={`${
                                    active ? "bg-gray-50" : ""
                                  } px-4 py-3 border-b border-gray-100 text-sm flex flex-col`}
                                >
                                  <span className={`font-semibold flex items-center gap-2 ${notification.type === 'error' ? 'text-red-600' : notification.type === 'training' ? 'text-blue-600' : 'text-green-600'}`}>
                                    {notification.type === 'training' && <FaSpinner className="animate-spin text-blue-600 h-3 w-3" />}
                                    {notification.title}
                                  </span>
                                  <span className="text-gray-700 mt-1">{notification.message}</span>
                                  <span className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              {" "}
              {/* Container for mobile button and potential future mobile dropdown trigger */}
              {user &&
                !isMenuOpen /* Optionally show a small user indicator or avatar here if desired when menu is closed */ && (
                  <div className="mr-2">
                    {/* You could place a small avatar or user icon here that could also trigger the dropdown or just be an indicator */}
                  </div>
                )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-600 rounded-lg hover:bg-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                aria-controls="navbar-sticky"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-100 m-2 rounded-lg">
              {" "}
              {/* Added margin and rounded for aesthetics */}
              <ul className="flex flex-col p-4 space-y-2 font-medium">
                {pages.map(
                  (
                    page // Iterate over 'pages' state for dynamic links
                  ) => (
                    <li key={page.key}>
                      <Link
                        to={page.url}
                        className="block py-2 px-3 text-gray-600 hover:text-white rounded hover:bg-green-300"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setIsMenuOpen(false); // Close menu on link click
                        }}
                      >
                        {page.title}
                      </Link>
                    </li>
                  )
                )}
                {/* User-specific links for mobile */}
                {user && (
                  <>
                    <li>
                      <button
                        onClick={handleSettings}
                        className="block w-full text-left py-2 px-3 text-gray-600 hover:text-white rounded hover:bg-green-300"
                      >
                        Settings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 px-3 text-gray-600 hover:text-white rounded hover:bg-green-300"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
                {!user && (
                  <li>
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMenuOpen(false); // Close menu on button click
                      }}
                      type="button"
                      className="w-full mt-2 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center bg-emerald-600 hover:bg-blue-700 focus:ring-blue-800"
                    >
                      Login
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default Header;
