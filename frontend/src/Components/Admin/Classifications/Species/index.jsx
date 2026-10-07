import { useEffect, useState, useCallback } from "react";
import SpeciesTable from "./SpeciesTable";
import useSpecies from "../../../../hooks/useSpecies";
import useStore from "../../../../hooks/useStore";
import CreateSpeciesModal from "./CreateSpeciesModal";
import { showNotification } from "../../../Common/Notification";
import ConfirmationModal from "../../../Common/ConfirmationModal";
import {
  FaTrash,
  FaSeedling,
  FaFilter,
  FaSearch,
  FaBrush,
} from "react-icons/fa";
import _debounce from "lodash/debounce";
import RangePicker from "../../../Common/RangePicker";
import SwitchComponent from "../../../Common/SwitchComponent";

function SpeciesComponent() {
  const { species, pages, count, getSpecies, deleteSpecies } = useSpecies();
  const { user, preferences } = useStore();
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [confirmationContent, setConfirmationContent] = useState({});
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = preferences?.pageSize || 6;
  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [rangeFilter, setRangeFilter] = useState({ start: null, end: null });
  const [isArchived, setIsArchived] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const f = {};
    if (searchString && searchString.length) f.search = searchString;
    if (rangeFilter.start && rangeFilter.end) {
      f.createdAt_gte = rangeFilter.start;
      f.createdAt_lte = rangeFilter.end;
    }
    f.isArchived = isArchived;
    setFilters(f);
  }, [searchString, rangeFilter, isArchived]);

  useEffect(() => {
    getSpecies(page, pageSize, "createdAt", "desc", filters);
  }, [filters, page, pageSize]);

  useEffect(() => {
    // initial load
    getSpecies(undefined, undefined, "createdAt", "desc", filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEdit(sp) {
    setSelected(sp);
    setOpenModal(true);
  }

  function handleSearch(val) {
    setSearchString(val);
  }

  const debouncedSearch = useCallback(_debounce(handleSearch, 300), []);

  function handleCleanFilters() {
    setSearchString("");
    setRangeFilter({ start: null, end: null });
    setIsArchived(false);
    setFilters({});
  }

  function handleDelete(sp) {
    if (!user || user.role !== "ADMIN") return;
    setSelectedForDelete(sp);
    setConfirmationContent({
      title: "Delete Species",
      message: `Delete confirmation for: ${sp.scientificName}`,
      type: "warning",
      icon: FaTrash,
      iconColor: "text-red-600",
      onConfirm: () => handleDeleteSubmit(sp),
    });
    setOpenConfirmation(true);
  }

  function handleDeleteSubmit(sp) {
    deleteSpecies(sp.id)
      .then(() => {
        showNotification({
          type: "success",
          title: "Species deleted",
          message: sp.scientificName,
        });
        setOpenConfirmation(false);
        setSelectedForDelete(null);
      })
      .catch(() => {
        showNotification({ type: "error", title: "Deletion failed" });
        setOpenConfirmation(false);
        setSelectedForDelete(null);
      });
  }

  return (
    <div className=" p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold flex gap-2 items-center text-green-600">
            <FaSeedling className="mr-2" /> Species
          </h1>
          <button
            onClick={() => {
              setSelected(null);
              setOpenModal(true);
            }}
            className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold"
          >
            Create Species
          </button>
        </div>
        <div className="px-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex gap-2 items-center text-green-700 mt-1 border cursor-pointer border-green-700 px-2 py-1 w-fit hover:bg-green-100 rounded"
          >
            <FaFilter /> Filters
          </button>
          <div
            className={`transition-height duration-300 max-h-0 overflow-hidden ${
              showFilters ? "mt-4" : "mt-0"
            }`}
            style={{ maxHeight: showFilters ? "500px" : "0px" }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by scientific or common name..."
                  onChange={(e) => {
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <RangePicker
                rangeFilter={rangeFilter}
                setRangeFilter={setRangeFilter}
                className="mb-4"
              />
              {/* <div className="flex flex-col gap-2  md:border-l md:border-t-0 md:px-4 border-gray-200 ">
                <label className="text-sm font-medium text-gray-700">
                  Archived
                </label>
                <SwitchComponent
                  loading={false}
                  defaultValue={isArchived}
                  isSelected={isArchived}
                  onChange={setIsArchived}
                  title={isArchived ? "Archived" : "Not Archived"}
                />
              </div> */}
              <div className="flex flex-col gap-2  md:border-l md:border-t-0 md:px-4 border-gray-200  justify-center  ">
                <button
                  onClick={handleCleanFilters}
                  className="px-4 py-2 flex gap-2 justify-center items-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <FaBrush /> Clean Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        <SpeciesTable
          species={species}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <CreateSpeciesModal
          isOpen={openModal}
          closeModal={() => setOpenModal(false)}
          onCreated={() => {
            setOpenModal(false);
            setSelected(null);
            setPage(1);
            getSpecies(1, pageSize, "createdAt", "desc", filters);
          }}
          speciesItem={selected}
        />
        <ConfirmationModal
          isOpen={openConfirmation}
          closeModal={() => {
            setOpenConfirmation(false);
            setSelectedForDelete(null);
            setConfirmationContent({});
          }}
          title={confirmationContent.title}
          message={confirmationContent.message}
          icon={confirmationContent.icon}
          iconColor={confirmationContent.iconColor}
          onConfirm={() => confirmationContent.onConfirm?.()}
        />
      </div>
      {/* Pagination */}
      {pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center  flex-col-reverse gap-2 md:flex-row md:justify-between">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, count)} of {count} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className=" cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`cursor-pointer px-3 md:px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              disabled={page === pages}
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeciesComponent;
