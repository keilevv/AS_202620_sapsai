import { FaSearch, FaUsers, FaFilter, FaBrush } from "react-icons/fa";
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import _debounce from "lodash/debounce";
import useAdmin from "../../../hooks/useAdmin";
import useStore from "../../../hooks/useStore";
import RangePicker from "../../Common/RangePicker";
import UsersTable from "./UsersTable";
import { useNavigate } from "react-router-dom";
const Checkbox = lazy(() => import("../../Common/Checkbox"));

function Users({ setUsersCount = () => {} }) {
  const { preferences } = useStore();
  const navigate = useNavigate();
  const { users: usersData, getUsers, usersCount } = useAdmin();
  const [users, setUsers] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = preferences?.pageSize || 6;
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [isArchived, setIsArchived] = useState(false);
  const [isRequestedContributor, setIsRequestedContributor] = useState(false);
  const [rangeFilter, setRangeFilter] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil((usersCount?.total || 0) / pageSize) || 1;

  useEffect(() => {
    if (usersData) {
      setUsersCount({
        total: usersCount.total,
        requestedContributor: usersCount.requestedContributor,
      });
      setUsers(usersData);
    }
  }, [usersData, usersCount]);

  useEffect(() => {
    const filters = {};
    if (searchString.length) filters.search = searchString;
    filters.role = userRoleFilter;
    filters.isArchived = isArchived;
    if (isRequestedContributor) filters.requestedContributorStatus = true;
    if (rangeFilter.start && rangeFilter.end) {
      filters.createdAt_gte = rangeFilter.start;
      filters.createdAt_lte = rangeFilter.end;
    }
    getUsers(page, pageSize, "createdAt", "desc", filters);
  }, [
    page,
    pageSize,
    userRoleFilter,
    searchString,
    isArchived,
    rangeFilter,
    isRequestedContributor,
  ]);

  function handleSearch(inputValue) {
    setSearchString(inputValue);
    setPage(1);
  }
  const debouncedSearch = useCallback(_debounce(handleSearch, 300), []);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleCleanFilters = () => {
    setSearchString("");
    setSearchInput("");
    setUserRoleFilter("ALL");
    setIsArchived(false);
    setIsRequestedContributor(false);
    setRangeFilter({ start: null, end: null });
    setPage(1);
  };

  function onUpdateUser() {
    const filters = {};
    if (searchString.length) filters.search = searchString;
    filters.role = userRoleFilter;
    filters.isArchived = isArchived;
    if (isRequestedContributor) filters.requestedContributorStatus = true;
    if (rangeFilter.start && rangeFilter.end) {
      filters.createdAt_gte = rangeFilter.start;
      filters.createdAt_lte = rangeFilter.end;
    }
    getUsers(page, pageSize, "createdAt", "desc", filters);
  }

  return (
    <>
      {" "}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className=" flex gap-2 border-b border-gray-200 text-2xl font-bold mb-4 pb-2 text-green-700 items-center">
            <FaUsers />
            Users
          </h2>
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
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="CONTRIBUTOR">Contributor</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <RangePicker setRangeFilter={setRangeFilter} className="mb-4" />
              <div className="flex flex-col gap-2 md:border-l md:px-4 border-gray-200">
                <label className="text-sm font-medium text-gray-700">Filters</label>
                <div className="flex items-center gap-6">
                  <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
                    <Checkbox
                      label="Archived"
                      isSelected={isArchived}
                      onChange={setIsArchived}
                    />
                  </Suspense>
                  <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
                    <Checkbox
                      label="Contributor Request"
                      isSelected={isRequestedContributor}
                      onChange={setIsRequestedContributor}
                    />
                  </Suspense>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:border-l md:px-4 border-gray-200 justify-center">
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
        <UsersTable
          users={users}
          usersCount={usersCount.total}
          totalPages={Math.ceil((usersCount.total || 0) / pageSize) || 1}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          onUpdateUser={onUpdateUser}
          onEditUser={(user) => navigate(`/admin/user/${user.id}`)}
        />
      </div>
    </>
  );
}
export default Users;
