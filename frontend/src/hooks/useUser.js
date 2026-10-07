import userService from "../Services/user";
import useStore from "./useStore";
import { useState } from "react";

function useUser() {
  const { user: userStore, accessToken } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  function getUser(userId) {
    setLoading(true);
    return userService
      .getUser(userId, accessToken)
      .then((response) => {
        setLoading(false);
        setUser(response.data?.user);
        return response.data?.user;
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        throw error;
      });
  }
  function updateUser(userId, data) {
    setLoading(true);
    return userService
      .updateUser(userId, data, accessToken)
      .then((response) => {
        setLoading(false);
        if (response.data?.user) {
          setUser(response.data?.user);
        }
        return response.data?.user;
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        throw error;
      });
  }
  return { user, setUser, getUser, updateUser, error, loading };
}

export default useUser;
