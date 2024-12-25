import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../utils/Spinner";
import toast from "react-hot-toast";

const AuthenticatedRoute = ({
  isAuthenticated,
  loading,
  isLoggingOut, // New prop to indicate if the user is logging out
  ...props
}) => {
  // Check if the user is not authenticated and loading is complete
  if (!isAuthenticated && !loading && !isLoggingOut) {
    toast.error("You have not logged in");
    return <Navigate to="/login" />;
  }

  // Show loading spinner while authentication status is being determined
  if (loading) {
    return <Spinner />;
  }

  // Render the child routes if the user is authenticated
  return <Outlet {...props} />;
};

export default AuthenticatedRoute;
