import { FaEdit, FaTrash, FaPlus, FaLeaf } from "react-icons/fa";

function SpeciesTable({
  species = [],
  user,
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scientific Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Common (EN)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Common (ES)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {species.length > 0 ? (
            species.map((sp) => (
              <tr key={sp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                  <FaLeaf className="text-green-600" /> {sp.scientificName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {sp.commonNameEn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {sp.commonNameEs}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sp.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {user?.role === "ADMIN" ? (
                      <button
                        onClick={() => onEdit(sp)}
                        className="cursor-pointer text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="opacity-50 cursor-not-allowed p-2 rounded"
                        title="Restricted"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                    )}
                    {user?.role === "ADMIN" ? (
                      <button
                        onClick={() => onDelete(sp)}
                        className="cursor-pointer text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="opacity-50 cursor-not-allowed p-2 rounded"
                        title="Restricted"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                No species found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export default SpeciesTable;
