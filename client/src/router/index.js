import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PartnerLogin from "../components/Login";
import PartnerClasses from "../components/Classes";
import PartnerHomeLayout from "../layouts/PartnerHomeLayout";
import PartnerLandingLayout from "../layouts/PartnerLandingLayout";
import PartnerHome from "../components/Home";
import UserContext from "../components/UserContext";
import AuthenticatedRoute from "./AuthenticatedRoute";
import NotFound from "../utils/404";
import ResetPassword from "../components/ResetPassword";
import CreateClass from "../components/Classes/CreateClass";
import useAuth from "../hooks/useAuth";

const Routers = () => {
  const {
    isAuthenticated,
    loading,
    setLoading,
    isLoggingOut,
    setIsLoggingOut,
    user,
    setAuth,
  } = useAuth();

  return (
    <UserContext.Provider value={{ user }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          /* Add any global styles here */
        `}
        <link
          href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css"
          rel="stylesheet"
          type="text/css"
        ></link>
        <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1594.0.min.js"></script>
      </style>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="partner/login" />} />
        <Route path="/partner/*" element={<PartnerLandingLayout />}>
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <PartnerLogin setAuth={setAuth} />
              ) : (
                <Navigate replace to="/partner/home" />
              )
            }
          />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            element={
              <PartnerHomeLayout
                setAuth={setAuth}
                setLoading={setLoading}
                setIsLoggingOut={setIsLoggingOut}
              />
            }
          >
            <Route
              element={
                <AuthenticatedRoute
                  isAuthenticated={isAuthenticated}
                  loading={loading}
                  isLoggingOut={isLoggingOut}
                />
              }
            >
              <Route path="home" element={<PartnerHome />} />
              <Route
                path="classes"
                element={<PartnerClasses setAuth={setAuth} />}
              />
              <Route path="create-class" element={<CreateClass />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </UserContext.Provider>
  );
};

export default Routers;
