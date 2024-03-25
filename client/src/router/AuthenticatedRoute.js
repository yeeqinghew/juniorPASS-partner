import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../utils/Spinner";
import toast from "react-hot-toast";

const AuthenticatedRoute = ({ isAuthenticated, loading }) => {
  if (!isAuthenticated && !loading && !localStorage.getItem("token")) {
    toast.error("You have not login");
    return <Navigate to="login" />;
  }

  if (loading) {
    return <Spinner />;
  }

  return <Outlet />;
};
export default AuthenticatedRoute;
