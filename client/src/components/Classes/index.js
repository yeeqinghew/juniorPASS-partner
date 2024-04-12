import React, { useEffect, useState } from "react";
import { Button, Card, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";

const { Title } = Typography;
const { Meta } = Card;

const AllClasses = () => {
  const [listing, setListing] = useState();
  const getAllListings = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/listing/getAllListings",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const parseRes = await response.json();
      console.log("parseRes", parseRes);
      setListing(parseRes);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    getAllListings();
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {listing &&
        listing.map((list) => {
          return (
            <Card
              hoverable
              key={list.listing_id}
              style={{
                width: 300,
                margin: 24,
              }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
              ]}
              cover={null}
            >
              <Meta title={list.listing_title} description={list.description} />
            </Card>
          );
        })}
    </div>
  );
};

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
            label: "All",
            key: 1,
            children: <AllClasses />,
          },
          {
            label: "Active",
            key: 2,
            children: <ActiveClasses />,
          },
          {
            label: "Inctive",
            key: 3,
            children: <InactiveClasses />,
          },
        ]}
      />
    </>
  );
};

export default PartnerClasses;
