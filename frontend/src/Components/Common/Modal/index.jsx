import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";
function Modal({
  isOpen = false,
  closeModal = () => {},
  onConfirm,
  title,
  icon: Icon,
  iconColor = "text-green-600",
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) {
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
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className={iconColor + " h-6 w-6"} />}
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title || "Confirm Action"}
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2">
                    {children}
                    <div>
                      <button
                        className="p-2 bg-green-400 text-white rounded mt-4 font-semibold cursor-pointer"
                        onClick={onConfirm}
                      >
                        {confirmText}
                      </button>{" "}
                      <button
                        className="p-2 bg-gray-200 text-gray-600 rounded mt-4 font-semibold ml-2 cursor-pointer"
                        onClick={closeModal}
                      >
                        {cancelText}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
export default Modal;
