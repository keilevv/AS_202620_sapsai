import {
  FaTrash,
  FaArchive,
  FaEdit,
  FaUndo,
  FaUserPlus,
  FaTimesCircle,
  FaUserMinus,
} from "react-icons/fa";
import { useState } from "react";
import { showNotification } from "../../../Common/Notification";
import ConfirmationModal from "../../../Common/ConfirmationModal";
import { getRoleBadge, formatDate, cn } from "../../../../utils";
import useAdmin from "../../../../hooks/useAdmin";
import { FaExclamationTriangle } from "react-icons/fa";
import useStore from "../../../../hooks/useStore";

function UsersTable({
  users = [],
  usersCount = 0,
  totalPages = 1,
  page = 1,
  setPage = () => {},
  pageSize = 10,
  onUpdateUser = () => {},
  onEditUser = () => {},
}) {
  const { updateUser, deleteUser } = useAdmin();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationContent, setConfirmationContent] = useState({});
  const [newRole, setNewRole] = useState("");
  const { user: userState } = useStore();

  function getPageItems(current, total, max) {
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items = [];
    const side = Math.floor((max - 3) / 2);
    const start = Math.max(2, current - side);
    const end = Math.min(total - 1, current + side);
    items.push(1);
    if (start > 2) items.push("...");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push("...");
    items.push(total);
    return items;
  }

  const openConfirmationModal = (action, user, newRole = null) => {
    setSelectedUser(user);
    let modal = {};
    if (action === "archive") {
      modal = {
        title: "Archive User",
        message: `Archive confirmation for user: ${user?.fullName}`,
        icon: FaArchive,
        iconColor: "text-yellow-500",
        onConfirm: () => handleArchiveUser(user),
      };
    } else if (action === "delete") {
      modal = {
        title: "Delete User",
        message: `Delete confirmation for user: ${user?.fullName}`,
        icon: FaTrash,
        iconColor: "text-red-600",
        onConfirm: () => handleDeleteUser(user),
      };
    } else if (action === "unarchive") {
      modal = {
        title: "Unarchive User",
        message: `Unarchive confirmation for user: ${user?.fullName}`,
        icon: FaUndo,
        iconColor: "text-green-600",
        onConfirm: () => handleUnarchiveUser(user),
      };
    } else if (action === "changeRole") {
      modal = {
        title: "Change Role",
        message: `Change role for user: ${user?.fullName} to ${newRole}`,
        icon: FaEdit,
        iconColor: "text-blue-600",
        onConfirm: () => handleChangeRole(user, newRole),
      };
    } else if (action === "assignContributor") {
      modal = {
        title: "Assign Contributor",
        message: `Assign contributor for user: ${user?.fullName}`,
        icon: FaUserPlus,
        iconColor: "text-green-600",
        onConfirm: () => handleAssignContributor(user),
      };
    } else if (action === "rejectContributor") {
      modal = {
        title: "Reject Contributor",
        message: `Reject contributor for user: ${user?.fullName}`,
        icon: FaUserMinus,
        iconColor: "text-red-600",
        onConfirm: () => handleRejectContributor(user),
      };
    } else {
      modal = {
        title: "Confirm Action",
        message: `Are you sure you want to perform this action for user: ${user?.fullName}`,
        icon: FaExclamationTriangle,
        iconColor: "text-orange-400",
        onConfirm: () => {},
      };
    }
    setConfirmationContent(modal);
    setOpenConfirmation(true);
  };

  const handleArchiveUser = (user) => {
    updateUser(user.id, { isArchived: true })
      .then(() => {
        showNotification({
          title: "User archived",
          message: user.fullName,
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error archiving user:", error);
        showNotification({
          title: "User archiving failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const handleDeleteUser = (user) => {
    deleteUser(user.id)
      .then(() => {
        showNotification({
          title: "User deleted",
          message: user.fullName,
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        showNotification({
          title: "User deletion failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const handleUnarchiveUser = (user) => {
    updateUser(user.id, { isArchived: false })
      .then(() => {
        showNotification({
          title: "User unarchived",
          message: user.fullName,
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error unarchiving user:", error);
        showNotification({
          title: "User unarchive failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const handleChangeRole = (user, nextRole) => {
    updateUser(user.id, { role: nextRole })
      .then(() => {
        showNotification({
          title: "User role changed",
          message: nextRole,
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error updating user role:", error);
        showNotification({
          title: "User role change failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const handleAssignContributor = (user) => {
    updateUser(user.id, { role: "CONTRIBUTOR" })
      .then(() => {
        showNotification({
          title: "User role changed",
          message: "CONTRIBUTOR",
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error updating user role:", error);
        showNotification({
          title: "User role change failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const handleRejectContributor = (user) => {
    updateUser(user.id, { role: "USER", requestedContributorStatus: false })
      .then(() => {
        showNotification({
          title: "Contributor request rejected",
          message: user.fullName,
          type: "success",
        });
        setOpenConfirmation(false);
        onUpdateUser(user);
      })
      .catch((error) => {
        console.error("Error updating user role:", error);
        showNotification({
          title: "Contributor request reject failed",
          message: user.fullName,
          type: "error",
        });
        setOpenConfirmation(false);
      });
  };

  const maxButtons = 7;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classifications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-medium text-sm">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex flex-col gap-2">
                      <span
                        className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                      {user.requestedContributorStatus &&
                        user.role === "USER" && (
                          <span
                            className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-gray-900`}
                          >
                            <FaUserPlus className="h-3 w-3 mr-1" /> Conrtributor
                            Request
                          </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {user.classificationCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEditUser(user)}
                          className="cursor-pointer text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        {user.requestedContributorStatus &&
                          (userState?.role === "ADMIN" ||
                            userState?.role === "MODERATOR") && (
                            <>
                              <button
                                onClick={() =>
                                  openConfirmationModal(
                                    "assignContributor",
                                    user
                                  )
                                }
                                className="cursor-pointer text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                title="Assign Contributor"
                              >
                                <FaUserPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  openConfirmationModal(
                                    "rejectContributor",
                                    user
                                  )
                                }
                                className="cursor-pointer text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Reject Contributor"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        <select
                          disabled={
                            userState?.role === "USER" ||
                            userState?.role === "MODERATOR"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }
                          value={user.role}
                          onChange={(e) => {
                            setNewRole(e.target.value);
                            setSelectedUser(user);
                            openConfirmationModal(
                              "changeRole",
                              user,
                              e.target.value
                            );
                          }}
                          className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            userState?.role === "USER" ||
                            userState?.role === "MODERATOR"
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          title="Change Role"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="CONTRIBUTOR">Contributor</option>
                          <option value="USER">User</option>
                        </select>
                        {user.isArchived ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                openConfirmationModal("unarchive", user)
                              }
                              className="text-green-600 hover:text-green-900 hover:bg-green-50 cursor-pointer p-2 rounded transition-colors"
                              title="Unarchive"
                            >
                              <FaUndo className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                openConfirmationModal("delete", user)
                              }
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer p-2 rounded transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              openConfirmationModal("archive", user)
                            }
                            disabled={
                              userState?.role === "USER" ||
                              userState?.role === "MODERATOR"
                            }
                            className={`text-gray-600 hover:text-gray-900 hover:bg-gray-50  p-2 rounded transition-colors ${
                              userState?.role === "USER" ||
                              userState?.role === "MODERATOR"
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            title="Archive"
                          >
                            <FaArchive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize) > usersCount
              ? Math.min(page * pageSize) - users.length
              : Math.min(page * pageSize)}{" "}
            of {usersCount} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {getPageItems(page, totalPages, maxButtons).map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-gray-500 select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`px-3 md:px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    page === item
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={openConfirmation}
        closeModal={() => {
          setOpenConfirmation(false);
          setSelectedUser(null);
        }}
        title={confirmationContent.title}
        message={confirmationContent.message}
        icon={confirmationContent.icon}
        iconColor={confirmationContent.iconColor}
        onConfirm={() => confirmationContent.onConfirm()}
      />
    </div>
  );
}

export default UsersTable;
