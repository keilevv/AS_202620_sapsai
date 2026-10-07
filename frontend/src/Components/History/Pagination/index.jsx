import React from "react";

function Pagination({ page, setPage, totalPages = 10 }) {
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className={`px-3 py-1 rounded-md border ${
          page === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Previous
      </button>
      <span className="px-4 py-1 text-gray-700 font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className={`px-3 py-1 rounded-md border ${
          page === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
