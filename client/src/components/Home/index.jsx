import React, { useContext, useState, useEffect } from "react";
import {
  Calendar,
  Typography,
  Row,
  Col,
  Card,
  Button,
  List,
  Space,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import "./Dashboard.css";

const { Title, Text, Paragraph } = Typography;

const PartnerHome = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Dashboard overview stats
      const response = await fetchWithAuth(API_ENDPOINTS.DASHBOARD_OVERVIEW);

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard Overview Data:", data);
        setStats(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      icon: <BookOutlined />,
      value: stats.listings,
      label: "Total Classes",
      colorClass: "pink",
    },
    {
      icon: <CheckCircleOutlined />,
      value: stats.activeClasses,
      label: "Active Classes",
      colorClass: "blue",
    },
    {
      icon: <ShopOutlined />,
      value: stats.credit,
      label: "Total Credits",
      colorClass: "green",
    },
    {
      icon: <TeamOutlined />,
      value: stats.totalStudents,
      label: "Total Enrollments",
      colorClass: "orange",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <Title level={2} className="welcome-title">
            Welcome back, {user?.partner_name || "Partner"}! 👋
          </Title>
          <Paragraph className="welcome-text">
            Here's what's happening with your classes today
          </Paragraph>
        </div>
        <div className="welcome-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="welcome-btn-primary"
            onClick={() => navigate("/create-class")}
          >
            Create Class
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        {statsConfig.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card className="stat-card" bordered={false}>
              <div className={`stat-icon-wrapper ${stat.colorClass}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Recent Activity</span>
              </Space>
            }
            className="recent-card"
          >
            {recentActivities.length > 0 ? (
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <div className="activity-item">
                    <Space align="start">
                      <BookOutlined className="activity-icon" />
                      <div className="flex-1">
                        <div className="activity-title">{item.title}</div>
                        <div className="activity-description">
                          {item.description}
                        </div>
                        <div className="activity-time">{item.time}</div>
                      </div>
                    </Space>
                  </div>
                )}
              />
            ) : (
              <div className="empty-state">
                <ClockCircleOutlined className="empty-state-icon" />
                <div>
                  <Text strong>No recent activity</Text>
                  <div className="mt-8">
                    <Text type="secondary">
                      Start by creating your first class
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Class Schedule</span>
              </Space>
            }
            className="calendar-card"
          >
            <Calendar fullscreen={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PartnerHome;
