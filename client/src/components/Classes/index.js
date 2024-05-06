import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";
import UserContext from "../UserContext";

const { Title } = Typography;
const { Meta } = Card;

const AllClasses = ({ setAuth }) => {
  const [listing, setListing] = useState();
  const { user } = useContext(UserContext);
  const token = user && user?.token;

  const getAllListings = async () => {
    try {
      const response = await fetch("http://localhost:5000/listings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const parseRes = await response.json();
      if (response.status === 200) {
        setListing(parseRes);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token]);

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
                maxwidth: 300,
                margin: 24,
              }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
              ]}
              cover={
                <img
                  alt="example"
                  src={list.image}
                  style={{
                    width: "200px",
                    objectFit: "cover",
                  }}
                />
              }
            >
              <Meta title={list.listing_title} />
            </Card>
          );
        })}
    </div>
  );
};

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
