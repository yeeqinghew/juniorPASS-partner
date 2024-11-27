import React, { useContext } from "react";
import { Calendar, Typography } from "antd";
import UserContext from "../UserContext";
const { Title } = Typography;

const PartnerHome = () => {
  const { user } = useContext(UserContext);

  return (
    <>
      <Title level={3}>Dashboard</Title>
      <Calendar />
    </>
  );
};

export default PartnerHome;
