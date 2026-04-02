import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Calendar,
  Badge,
  List,
  Typography,
  Button,
  Spin,
  Empty,
  Avatar,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";
import "./Dashboard.css";

const { Title, Text, Paragraph } = Typography;

const PartnerDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const baseURL = getBaseURL();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: { current: 0, change: 0 },
    bookings: { current: 0, change: 0 },
    attendance: { current: 0, change: 0 },
    rating: { current: 0, reviews: 0 },
    recentBookings: [],
    upcomingClasses: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch dashboard analytics
      const response = await fetch(`${baseURL}/partners/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    // Get bookings for specific date
    const dateStr = value.format("YYYY-MM-DD");
    const dayBookings = dashboardData.upcomingClasses.filter(
      (cls) => cls.date === dateStr
    );
    return dayBookings || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="calendar-events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status="processing" text={item.title} />
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="partner-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <Title level={2}>Dashboard</Title>
          <Paragraph type="secondary">
            Welcome back, {user?.partner_name || "Partner"}! Here's what's happening today.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-class")}
        >
          Create New Class
        </Button>
      </div>

      {/* Analytics Cards */}
      <Row gutter={[24, 24]} className="analytics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-revenue" bordered={false}>
            <div className="stat-icon-wrapper">
              <DollarOutlined className="stat-icon" />
            </div>
            <Statistic
              title="Revenue (This Month)"
              value={dashboardData.revenue.current}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#0ecb81", fontWeight: 800 }}
            />
            <div className="stat-change">
              {dashboardData.revenue.change >= 0 ? (
                <span className="stat-change-positive">
                  <ArrowUpOutlined /> {dashboardData.revenue.change}% from last month
                </span>
              ) : (
                <span className="stat-change-negative">
                  <ArrowDownOutlined /> {Math.abs(dashboardData.revenue.change)}% from last month
                </span>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-bookings" bordered={false}>
            <div className="stat-icon-wrapper">
              <CalendarOutlined className="stat-icon" />
            </div>
            <Statistic
              title="Total Bookings"
              value={dashboardData.bookings.current}
              valueStyle={{ color: "#1890ff", fontWeight: 800 }}
            />
            <div className="stat-change">
              {dashboardData.bookings.change >= 0 ? (
                <span className="stat-change-positive">
                  <RiseOutlined /> {dashboardData.bookings.change}% increase
                </span>
              ) : (
                <span className="stat-change-neutral">
                  {Math.abs(dashboardData.bookings.change)}% from last month
                </span>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-attendance" bordered={false}>
            <div className="stat-icon-wrapper">
              <UserOutlined className="stat-icon" />
            </div>
            <Statistic
              title="Attendance Rate"
              value={dashboardData.attendance.current}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#f7b731", fontWeight: 800 }}
            />
            <div className="stat-change">
              <span className="stat-change-neutral">
                Based on recent classes
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-rating" bordered={false}>
            <div className="stat-icon-wrapper">
              <StarOutlined className="stat-icon" />
            </div>
            <Statistic
              title="Average Rating"
              value={dashboardData.rating.current}
              precision={1}
              suffix="/ 5.0"
              valueStyle={{ color: "#ff6b4a", fontWeight: 800 }}
            />
            <div className="stat-change">
              <span className="stat-change-neutral">
                From {dashboardData.rating.reviews} reviews
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} className="dashboard-content">
        {/* Calendar */}
        <Col xs={24} lg={14}>
          <Card
            title="Class Schedule"
            className="calendar-card"
            bordered={false}
            extra={
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate("/classes")}
              >
                View All Classes
              </Button>
            }
          >
            <Calendar
              fullscreen={false}
              dateCellRender={dateCellRender}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={10}>
          <Card
            title="Recent Bookings"
            className="activity-card"
            bordered={false}
            extra={
              <Button type="link" onClick={() => navigate("/bookings")}>
                View All
              </Button>
            }
          >
            {dashboardData.recentBookings.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent bookings"
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentBookings}
                renderItem={(item) => (
                  <List.Item
                    className="booking-item"
                    actions={[
                      <Badge
                        status={item.status === "confirmed" ? "success" : "processing"}
                        text={item.status}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={44}
                          style={{
                            backgroundColor: "#1890ff",
                            fontSize: 18,
                          }}
                        >
                          {item.user_name?.charAt(0) || "U"}
                        </Avatar>
                      }
                      title={
                        <Text strong>{item.listing_title}</Text>
                      }
                      description={
                        <div>
                          <div>{item.user_name}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.date} at {item.time}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Quick Actions */}
          <Card
            title="Quick Actions"
            className="quick-actions-card mt-xl"
            bordered={false}
          >
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/create-class")}
                >
                  New Class
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => navigate("/classes")}
                >
                  My Classes
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => navigate("/profile")}
                >
                  Edit Profile
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => navigate("/bookings")}
                >
                  Bookings
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PartnerDashboard;
