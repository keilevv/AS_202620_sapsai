import LoginForm from "../../Components/LoginForm";
import { FaLeaf } from "react-icons/fa";
import Header from "../../Components/Layout/Header";

function Login() {
  return (
    <>
      <Header className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
      <div className="min-h-screen flex flex-col items-center  bg-gradient-to-br from-green-50 to-emerald-100 p-4 ">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full border-2 border-green-200 shadow-md">
              <FaLeaf className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Plant Classifier
          </h1>
          <p className="text-gray-600">
            Sign in to classify your plant leaves using AI
          </p>
        </div>
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <LoginForm />
        </div>
      </div>
    </>
  );
}

export default Login;
