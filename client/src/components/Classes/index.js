import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Tabs, Typography, Input } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const token = user && user?.token;

  const getAllListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${baseURL}/listings/partner/${user.partner_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const parseRes = await response.json();
      if (response.status === 200) {
        setListing(parseRes);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [baseURL, token, setAuth, user?.partner_id]);

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token, getAllListings]);

  const handleCreateClass = () => {
    navigate("/create-class");
  };

  // Filter listings based on search term
  const filteredListings = listing.filter(
    (item) =>
      item.listing_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = listing.filter((l) => l.active).length;
  const inactiveCount = listing.filter((l) => !l.active).length;

  return (
    <div className="classes-container">
      {/* Welcome Banner - matching Dashboard style */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <Title level={2} className="welcome-title">
            My Classes
          </Title>
          <p className="welcome-text">
            Manage your class listings, schedules, and availability
          </p>
        </div>
        <div className="welcome-actions">
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateClass}
            className="welcome-btn-primary"
          >
            Create New Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="classes-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <BookOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-value">{listing.length}</div>
            <div className="stat-label">Total Classes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircleOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Classes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <CloseCircleOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-value">{inactiveCount}</div>
            <div className="stat-label">Inactive Classes</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="classes-toolbar">
        <Input
          placeholder="Search classes by title or description..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="classes-search"
          allowClear
        />
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="1"
        size="large"
        className="classes-tabs"
        items={[
          {
            label: `All (${filteredListings.length})`,
            key: "1",
            children: (
              <AllClasses
                listing={filteredListings}
                setListing={setListing}
                loading={loading}
              />
            ),
          },
          {
            label: `Active (${filteredListings.filter((l) => l.active).length})`,
            key: "2",
            children: (
              <ActiveClasses
                listing={filteredListings.filter((l) => l.active)}
                setListing={setListing}
                loading={loading}
              />
            ),
          },
          {
            label: `Inactive (${filteredListings.filter((l) => !l.active).length})`,
            key: "3",
            children: (
              <InactiveClasses
                listing={filteredListings.filter((l) => !l.active)}
                setListing={setListing}
                loading={loading}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default PartnerClasses;
