import React from "react";
import PropTypes from "prop-types";

const sizeClasses = {
  xs: "h-4 w-4 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-2",
  xl: "h-12 w-12 border-2",
};

const colorClasses = {
  blue: "border-blue-500",
  white: "border-white",
  gray: "border-gray-500",
  red: "border-red-500",
  green: "border-green-500",
  yellow: "border-yellow-500",
  indigo: "border-indigo-500",
  purple: "border-purple-500",
  pink: "border-pink-500",
};

function Spinner({ size = "md", color = "blue", className = "" }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div
      role="status"
      className={`inline-block ${sizeClass} ${colorClass} border-t-transparent rounded-full animate-spin ${className}`}
      aria-label="Loading..."
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "blue",
    "white",
    "gray",
    "red",
    "green",
    "yellow",
    "indigo",
    "purple",
    "pink",
  ]),
  className: PropTypes.string,
};

export default Spinner;
