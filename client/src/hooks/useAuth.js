import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useAuth = () => {
  const [user, setUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const token = localStorage.getItem("token");

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  const getPartnerInfo = async () => {
    try {
      const response = await fetch("http://localhost:5000/partner/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const parseRes = await response.json();
      setUser({ ...parseRes, token: token });
    } catch (error) {
      console.error(error.message);
    }
  };

  const isAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parseRes = await response.json();
      if (response.status === 200 && parseRes === true) {
        setAuth(true);
        getPartnerInfo();
        setLoading(false);
      } else {
        toast.error(parseRes.error);
        localStorage.clear();
        setAuth(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(err.message);
      localStorage.clear();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    isAuth();
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    loading,
    setLoading,
    isLoggingOut,
    setIsLoggingOut,
    user,
    setAuth,
  };
};

export default useAuth;
