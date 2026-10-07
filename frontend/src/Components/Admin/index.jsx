import { Tab } from "@headlessui/react";
import { useState, useEffect } from "react";
import { FaUsers, FaImages } from "react-icons/fa";
import AdminHeader from "./Header";
import ClassificationsTable from "./Classifications";
import Users from "./Users";
import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminPage({ initialTab = 0 }) {
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
  const [selectedTab, setSelectedTab] = useState("classifications");
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/admin/classifications") {
      setSelectedTab("classifications");
    } else if (window.location.pathname === "/admin/users") {
      setSelectedTab("users");
    }
  }, [window.location.pathname]);

  return (
    <div>
      <AdminHeader
        selectedTab={selectedTab}
        classificationsCount={classificationsCount}
        usersCount={usersCount}
      />
      <div className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <Tab.Group defaultIndex={initialTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-green-900/20 p-1 mb-8">
            <Tab
              onClick={() => {
                setSelectedTab("classifications");
                navigate("/admin/classifications");
              }}
              className={({ selected }) =>
                classNames(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 cursor-pointer ",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-gray-700 hover:bg-white/[0.12] hover:text-blue-700"
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <FaImages className="h-4 w-4" />
                <span className="font-bold">Classifications</span>
              </div>
            </Tab>
            <Tab
              onClick={() => {
                setSelectedTab("users");
                navigate("/admin/users");
              }}
              className={({ selected }) =>
                classNames(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 cursor-pointer",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-gray-700 hover:bg-white/[0.12] hover:text-blue-700"
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <FaUsers className="h-4 w-4" />
                <span className="font-bold">Users</span>
              </div>
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Classifications Panel */}
            <Tab.Panel>
              <ClassificationsTable
                setClassificationsCount={setClassificationsCount}
              />
            </Tab.Panel>

            {/* Users Panel */}
            <Tab.Panel>
              <Users setUsersCount={setUsersCount} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
