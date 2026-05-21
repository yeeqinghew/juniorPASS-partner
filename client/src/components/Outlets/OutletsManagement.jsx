import { useContext, useState, useEffect } from "react";
import {
  Typography,
  Button,
  Modal,
  Input,
  Space,
  Card,
  Tag,
  Empty,
  Spin,
  Image,
  Tooltip,
  Popconfirm,
  Select,
  Radio,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ShopOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { fetchWithAuth } from "../../utils/api";
import UserContext from "../UserContext";
import OutletForm from "./OutletForm";
import toast from "react-hot-toast";
import "./OutletsManagement.css";

const { Title, Text } = Typography;
const { Search } = Input;

const OutletsManagement = () => {
  const { user } = useContext(UserContext);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchOutlets();
  }, [user]);

  useEffect(() => {
    filterAndSortOutlets();
  }, [outlets, searchTerm, sortBy]);

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `/outlets/partner/${user?.partner_id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setOutlets(data || []);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
      toast.error("Failed to load outlets");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOutlets = () => {
    let filtered = [...outlets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (outlet) =>
          outlet.outlet_name?.toLowerCase().includes(term) ||
          outlet.description?.toLowerCase().includes(term) ||
          outlet.nearest_mrt?.toLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.outlet_name || "").localeCompare(b.outlet_name || "");
        case "listings":
          return (b.listing_count || 0) - (a.listing_count || 0);
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredOutlets(filtered);
  };

  const handleCreate = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOutlet(null);
  };

  const handleSaveSuccess = () => {
    toast.success(
      `Outlet ${editingOutlet ? "updated" : "created"} successfully!`,
    );
    setIsModalOpen(false);
    setEditingOutlet(null);
    fetchOutlets();
  };

  const getAddress = (addressJson) => {
    try {
      const addr =
        typeof addressJson === "string" ? JSON.parse(addressJson) : addressJson;
      return addr?.ADDRESS || "No address";
    } catch {
      return "No address";
    }
  };

  const getImages = (imagesJson) => {
    try {
      const imgs =
        typeof imagesJson === "string" ? JSON.parse(imagesJson) : imagesJson;
      return Array.isArray(imgs) ? imgs : [];
    } catch {
      return [];
    }
  };

  const renderOutletCard = (outlet) => {
    const images = getImages(outlet.images);
    const hasImages = images.length > 0;

    return (
      <Card
        key={outlet.outlet_id}
        className="outlet-card"
        hoverable
        cover={
          <div className="outlet-card-cover">
            {hasImages ? (
              <div className="outlet-image-wrapper">
                <Image.PreviewGroup>
                  <Image
                    src={images[0]}
                    alt={outlet.outlet_name}
                    className="outlet-main-image"
                    preview={{
                      mask: `View ${images.length} ${
                        images.length === 1 ? "Photo" : "Photos"
                      }`,
                    }}
                  />
                  {images.slice(1).map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`${outlet.outlet_name} ${idx + 2}`}
                      style={{ display: "none" }}
                    />
                  ))}
                </Image.PreviewGroup>
                {images.length > 1 && (
                  <div className="outlet-image-count">
                    <ShopOutlined /> {images.length} Photos
                  </div>
                )}
              </div>
            ) : (
              <div className="outlet-placeholder-cover">
                <ShopOutlined />
                <Text type="secondary">No Photos</Text>
              </div>
            )}
            <div className="outlet-card-overlay">
              <Tooltip title="Edit Outlet">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(outlet);
                  }}
                  className="outlet-action-btn edit-btn"
                />
              </Tooltip>
            </div>
          </div>
        }
      >
        <div className="outlet-card-content">
          <div className="outlet-header">
            <Title level={4} className="outlet-name">
              {outlet.outlet_name}
            </Title>
            {outlet.description && (
              <Text
                type="secondary"
                className="outlet-description"
                ellipsis={{ rows: 2 }}
              >
                {outlet.description}
              </Text>
            )}
          </div>

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div className="outlet-info-row">
              <EnvironmentOutlined className="outlet-icon" />
              <div className="outlet-info-content">
                <Text strong className="outlet-info-label">
                  Location
                </Text>
                <Text className="outlet-info-value" ellipsis>
                  {getAddress(outlet.address)}
                </Text>
              </div>
            </div>

            <div className="outlet-info-row">
              <Tag color="blue" className="outlet-mrt-tag">
                {outlet.nearest_mrt} MRT
              </Tag>
            </div>

            {outlet.phone_number && (
              <div className="outlet-info-row">
                <PhoneOutlined className="outlet-icon" />
                <Text className="outlet-phone">{outlet.phone_number}</Text>
              </div>
            )}

            <div className="outlet-stats">
              <Tag
                icon={<ShopOutlined />}
                color="success"
                className="outlet-stat-tag"
              >
                {outlet.listing_count || 0} Listings
              </Tag>
              <Tag
                icon={<CalendarOutlined />}
                color="processing"
                className="outlet-stat-tag"
              >
                {outlet.future_bookings_count || 0} Bookings
              </Tag>
            </div>
          </Space>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="outlets-management">
        <div className="outlets-loading">
          <Spin size="large" />
          <Text>Loading outlets...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="outlets-management">
      <div className="outlets-management-inner">
        <div className="outlets-header">
          <div className="outlets-header-content">
            <div className="outlets-title-section">
              <ShopOutlined className="outlets-header-icon" />
              <div>
                <Title level={2} className="outlets-title">
                  My Outlets
                </Title>
                <Text className="outlets-subtitle">
                  Manage your physical locations where classes are held
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="add-outlet-btn"
            >
              Add Outlet
            </Button>
          </div>
        </div>

        <Card className="outlets-controls-card">
          <div className="outlets-controls">
            <Search
              placeholder="Search outlets by name, MRT, or description..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outlet-search"
              style={{ maxWidth: 400 }}
            />

            <div className="outlets-controls-right">
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="large"
                className="outlet-sort"
                style={{ width: 160 }}
              >
                <Select.Option value="newest">Newest First</Select.Option>
                <Select.Option value="name">By Name</Select.Option>
                <Select.Option value="listings">Most Listings</Select.Option>
              </Select>

              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
                size="large"
              >
                <Radio.Button value="grid">
                  <AppstoreOutlined /> Grid
                </Radio.Button>
                <Radio.Button value="list">
                  <UnorderedListOutlined /> List
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </Card>

        {filteredOutlets.length === 0 ? (
          <Card className="outlets-empty-card">
            <Empty
              image={
                <ShopOutlined
                  style={{ fontSize: 80, color: "var(--primary-color)" }}
                />
              }
              description={
                searchTerm ? (
                  <Space direction="vertical">
                    <Text>No outlets match your search</Text>
                    <Button onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  </Space>
                ) : (
                  <Space direction="vertical">
                    <Text>No outlets yet</Text>
                    <Text type="secondary">
                      Add your first location to get started!
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                    >
                      Add Your First Outlet
                    </Button>
                  </Space>
                )
              }
            />
          </Card>
        ) : (
          <div
            className={`outlets-grid ${
              viewMode === "list" ? "outlets-list" : ""
            }`}
          >
            {filteredOutlets.map((outlet) => renderOutletCard(outlet))}
          </div>
        )}

        <Modal
          title={
            <Space>
              <ShopOutlined />
              <span>{editingOutlet ? "Edit Outlet" : "Add New Outlet"}</span>
            </Space>
          }
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={720}
          destroyOnClose
          className="outlet-modal"
        >
          <OutletForm
            outlet={editingOutlet}
            onSuccess={handleSaveSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </div>
  );
};

export default OutletsManagement;
