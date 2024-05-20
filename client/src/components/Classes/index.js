import React from "react";
import { Button, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";
import AllClasses from "./AllClasses";

const { Title } = Typography;

const PartnerClasses = ({ setAuth }) => {
  const navigate = useNavigate();

  const handleCreateClass = () => {
    navigate("/partner/create-class");
  };

  return (
    <>
      <Title level={3}>Classes</Title>
      <Button onClick={handleCreateClass}>Create a new class</Button>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size={"small"}
        items={[
          {
            label: "All",
            key: 1,
            children: <AllClasses setAuth={setAuth} />,
          },
          {
            label: "Active",
            key: 2,
            children: <ActiveClasses />,
          },
          {
            label: "Inactive",
            key: 3,
            children: <InactiveClasses />,
          },
        ]}
      />
    </>
  );
};

export default PartnerClasses;
