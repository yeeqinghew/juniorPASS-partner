import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PartnerLogin from "../components/Login";
import PartnerClasses from "../components/Classes";
import PartnerHomeLayout from "../layouts/PartnerHomeLayout";
import PartnerLandingLayout from "../layouts/PartnerLandingLayout";
import PartnerHome from "../components/Home";
import UserContext from "../components/UserContext";
import { Toaster } from "react-hot-toast";
import AuthenticatedRoute from "./AuthenticatedRoute";
import NotFound from "../utils/404";
import ResetPassword from "../components/ResetPassword";
import CreateClass from "../components/Classes/CreateClass";

const Routers = () => {
  const [user, setUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  // TODO: first login cannot get this info
  const getPartnerInfo = async () => {
    try {
      const response = await fetch("http://localhost:5000/partner/", {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const parseRes = await response.json();
      console.log("fafafasfgag", parseRes);
      setUser(parseRes);
    } catch (error) {
      console.error(error.message);
    }
  };

  const isAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      const parseRes = await response.json();
      if (parseRes === true) {
        setAuth(true);
        getPartnerInfo();
      } else {
        setAuth(false);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap')
      </style>
      <link
        href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css"
        rel="stylesheet"
        type="text/css"
      ></link>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="partner/login" />}></Route>
        <Route path="/partner/*" element={<PartnerLandingLayout />}>
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <PartnerLogin setAuth={setAuth} />
              ) : (
                <Navigate replace to="/partner/home"></Navigate>
              )
            }
          ></Route>
          <Route path="reset-password" element={<ResetPassword />}></Route>
          <Route element={<PartnerHomeLayout />}>
            <Route
              element={
                <AuthenticatedRoute
                  isAuthenticated={isAuthenticated}
                  loading={loading}
                />
              }
            >
              <Route path="home" element={<PartnerHome />}></Route>
              <Route path="classes" element={<PartnerClasses />}></Route>
              <Route path="create-class" element={<CreateClass />}></Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default Routers;
