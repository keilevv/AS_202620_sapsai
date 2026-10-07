import { useState, useEffect } from "react";
import useStore from "./useStore";
import speciesService from "../Services/species";
import { showNotification } from "../Components/Common/Notification";

function useSpecies() {
  const [species, setSpecies] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(0);
  const [count, setCount] = useState(0);
  const { accessToken } = useStore();

  const getSpecies = async (page, limit, sortBy, sortOrder, filters) => {
    setLoading(true);
    try {
      const response = await speciesService.getSpecies(
        page,
        limit,
        sortBy,
        sortOrder,
        filters,
        accessToken
      );
      setSpecies(response.data.results);
      setShapes(response.data.shapes);
      setPages(response.data.pages || 0);
      setCount(response.data.count || 0);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const createSpecies = async ({
    scientificName,
    commonNameEn,
    commonNameEs,
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await speciesService.createSpecies(
        { scientificName, commonNameEn, commonNameEs },
        accessToken
      );
      const created = response?.data?.species;
      if (created) {
        setSpecies((prev) => [created, ...prev]);
      }
      showNotification({
        type: "success",
        title: "Species created",
        message: `${
          created?.scientificName || scientificName
        } was added successfully`,
      });
      return created;
    } catch (e) {
      setError(e);
      showNotification({
        type: "error",
        title: "Creation failed",
        message: e?.response?.data?.error || "Failed to create species",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateSpecies = async (
    id,
    { scientificName, commonNameEn, commonNameEs }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await speciesService.updateSpecies(
        id,
        { scientificName, commonNameEn, commonNameEs },
        accessToken
      );
      const updated = response?.data?.species;
      if (updated) {
        setSpecies((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
      }
      showNotification({
        type: "success",
        title: "Species updated",
        message: `${
          updated?.scientificName || scientificName
        } was updated successfully`,
      });
      return updated;
    } catch (e) {
      setError(e);
      showNotification({
        type: "error",
        title: "Update failed",
        message: e?.response?.data?.error || "Failed to update species",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecies = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await speciesService.deleteSpecies(id, accessToken);
      const deleted = response?.data?.species;
      if (deleted) {
        setSpecies((prev) => prev.filter((item) => item.id !== id));
      }
      showNotification({
        type: "success",
        title: "Species deleted",
        message: `${deleted?.scientificName || id} was deleted successfully`,
      });
      return deleted;
    } catch (e) {
      setError(e);
      showNotification({
        type: "error",
        title: "Deletion failed",
        message: e?.response?.data?.error || "Failed to delete species",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    species,
    shapes,
    loading,
    error,
    pages,
    count,
    getSpecies,
    createSpecies,
    updateSpecies,
    deleteSpecies,
  };
}
export default useSpecies;
