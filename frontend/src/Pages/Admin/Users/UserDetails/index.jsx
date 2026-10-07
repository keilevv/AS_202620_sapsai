import Layout from "../../../../Components/Layout";
import { FaEdit } from "react-icons/fa";
import EditUserForm from "../../../../Components/Admin/Users/EditUserForm";

function UserDetails() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h1 className="flex text-xl font-semibold mb-4 text-green-700 items-center border-b pb-2 border-gray-200">
            <FaEdit className=" mr-2" />
            Edit User
          </h1>
          <EditUserForm />
        </div>
      </div>
    </Layout>
  );
}

export default UserDetails;
