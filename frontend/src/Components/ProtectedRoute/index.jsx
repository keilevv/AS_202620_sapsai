import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import Login from "../../Pages/Login";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/splash-background.webp";
import useStore from "../../hooks/useStore";
import LoadingAnimation from "../Common/LoadingAnimation";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth(true);
  const { uiState, setUiState } = useStore();
  const showLoginAnimation = uiState.showLoginAnimation;

  const checkAuthentication = async () => {
    try {
      const authResult = await isAuthenticated();
      if (authResult) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
        navigate("/login");
      }
    } catch (error) {
      setIsValidSession(false);
      navigate("/login");
    } finally {
      if (showLoginAnimation) {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } else {
        setLoading(false);
      }
      setUiState({ showLoginAnimation: false });
    }
  };

  useEffect(() => {
    if (!isValidSession) {
      checkAuthentication();
    }
  }, [isValidSession]);

  if (loading)
    return (
      <div
        className=" flex flex-col justify-center items-center h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <LoadingAnimation
          animate={true}
          className="md:w-40 md:h-40 w-30 h-30 "
        />
      </div>
    );
  if (!isValidSession) return <Login />;
  if (showLoginAnimation) return <LoadingAnimation animate={true} />;

  return <>{children}</>;
};

export default ProtectedRoute;
