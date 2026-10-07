import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUniversity,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaUserPlus,
} from "react-icons/fa";
import { showNotification } from "../../Common/Notification";
import useUser from "../../../hooks/useUser";
import useAdmin from "../../../hooks/useAdmin";
import { cn } from "../../../utils";

function DetailsForm({ user, loading, onUpdate, admin = false }) {
  const { updateUser } = useUser();
  const { updateUser: updateUserAdmin } = useAdmin();
  const [userForm, setUserForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    institution: "",
    department: "",
    location: "",
    bio: "",
    password: "",
  });
  const [originalUserForm, setOriginalUserForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isRequestToContribute =
    window.location.pathname === "/settings/request-to-contribute";

  useEffect(() => {
    if (isRequestToContribute) {
      const requestContributorButton = document.getElementById(
        "request-contributor-button"
      );
      requestContributorButton.scrollIntoView({ behavior: "smooth" });
    }
  }, [isRequestToContribute]);
  // Initialize original states
  useEffect(() => {
    const initialUserForm = {
      name: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      institution: user?.institution || "",
      department: user?.department || "",
      location: user?.location || "",
      bio: user?.bio || "",
      password: "",
    };
    setUserForm(initialUserForm);
    setOriginalUserForm(initialUserForm);
  }, [user]);

  // Check if user form has changes
  const hasUserChanges = () => {
    return (
      JSON.stringify(userForm) !== JSON.stringify(originalUserForm) ||
      password !== "" ||
      confirmPassword !== ""
    );
  };

  const handleUserFormChange = (field, value) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if they're being changed
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        showNotification({ message: "Passwords do not match", type: "error" });
        return;
      }
      if (password.length < 6) {
        showNotification({
          message: "Password must be at least 6 characters",
          type: "error",
        });

        return;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      showNotification({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    try {
      // Update user data
      const updatedUser = {
        ...user,
        ...userForm,
      };

      if (admin) {
        updateUserAdmin(updatedUser.id, updatedUser).then(() => {
          // Reset form states
          setOriginalUserForm(userForm);
          setPassword("");
          setConfirmPassword("");
          showNotification({
            message: "User settings updated successfully!",
            type: "success",
          });
          onUpdate(updatedUser);
        });
      } else {
        updateUser(updatedUser.id, updatedUser).then(() => {
          // Reset form states
          setOriginalUserForm(userForm);
          setPassword("");
          setConfirmPassword("");
          showNotification({
            message: "User settings updated successfully!",
            type: "success",
          });
          onUpdate(updatedUser);
        });
      }
    } catch (error) {
      showNotification({
        message: "Failed to update user settings",
        type: "error",
      });
    }
  };

  const handleRequestContributorRole = () => {
    updateUser(user.id, { requestedContributorStatus: true })
      .then((user) => {
        showNotification({
          message: "Contributor role requested successfully!",
          type: "success",
        });
        onUpdate(user);
      })
      .catch((error) => {
        showNotification({
          title: "Error requesting contributor role",
          message: error.response.data.error,
          type: "error",
        });
      });
  };

  return (
    <div>
      {" "}
      <form onSubmit={handleUserSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-medium text-green-700 mb-4">
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <FaUser className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={userForm.name}
                onChange={(e) => handleUserFormChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <FaEnvelope className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userForm.email}
                onChange={(e) => handleUserFormChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <FaPhone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={userForm.phone}
                onChange={(e) => handleUserFormChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <FaMapMarkerAlt className="inline h-4 w-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                id="location"
                value={userForm.location}
                onChange={(e) =>
                  handleUserFormChange("location", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label
                htmlFor="institution"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <FaUniversity className="inline h-4 w-4 mr-2" />
                Institution
              </label>
              <input
                type="text"
                id="institution"
                value={userForm.institution}
                onChange={(e) =>
                  handleUserFormChange("institution", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="University or Organization"
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department/Field
              </label>
              <input
                type="text"
                id="department"
                value={userForm.department}
                onChange={(e) =>
                  handleUserFormChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Biology, Agriculture, etc."
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={userForm.bio}
              onChange={(e) => handleUserFormChange("bio", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Tell us about yourself and your interest in plant research..."
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-green-700 mb-4">
            Change Password
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleUserFormChange("password", e.target.value);
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {/* Submit Button */}
              {hasUserChanges() && (
                <div className="flex pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={` ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    } bg-green-600 hover:bg-green-700 cursor-pointer text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center w-full  justify-center`}
                  >
                    <FaSave className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-4">
            Request Contributor Role
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Make sure to fill out all your personal information before
            requesting a contributor role.
          </p>
        </div>
      </form>
      <button
        id="request-contributor-button"
        onClick={() => handleRequestContributorRole()}
        className={cn(
          user?.requestedContributorStatus
            ? "bg-gray-200 cursor-not-allowed"
            : "hover:bg-green-700 cursor-pointer hover:text-white  border-green-700 border-2",
          "rounded-md transition-colors ",
          "flex items-center w-full md:max-w-1/2 justify-center",
          " text-green-700 font-medium py-2 px-6"
        )}
        disabled={user?.requestedContributorStatus}
      >
        <FaUserPlus className="h-4 w-4 mr-2" />
        {user?.requestedContributorStatus
          ? "Already Requested"
          : "Request Role"}
      </button>
    </div>
  );
}

export default DetailsForm;
