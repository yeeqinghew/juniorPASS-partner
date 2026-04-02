import { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Tabs,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Empty,
  Spin,
  Badge,
  Space,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";
import AllClasses from "./AllClasses";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";
import "./Classes.css";

const { Title, Text } = Typography;
const { Option } = Select;

const PartnerClasses = ({ setAuth }) => {
  const { user } = useContext(UserContext);
  const baseURL = getBaseURL();
  const navigate = useNavigate();

  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const token = user && user?.token;

  const getAllListings = useCallback(async () => {
    setLoading(true);
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

  // Filter listings
  const filteredListings = listing.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const activeCount = listing.filter((l) => l.active).length;
  const inactiveCount = listing.filter((l) => !l.active).length;

  return (
    <div className="classes-page">
      {/* Header */}
      <div className="classes-header">
        <div>
          <Title level={2}>Classes Management</Title>
          <Text type="secondary">
            Manage your classes, schedules, and bookings
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateClass}
        >
          Create New Class
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="classes-stats">
        <Col xs={24} sm={8}>
          <div className="stat-card-mini stat-total">
            <div className="stat-value">{listing.length}</div>
            <div className="stat-label">Total Classes</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="stat-card-mini stat-active">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="stat-card-mini stat-inactive">
            <div className="stat-value">{inactiveCount}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <div className="classes-filters">
        <Space size="middle" wrap>
          <Input
            placeholder="Search classes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            size="large"
            allowClear
          />

          <Select
            placeholder="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            size="large"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Categories</Option>
            <Option value="music">Music</Option>
            <Option value="sports">Sports</Option>
            <Option value="arts">Arts</Option>
            <Option value="academic">Academic</Option>
          </Select>

          <div className="view-toggle">
            <Button.Group size="large">
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </Button.Group>
          </div>
        </Space>
      </div>

      {/* Classes Tabs */}
      {loading ? (
        <div className="classes-loading">
          <Spin size="large" tip="Loading classes..." />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          size="large"
          className="classes-tabs"
          items={[
            {
              label: (
                <span>
                  All Classes
                  <Badge
                    count={listing.length}
                    style={{
                      backgroundColor: "#1890ff",
                      marginLeft: 8,
                    }}
                  />
                </span>
              ),
              key: "1",
              children: (
                <AllClasses
                  listing={filteredListings}
                  setListing={setListing}
                  viewMode={viewMode}
                />
              ),
            },
            {
              label: (
                <span>
                  Active
                  <Badge
                    count={activeCount}
                    style={{
                      backgroundColor: "#0ecb81",
                      marginLeft: 8,
                    }}
                  />
                </span>
              ),
              key: "2",
              children: (
                <ActiveClasses
                  listing={filteredListings.filter((l) => l.active)}
                  viewMode={viewMode}
                />
              ),
            },
            {
              label: (
                <span>
                  Inactive
                  <Badge
                    count={inactiveCount}
                    style={{
                      backgroundColor: "#8892a4",
                      marginLeft: 8,
                    }}
                  />
                </span>
              ),
              key: "3",
              children: (
                <InactiveClasses
                  listing={filteredListings.filter((l) => !l.active)}
                  setListing={setListing}
                  viewMode={viewMode}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default PartnerClasses;
