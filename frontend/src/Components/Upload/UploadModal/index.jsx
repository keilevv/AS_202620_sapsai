import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";
import { getConfidenceColor, formatDate, cn } from "../../../utils";
import { FaImage, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useStore from "../../../hooks/useStore";

function UploadModal({ isOpen, closeModal, selectedUpload }) {
  const navigate = useNavigate();
  const { user } = useStore();
  const filename = selectedUpload?.imagePath.split("/").pop();
  return (
    <>
      {" "}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-green-700 flex gap-2"
                    >
                      <FaImage className="h-5 w-5 text-green-700" /> View Plant
                      Classification
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>

                  {selectedUpload && (
                    <div className="space-y-4">
                      <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
                        <img
                          src={selectedUpload.imagePath}
                          alt={selectedUpload.originalFilename}
                          className="max-w-full max-h-96 rounded-lg object-contain"
                          onError={(e) => {
                            console.error(
                              "Failed to load modal image:",
                              e.target.src
                            );
                            e.target.src = "/vite.svg";
                          }}
                          onLoad={() => {}}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Species:</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                              selectedUpload.speciesConfidence
                            )}`}
                          >
                            {selectedUpload.scientificName} |{" "}
                            {selectedUpload.commonNameEn}{" "}
                            {Math.round(selectedUpload.speciesConfidence * 100)}
                            %
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Shape:</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                              selectedUpload.shapeConfidence
                            )}`}
                          >
                            {selectedUpload.shape}{" "}
                            {Math.round(selectedUpload.shapeConfidence * 100)}%
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Health:</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                              selectedUpload.speciesConfidence
                            )}`}
                          >
                            {selectedUpload.isHealthy ? "Healthy" : "Unhealthy"}{" "}
                            {Math.round(selectedUpload.speciesConfidence * 100)}
                            %
                          </span>
                        </div>
                        {user?.role !== "USER" && (
                          <button
                            onClick={() => {
                              navigate(`/history/edit/${selectedUpload?.id}`);
                            }}
                            className={cn(
                              `flex self-start justify-start items-center max-w-fit`,
                              "space-x-1 px-3 py-1 border border-gray-300",
                              "rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            )}
                          >
                            <FaEdit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Original File Name:
                          </p>
                          <p className="text-gray-700 break-words">
                            {selectedUpload?.originalFilename}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Upload Date:
                          </p>
                          <p className="text-gray-700">
                            {formatDate(selectedUpload.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Stored File Name:
                        </p>
                        <p className="text-gray-700 break-words text-sm">{filename}</p>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
export default UploadModal;
