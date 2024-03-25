import React from "react";
import { Button, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;

const PartnerClasses = () => {
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
            label: "Active",
            key: 1,
            children: `Content of active`,
          },
          {
            label: "Inctive",
            key: 2,
            children: `Content of inactive`,
          },
        ]}
      />
    </>
  );
};

export default PartnerClasses;
