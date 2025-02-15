import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../utils/Spinner";
import toast from "react-hot-toast";

const AuthenticatedRoute = ({ isAuthenticated, loading, ...props }) => {
  // Show loading spinner while authentication status is being determined
  if (loading) {
    return <Spinner />;
  }

  // Check if the user is not authenticated or is logging out
  if (!isAuthenticated) {
    toast.error("You have not logged in");
    return <Navigate to="/login" />;
  }

  // Render the child routes if the user is authenticated
  return <Outlet {...props} />;
};

export default AuthenticatedRoute;
