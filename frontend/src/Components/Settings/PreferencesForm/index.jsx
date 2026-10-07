import { useState, useEffect } from "react";
import { FaSave, FaMoon, FaSun, FaList, FaEnvelope } from "react-icons/fa";
import { showNotification } from "../../Common/Notification";
import useStore from "../../../hooks/useStore";
import useUser from "../../../hooks/useUser";
function PreferencesForm({ user, loading, onUpdate = () => {} }) {
  const { updateUser } = useUser();
  const { preferences: storePreferences, setPreferences: setStorePreferences } =
    useStore();
  // Preferences State
  const [preferences, setPreferences] = useState({
    pageSize: 12,
    darkMode: false,
    emailNotifications: true,
    autoSave: true,
    language: "en",
  });

  const [originalPreferences, setOriginalPreferences] = useState({});

  // Initialize original states
  useEffect(() => {
    const initialPreferences = {
      pageSize: storePreferences.pageSize,
      darkMode: storePreferences.darkMode,
      emailNotifications: user.emailNotifications,
      language: storePreferences.language,
    };
    setPreferences(initialPreferences);
    setOriginalPreferences(initialPreferences);
  }, [user, storePreferences]);

  // Check if preferences have changes
  const hasPreferencesChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  };

  // Handle preferences changes
  const handlePreferencesChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit preferences
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();

    try {
      setStorePreferences(preferences);

      // Apply dark mode immediately
      if (preferences.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Reset preferences state
      setOriginalPreferences(preferences);
      updateUser(user?.id, {
        emailNotifications: preferences.emailNotifications,
      })
        .then(() => {
          onUpdate(preferences);

          showNotification({
            message: "Preferences updated successfully!",
            type: "success",
          });
        })
        .catch((error) => {
          showNotification({
            message: "Failed to update preferences",
            type: "error",
          });
        });
    } catch (error) {
      showNotification({
        message: "Failed to update preferences",
        type: "error",
      });
    }
  };

  const pageSizeOptions = [
    { value: 6, label: "6 items per page" },
    { value: 12, label: "12 items per page" },
    { value: 24, label: "24 items per page" },
    { value: 48, label: "48 items per page" },
  ];

  return (
    <form onSubmit={handlePreferencesSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-4">
          Application Preferences
        </h2>

        {/* Page Size Setting */}
        <div className="mb-6">
          <label
            htmlFor="pageSize"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <FaList className="inline h-4 w-4 mr-2" />
            Classifications Page Size
          </label>
          <select
            id="pageSize"
            value={preferences.pageSize}
            onChange={(e) =>
              handlePreferencesChange(
                "pageSize",
                Number.parseInt(e.target.value)
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {pageSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Number of classification results to display per page
          </p>
        </div>

        {/* Dark Mode Setting */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="darkMode"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                {preferences.darkMode ? (
                  <FaMoon className="h-4 w-4 mr-2" />
                ) : (
                  <FaSun className="h-4 w-4 mr-2" />
                )}
                Dark Mode
              </label>
              <p className="text-sm text-gray-500">
                Enable dark theme for better viewing in low light
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handlePreferencesChange("darkMode", !preferences.darkMode)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.darkMode ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="emailNotifications"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <FaEnvelope className="h-4 w-4 mr-2" />
                Email Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive updates about your classifications and project news
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handlePreferencesChange(
                  "emailNotifications",
                  !preferences.emailNotifications
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Save */}
        {/* <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="autoSave"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <FaCheckCircle className="h-4 w-4 mr-2" />
                Auto Save
              </label>
              <p className="text-sm text-gray-500">
                Automatically save your work as you type
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handlePreferencesChange("autoSave", !preferences.autoSave)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoSave ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoSave ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div> */}

        {/* Language Setting */}
        <div className="mb-6">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Language
          </label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) =>
              handlePreferencesChange("language", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Choose your preferred language for the interface
          </p>
        </div>
      </div>

      {/* Submit Button */}
      {hasPreferencesChanges() && (
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            disabled={loading}
            type="submit"
            className={` ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            } bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center`}
          >
            <FaSave className="h-4 w-4 mr-2" />
            Save Preferences
          </button>
        </div>
      )}
    </form>
  );
}
export default PreferencesForm;
