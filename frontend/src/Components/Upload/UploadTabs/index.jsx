import UploadHistory from "../../History/UploadHistory";
import FileUpload from "../../Upload/FileUpload";
import { Tab } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import useClassifier from "../../../hooks/useClassifier";
import useStore from "../../../hooks/useStore";
import {
  FaUpload,
  FaHistory,
  FaUser,
  FaUserShield,
  FaCrown,
} from "react-icons/fa";
function UploadTabs({ children, initialTab = 0, onUpload }) {
  const navigate = useNavigate();
  const { addUpload } = useClassifier();
  const { user } = useStore();
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const handleNewUpload = (upload) => {
    addUpload(upload);
  };

  const role = (user?.role || "USER").toUpperCase();
  const roleConfig = {
    USER: {
      label: "USER",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: FaUser,
      capabilities: ["Upload plant images"],
    },
    CONTRIBUTOR: {
      label: "CONTRIBUTOR",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      icon: FaUser,
      capabilities: [
        "Upload plant images",
        "Give feedback on own classifications",
      ],
    },
    MODERATOR: {
      label: "MODERATOR",
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
      icon: FaUserShield,
      capabilities: [
        "Access admin panel",
        "Give feedback on classifications",
        "Cannot delete entries or edit users",
      ],
    },
    ADMIN: {
      label: "ADMIN",
      color: "bg-green-50 text-green-800 border-green-200",
      icon: FaCrown,
      capabilities: [
        "Upload plant images",
        "Give feedback on classifications",
        "Full admin access: manage entries and edit users",
      ],
    },
  };
  const current = roleConfig[role] || roleConfig.USER;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
      <div className={`p-4 rounded-2xl border ${current.color} mb-8`}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <current.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                User Role
              </h3>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/70 border border-current">
                {current.label}
              </span>
            </div>
            <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
              {current.capabilities.map((cap, idx) => (
                <li key={idx}>{cap}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Tab.Group defaultIndex={initialTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20  mb-8">
          <Tab
            onClick={() => navigate("/upload")}
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-bold leading-5 cursor-pointer",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-gray-600 hover:bg-white/[0.12] hover:text-blue-600"
              )
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <FaUpload className="h-4 w-4" />
              <span className="font-bold">Upload & Classify</span>
            </div>
          </Tab>
          <Tab
            onClick={() => navigate("/history")}
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-bold leading-5 cursor-pointer",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-gray-600 hover:bg-white/[0.12] hover:text-blue-600"
              )
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <FaHistory className="h-4 w-4" />
              <span className="font-bold">Upload History</span>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <FileUpload onUpload={handleNewUpload} />
          </Tab.Panel>
          <Tab.Panel>
            <UploadHistory />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  );
}

export default UploadTabs;
