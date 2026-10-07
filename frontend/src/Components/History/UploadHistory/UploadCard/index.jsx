import { FaCalendarAlt, FaArchive, FaEye, FaEdit } from "react-icons/fa";
import { formatDate, getStatusBadge } from "../../../../utils";
import ClassificationBadge from "../../../Common/Classifications/ClassificationBadge";
import { useNavigate } from "react-router-dom";
import useStore from "../../../../hooks/useStore";

function UploadCard({ upload, openModal, openConfirmModal, shapes = [] }) {
  const navigate = useNavigate();
  const filename = upload.originalFilename.split("/").pop();
  const statusBadge = getStatusBadge(
    upload.isArchived ? "ARCHIVED" : upload.status
  );
  const StatusIcon = statusBadge.icon;
  const { user } = useStore();

  return (
    <div
      key={upload.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full"
    >
      <div className="relative" style={{ height: "200px" }}>
        <img
          src={upload.imagePath}
          alt={upload.originalFilename}
          className="w-full h-full object-cover"
          style={{ border: "1px solid #ccc" }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="space-y-3 flex flex-col h-full">
          <div>
            <h3 className="font-medium text-gray-900 truncate overflow-ellipsis">
              {filename}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FaCalendarAlt className="h-3 w-3 mr-1" />
              {formatDate(upload.createdAt)}
            </div>
          </div>
          <p className="text-md font-medium text-green-700 mb-2">
            Model Output
          </p>

          <div className="grid grid-cols-2 gap-2 ">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Species:
                </p>
                <ClassificationBadge
                  classification={`${upload.scientificName} - ${upload.commonNameEn}`}
                  confidence={upload.speciesConfidence}
                />
              </div>
              <div className="flex flex-col mt-2">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Health:
                </p>
                <ClassificationBadge
                  classification={`${
                    upload.isHealthy ? "Healthy" : "Deseased"
                  }`}
                  confidence={upload.speciesConfidence}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Shape:</p>
              <ClassificationBadge
                classification={upload.shape}
                confidence={upload.shapeConfidence}
              />
            </div>
          </div>
          {user?.role !== "USER" && (
            <>
              <p className="text-md font-medium text-green-700 my-2">
                User Input
              </p>
              <div className="flex flex-col md:grid  md:grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Species:
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-auto self-start bg-gray-100 text-gray-800`}
                    >
                      {upload.scientificName} | {upload.commonNameEn}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Health:
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-auto self-start bg-gray-100 text-gray-800`}
                    >
                      {upload.taggedHealthy ? "Healthy" : "Deseased"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Shape:
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-auto self-start bg-gray-100 text-gray-800`}
                  >
                    {
                      shapes.find(
                        (shape) => shape.nameEn === upload.taggedShape
                      )?.nameEn
                    }
                  </span>
                </div>
              </div>
              <div>
                <p className="text-md font-medium text-green-700 my-2">
                  Status:
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {upload.status}
                </span>{" "}
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mt-auto pt-2">
            <div className="flex flex-wrap space-x-2">
              <button
                onClick={() => openConfirmModal(upload)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 hover:text-red-400 transition-colors cursor-pointer"
              >
                <FaArchive className="h-4 w-4" />
                <span>Archive</span>
              </button>
              {user?.role !== "USER" && (
                <button
                  onClick={() => {
                    navigate(`/history/edit/${upload.id}`);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={() => openModal(upload)}
                className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FaEye className="h-4 w-4" />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadCard;
