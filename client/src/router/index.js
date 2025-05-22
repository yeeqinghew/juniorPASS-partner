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
// import ResetPassword from "../components/ResetPassword";
import ResetRequest from "../components/ResetPassword/RequestReset";
import VerifyReset from "../components/ResetPassword/VerifyReset";
import CreateNewPassword from "../components/ResetPassword/CreateNewPassword";
import CreateClass from "../components/Classes/CreateClass";
import useAuth from "../hooks/useAuth";
import Class from "../components/Classes/Class";
import Profile from "../components/Profile";
import { DataProvider } from "../hooks/DataContext";

const Routers = () => {
  const { isAuthenticated, loading, setLoading, user, setAuth } = useAuth();

  return (
    <UserContext.Provider value={{ user }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
          rel="stylesheet"
        />
        <link
          href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css"
          rel="stylesheet"
          type="text/css"
        ></link>
        <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1594.0.min.js"></script>
      </head>

      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/*" element={<PartnerLandingLayout />}>
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <PartnerLogin setAuth={setAuth} />
              ) : (
                <Navigate replace to="/home" />
              )
            }
          />
          {/* <Route path="reset-password" element={<ResetPassword />} /> */}
          <Route path="reset-password" element={<ResetRequest />} />
          <Route path="verify-reset-otp" element={<VerifyReset />} />
          <Route path="create-new-password" element={<CreateNewPassword />} />
          <Route
            element={
              <AuthenticatedRoute
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
            }
          >
            <Route
              element={
                <DataProvider>
                  <PartnerHomeLayout
                    setAuth={setAuth}
                    setLoading={setLoading}
                  />
                </DataProvider>
              }
            >
              <Route path="home" element={<PartnerHome />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="classes"
                element={<PartnerClasses setAuth={setAuth} />}
              />
              <Route path="class/:listing_id" element={<Class />} />
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
