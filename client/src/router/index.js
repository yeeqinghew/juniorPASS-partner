import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PartnerLogin from "../components/Login";
import PartnerClasses from "../components/Classes";
import PartnerHomeLayout from "../layouts/PartnerHomeLayout";
import PartnerLandingLayout from "../layouts/PartnerLandingLayout";
import PartnerHome from "../components/Home";
import UserContext from "../components/UserContext";
import toast, { Toaster } from "react-hot-toast";
import AuthenticatedRoute from "./AuthenticatedRoute";
import NotFound from "../utils/404";
import ResetPassword from "../components/ResetPassword";
import CreateClass from "../components/Classes/CreateClass";

const Routers = () => {
  const [user, setUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
        // TODO: navigate back to login
        navigate("/partner/login");
      }
    } catch (err) {
      console.error(err.message);
      localStorage.clear();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    isAuth();
  }, [isAuthenticated]);

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
      <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1594.0.min.js"></script>
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
          <Route element={<PartnerHomeLayout setAuth={setAuth} />}>
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
