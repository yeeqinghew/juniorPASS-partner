import React from "react";
import { Routes, Route } from "react-router-dom";
import PartnerLogin from "../components/Login";
import PartnerClasses from "../components/Classes";
import PartnerHomeLayout from "../layouts/PartnerHomeLayout";
import PartnerLandingLayout from "../layouts/PartnerLandingLayout";
import PartnerHome from "../components/Home";

const Routers = () => {
  return (
    <>
      <link
        href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css"
        rel="stylesheet"
        type="text/css"
      ></link>
      <Routes>
        <Route path="/partner/*" element={<PartnerLandingLayout />}>
          <Route path="login" element={<PartnerLogin />}></Route>
          <Route element={<PartnerHomeLayout />}>
            <Route path="home" element={<PartnerHome />}></Route>
            <Route path="classes" element={<PartnerClasses />}></Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default Routers;
