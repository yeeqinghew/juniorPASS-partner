import React from "react";
import { Image } from "antd";
import logo from "../../images/logopngResize.png";

const AuthCenteredLayout = ({ children }) => {
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "100vh",
      }}
    >
      <div style={{ width: "100%", maxWidth: 600, textAlign: "center" }}>
        <Image
          src={logo}
          preview={false}
          style={{ margin: 8, textAlign: "center", width: "auto" }}
        />
        {children}
      </div>
    </section>
  );
};

export default AuthCenteredLayout;
