import {
  FaSearch,
  FaImages,
  FaFilter,
  FaBrush,
  FaSeedling,
} from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import _debounce from "lodash/debounce";
import useAdmin from "../../../hooks/useAdmin";
import useStore from "../../../hooks/useStore";
import { useNavigate } from "react-router-dom";
import RangePicker from "../../Common/RangePicker";
import ClassificationsTable from "./ClassificationsTable";
import SwitchComponent from "../../Common/SwitchComponent";

function Classifications({ setClassificationsCount = () => {} }) {
  const navigate = useNavigate();
  const { preferences } = useStore();
  const {
    getClassifications,
    classifications: classificationsData,
    pages,
    shapes,
    classificationsCount,
    isLoading,
  } = useAdmin();
  // Classifications state
  const [classifications, setClassifications] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = preferences?.pageSize || 6;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isArchived, setIsArchived] = useState(false);
  const [filters, setFilters] = useState({});

  const totalPages = pages;
  const [rangeFilter, setRangeFilter] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (classificationsData) {
      setClassifications(classificationsData);
      setClassificationsCount(classificationsCount);
    }
  }, [classificationsData, classificationsCount]);

  useEffect(() => {
    const filters = {};
    if (searchString.length) {
      filters.search = searchString;
    }
    if (rangeFilter.start && rangeFilter.end) {
      filters.createdAt_gte = rangeFilter.start;
      filters.createdAt_lte = rangeFilter.end;
    }
    filters.status = statusFilter;
    filters.isArchived = isArchived;
    setFilters(filters);
  }, [searchString, statusFilter, isArchived, rangeFilter]);

  useEffect(() => {
    getClassifications(page, pageSize, "createdAt", "desc", filters);
  }, [page, pageSize, filters]);

  function handleSearch(inputValue) {
    setSearchString(inputValue);
    setPage(1);
  }

  function onUpdateClassification(classification) {
    getClassifications(page, pageSize, "createdAt", "desc", filters);
  }

  const debouncedSearch = useCallback(_debounce(handleSearch, 300), []);

  const handleCleanFilters = () => {
    setSearchString("");
    setStatusFilter("ALL");
    setIsArchived(false);
    setRangeFilter({ start: null, end: null });
    setFilters({});
    setPage(1);
  };

  return (
    <>
      {" "}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div
            onClick={() => navigate("/admin/species")}
            className="flex justify-between items-center border-b border-gray-200 mb-4 pb-2"
          >
            <h2 className=" flex gap-2  text-2xl font-bold  text-green-700 items-center">
              <FaImages />
              Classifications
            </h2>
            <button className="flex gap-2 items-center text-green-700 mt-1 border cursor-pointer border-green-700 px-2 py-1 w-fit hover:bg-green-100 rounded text-sm">
              <FaSeedling /> Species
            </button>
          </div>
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
                  placeholder="Search by username or classification..."
                  onChange={(e) => {
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <RangePicker
                rangeFilter={rangeFilter}
                setRangeFilter={setRangeFilter}
                className="mb-4"
              />
              <div className="flex flex-col gap-2  md:border-l md:border-t-0 md:px-4 border-gray-200 ">
                <label className="text-sm font-medium text-gray-700">
                  Archived
                </label>
                <SwitchComponent
                  loading={isLoading}
                  defaultValue={isArchived}
                  isSelected={isArchived}
                  onChange={setIsArchived}
                  title={isArchived ? "Archived" : "Not Archived"}
                />
              </div>
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
        <ClassificationsTable
          classifications={classifications}
          setClassifications={setClassifications}
          shapes={shapes}
          totalPages={totalPages}
          page={page}
          pageSize={pageSize}
          classificationsCount={classificationsCount}
          onUpdateClassification={onUpdateClassification}
          setPage={setPage}
        />
      </div>
    </>
  );
}
export default Classifications;
