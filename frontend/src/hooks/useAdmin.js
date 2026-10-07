import { useState, useEffect } from "react";
import useStore from "./useStore";
import adminService from "../Services/admin";

function useAdmin() {
  const { accessToken } = useStore();
  const [classifications, setClassifications] = useState([]);
  const [classification, setClassification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [classificationsCount, setClassificationsCount] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    archived: 0,
  });
  const [usersCount, setUsersCount] = useState({
    total: 0,
    requestedContributor: 0,
  });
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [shapes, setShapes] = useState([]);

  function getClassifications(page, limit, sortBy, sortOrder, filters = {}) {
    setIsLoading(true);
    return adminService
      .getAdminclassifications(
        page,
        limit,
        sortBy,
        sortOrder,
        filters,
        accessToken
      )
      .then((response) => {
        setClassifications(response.data.results);
        setPages(response.data.pages);
        setClassificationsCount({
          total: response.data.count,
          verified: response.data.totalVerifiedCount,
          pending: response.data.totalPendingCount,
          archived: response.data.totalArchivedCount,
        });
        setShapes(response.data.shapes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching classifications:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function getClassification(id) {
    setIsLoading(true);
    return adminService
      .getAdminClassification(id, accessToken)
      .then((response) => {
        setIsLoading(false);
        setClassification(response.data.results);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error fetching classification:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function updateClassification(id, data) {
    setIsLoading(true);
    return adminService
      .updateAdminClassification(id, data, accessToken)
      .then((response) => {
        setIsLoading(false);
        setClassification(response.data.results);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error updating classification:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function deleteClassification(id) {
    setIsLoading(true);
    return adminService
      .deleteAdminClassification(id, accessToken)
      .then((response) => {
        setIsLoading(false);
        setClassification(response.data.results);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error deleting classification:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function getUsers(page, limit, sortBy, sortOrder, filters = {}) {
    setIsLoading(true);
    return adminService
      .getAdminUsers(page, limit, sortBy, sortOrder, filters, accessToken)
      .then((response) => {
        setUsers(response.data.results);
        setPages(response.data.pages);
        setUsersCount({
          total: response.data.count,
          requestedContributor: response.data.requestedContributorCount,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function getUser(id) {
    setIsLoading(true);
    return adminService
      .getAdminUser(id, accessToken)
      .then((response) => {
        setIsLoading(false);
        setUser(response.data.results);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function updateUser(id, data) {
    setIsLoading(true);
    return adminService
      .updateUserAdmin(id, data, accessToken)
      .then((response) => {
        setIsLoading(false);
        setUser(response.data.results);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function deleteUser(id) {
    setIsLoading(true);
    return adminService
      .deleteAdminUser(id, accessToken)
      .then((response) => {
        setIsLoading(false);
        return response.data.results;
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        setError(error);
        setIsLoading(false);
      });
  }

  return {
    classifications,
    classification,
    shapes,
    isLoading,
    error,
    pages,
    classificationsCount,
    getClassifications,
    getClassification,
    updateClassification,
    deleteClassification,
    users,
    getUsers,
    usersCount,
    getUser,
    updateUser,
    deleteUser,
    user,
  };
}
export default useAdmin;
