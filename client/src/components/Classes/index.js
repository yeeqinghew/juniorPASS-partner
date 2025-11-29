import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Tabs, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";
import AllClasses from "./AllClasses";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";
import "./Classes.css";

const { Title } = Typography;

const PartnerClasses = ({ setAuth }) => {
  const { user } = useContext(UserContext);
  const baseURL = getBaseURL();
  const navigate = useNavigate();
  const [listing, setListing] = useState([]);

  const token = user && user?.token;

  const getAllListings = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseURL}/listings/partner/${user.partner_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const parseRes = await response.json();
      if (response.status === 200) {
        setListing(parseRes);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [baseURL, token, setAuth, user?.partner_id]);

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token, getAllListings]);

  const handleCreateClass = () => {
    navigate("/create-class");
  };

  return (
    <div className="classes-container">
      <div className="classes-header">
        <Title level={2} className="classes-title">
          My Classes
        </Title>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateClass}
          className="create-class-button"
        >
          Create New Class
        </Button>
      </div>
      
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="large"
        className="classes-tabs"
        items={[
          {
            label: `All Classes (${listing.length})`,
            key: "1",
            children: <AllClasses listing={listing} setListing={setListing} />,
          },
          {
            label: `Active (${listing.filter((l) => l.active).length})`,
            key: "2",
            children: (
              <ActiveClasses listing={listing.filter((l) => l.active)} setListing={setListing} />
            ),
          },
          {
            label: `Inactive (${listing.filter((l) => !l.active).length})`,
            key: "3",
            children: (
              <InactiveClasses
                listing={listing.filter((l) => !l.active)}
                setListing={setListing}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default PartnerClasses;
