import { useState, useEffect } from "react";
import {
  FaImage,
  FaSpinner,
  FaHistory,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import UploadModal from "../../Upload/UploadModal";
import ConfirmationModal from "../../Common/ConfirmationModal";
import { getImageUrl } from "../../../utils";
import Pagination from "../Pagination";
import useClassifier from "../../../hooks/useClassifier";
import useStore from "../../../hooks/useStore";
import { showNotification } from "../../Common/Notification";
import UploadCard from "./UploadCard";
import RangePicker from "../../Common/RangePicker";
import _debounce from "lodash/debounce";

export default function UploadHistory() {
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const {
    getUploads,
    uploads,
    shapes,
    isLoading,
    pages,
    updateClassification,
  } = useClassifier();
  const { preferences } = useStore();
  const [rangeFilter, setRangeFilter] = useState({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isArchived, setIsArchived] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Test URL construction
  if (uploads.length > 0) {
    const testUrl = getImageUrl(uploads[0].imagePath);
  }

  const openModal = (upload) => {
    setSelectedUpload(upload);
    setIsOpen(true);
  };

  const openConfirmModal = (upload) => {
    setSelectedUpload(upload);
    setOpenConfirm(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUpload(null);
  };

  useEffect(() => {
    const filters = {};
    if (rangeFilter.start && rangeFilter.end) {
      filters.createdAt_gte = rangeFilter.start;
      filters.createdAt_lte = rangeFilter.end;
    }
    if (searchString.length) {
      filters.search = searchString;
    }
    if (statusFilter !== "ALL") {
      filters.status = statusFilter;
    }
    filters.isArchived = isArchived;

    getUploads(page, preferences.pageSize, "createdAt", "desc", filters);
  }, [
    page,
    preferences.pageSize,
    rangeFilter,
    searchString,
    statusFilter,
    isArchived,
  ]);

  const onConfirmArchive = () => {
    updateClassification(selectedUpload.id, { isArchived: true })
      .then(() => {
        // Refresh uploads after archiving
        showNotification({ message: "Upload archived", type: "success" });
        getUploads(page, preferences.pageSize, "createdAt", "desc");
        setOpenConfirm(false);
        closeModal();
      })
      .catch((error) => {
        showNotification({ message: error.response.data.error, type: "error" });
      });
  };

  const debouncedSearch = _debounce((searchString) => {
    setPage(1);
    setSearchString(searchString);
  }, 300);

  function renderContent() {
    if (uploads.length === 0 && !isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <FaImage className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No uploads yet
            </h3>
            <p className="text-gray-500 text-center">
              Upload your first plant leaf image to see classification results
              here.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <>
          <Pagination page={page} setPage={setPage} totalPages={pages} />
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <FaSpinner className="md:h-10 md:w-10 h-6 w-6 text-green-600 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploads.map((upload) => {
                return (
                  <UploadCard
                    shapes={shapes}
                    key={upload.id}
                    upload={upload}
                    openModal={openModal}
                    openConfirmModal={openConfirmModal}
                  />
                );
              })}
            </div>
          )}
        </>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-green-700">
            <FaHistory /> Upload History
          </h2>
          <p className="flex text-gray-600 mt-1 border-b border-gray-200 pb-2">
            View your previous plant leaf classifications and results
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex gap-2 items-center text-green-700 mt-1 border cursor-pointer border-green-700 px-2 py-1 w-fit hover:bg-green-100 rounded"
          >
            <FaFilter /> Filters
          </button>
          <div
            className="transition-all duration-300 max-h-0 overflow-hidden"
            style={{ maxHeight: showFilters ? "500px" : "0px" }}
          >
            <RangePicker
              rangeFilter={rangeFilter}
              setRangeFilter={setRangeFilter}
              className="mb-4"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by shape, species or filename..."
                  onChange={(e) => {
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  if (e.target.value === "ARCHIVED") {
                    setIsArchived(true);
                  } else {
                    setIsArchived(false);
                    setStatusFilter(e.target.value);
                  }
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Debug info */}
      {/* <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Number of uploads: {uploads.length}</p>
        <p>First upload imagePath: {uploads[0]?.imagePath}</p>
        <p>
          First upload URL:{" "}
          {uploads[0] ? getImageUrl(uploads[0].imagePath) : "N/A"}
        </p>
      </div> */}
      {renderContent()}

      {/* Modal */}
      <UploadModal
        isOpen={isOpen}
        closeModal={closeModal}
        selectedUpload={selectedUpload}
      />
      <ConfirmationModal
        message={
          "Are you sure you want to archive this upload? This action cannot be undone."
        }
        isOpen={openConfirm}
        closeModal={() => setOpenConfirm(false)}
        onConfirm={onConfirmArchive}
      />
    </div>
  );
}
