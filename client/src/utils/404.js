import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./404.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        height: "calc(100vh - 285px - 100px - 40px)",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "#98BDD2",
          fontSze: " 12.5rem",
          letterSpacing: "0.1em",
          margin: " 0.025em 0",
          textShadow: "0.05em 0.05em 0 rgba(0, 0, 0, 0.25)",
          whiteSpace: "nowrap",
        }}
      >
        4
        <span>
          <i className="fa fa-frown-o" aria-hidden="true"></i>
        </span>
        4
      </h1>
      <h2
        style={{
          color: "#98BDD2",
          marginBottom: "0.4em",
        }}
      >
        Error: 404 page not found
      </h2>
      <p>Sorry, the page you're looking for cannot be accessed</p>

      <Button
        onClick={() => {
          return navigate(-1);
        }}
      >
        Go back
      </Button>
    </div>
  );
};

export default NotFound;
