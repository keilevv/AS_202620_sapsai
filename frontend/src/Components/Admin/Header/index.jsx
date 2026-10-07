import { FaUserShield } from "react-icons/fa";
function AdminHeader({
  classificationsCount = { total: 0, verified: 0, pending: 0, archived: 0 },
  usersCount = { total: 0, requestedContributor: 0 },
  selectedTab = "classifications",
}) {
  function renderContent() {
    if (selectedTab === "classifications") {
      return (
        <div className="grid grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {classificationsCount.total}
            </div>
            <div className="text-sm text-gray-600">Total Classifications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {classificationsCount.verified}
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {classificationsCount.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      );
    }
    if (selectedTab === "users") {
      return (
        <div className="grid grid-cols-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {usersCount.total}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {usersCount.requestedContributor}
            </div>
            <div className="text-sm text-gray-600">Contributor Requests</div>
          </div>
        </div>
      );
    }
  }
  return (
    <>
      <div className="bg-white shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="px-6 py-8 max-w-7xl mx-auto">
            <h1 className=" flex gap-2 text-3xl font-bold text-white mb-2">
              <FaUserShield className="" /> Admin Dashboard
            </h1>
            <p className="text-green-100">Manage users and classifications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200 justify-center max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
export default AdminHeader;
