import {
  FaCheckCircle,
  FaFilter,
  FaTimesCircle,
  FaShieldAlt,
  FaUserCircle,
  FaArchive,
} from "react-icons/fa";
// Construct image URL from imagePath
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/vite.svg";
  const apiUrl = import.meta.env.VITE_LOCAL_PATH || "http://localhost:5000";
  const fullUrl = `${apiUrl}/${imagePath}`;
  return fullUrl;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getConfidenceColor = (confidence = 0, isTag = false) => {
  if (isTag) return "bg-blue-100 text-gray-800";
  if (confidence >= 0.9) return "bg-green-100 text-green-800";
  if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// Get status badge style
export const getStatusBadge = (status) => {
  const badges = {
    VERIFIED: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: FaFilter },
    REJECTED: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
    ARCHIVED: { color: "bg-gray-100 text-gray-800", icon: FaArchive },
  };
  return badges[status] || badges.PENDING;
};

// Get role badge style
export const getRoleBadge = (role) => {
  const badges = {
    ADMIN: { color: "bg-green-100 text-green-800", icon: FaShieldAlt },
    MODERATOR: { color: "bg-green-100 text-green-800", icon: FaShieldAlt },
    CONTRIBUTOR: { color: "bg-blue-100 text-blue-800", icon: FaUserCircle },
  };
  return badges[role] || badges.CONTRIBUTOR;
};

// Classification actions
export const handleViewClassification = (classification) => {
  showNotification({
    title: "Classification Details",
    message: `Viewing classification: ${classification.filename}`,
    type: "info",
  });
};

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
