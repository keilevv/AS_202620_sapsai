import { useState, useMemo, useEffect, useCallback } from "react";
import useSpecies from "../../../../../hooks/useSpecies";

function CreateSpeciesForm({
  handleConfirm = () => {},
  closeModal = () => {},
  onCreated = () => {},
  isModal = false,
  registerSubmit = () => {},
  speciesItem = null,
}) {
  function slugify(input = "") {
    return String(input)
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, "")
      .replace(/[\s._]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$|\.$/g, "");
  }

  const { createSpecies, updateSpecies } = useSpecies();
  const [scientificName, setScientificName] = useState(speciesItem?.scientificName || "");
  const [commonNameEn, setCommonNameEn] = useState(speciesItem?.commonNameEn || "");
  const [commonNameEs, setCommonNameEs] = useState(speciesItem?.commonNameEs || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slug = useMemo(() => slugify(scientificName), [scientificName]);

  const canSubmit =
    scientificName.trim() && commonNameEn.trim() && commonNameEs.trim();

  const onSubmit = useCallback(async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      if (speciesItem?.id) {
        await updateSpecies(speciesItem.id, {
          scientificName,
          commonNameEn,
          commonNameEs,
        });
      } else {
        await createSpecies({ scientificName, commonNameEn, commonNameEs });
      }
      setLoading(false);
      setScientificName("");
      setCommonNameEn("");
      setCommonNameEs("");
      if (isModal) {
        closeModal();
      }
      onCreated && onCreated();
    } catch (e) {
      setLoading(false);
      setError(e?.response?.data?.error || "Failed to create species");
    }
  }, [
    canSubmit,
    loading,
    scientificName,
    commonNameEn,
    commonNameEs,
    isModal,
    closeModal,
    onCreated,
    createSpecies,
    updateSpecies,
    speciesItem?.id,
  ]);

  useEffect(() => {
    // Provide submit function to parent (modal)
    registerSubmit(onSubmit);
    return () => registerSubmit(null);
  }, [registerSubmit, onSubmit]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">
          Scientific name
        </label>
        <input
          type="text"
          value={scientificName}
          onChange={(e) => setScientificName(e.target.value)}
          placeholder="e.g. Zea Mays"
          className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <p className="text-xs text-gray-500 mt-1">Slug: {slug || "—"}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Common name (English)
          </label>
          <input
            type="text"
            value={commonNameEn}
            onChange={(e) => setCommonNameEn(e.target.value)}
            placeholder="e.g. Corn"
            className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Nombre común (Español)
          </label>
          <input
            type="text"
            value={commonNameEs}
            onChange={(e) => setCommonNameEs(e.target.value)}
            placeholder="p. ej., Maíz"
            className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
      {!canSubmit && (
        <p className="text-xs text-gray-500">
          Please fill all fields to enable creation.
        </p>
      )}
      {!isModal && (
        <button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      )}
    </div>
  );
}
export default CreateSpeciesForm;
