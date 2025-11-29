import React, { useContext, useState, useEffect } from "react";
import {
  Calendar,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Button,
  List,
  Space,
  Empty,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";
import "./Dashboard.css";

const { Title, Text, Paragraph } = Typography;

const PartnerHome = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const baseURL = getBaseURL();
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    totalOutlets: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const classesResponse = await fetch(`${baseURL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        const activeClasses = classesData.filter(
          (c) => c.status === "active"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalClasses: classesData.length,
          activeClasses: activeClasses,
        }));

        // Generate recent activities from classes
        const activities = classesData.slice(0, 5).map((cls) => ({
          id: cls.class_id,
          type: "class",
          title: cls.class_name,
          description: `${
            cls.status === "active" ? "Active" : "Inactive"
          } class`,
          time: new Date(cls.created_at || Date.now()).toLocaleDateString(),
        }));

        setRecentActivities(activities);
      }

      // Fetch outlets
      if (user?.partner_id) {
        const outletsResponse = await fetch(
          `${baseURL}/partners/${user.partner_id}/outlets`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (outletsResponse.ok) {
          const outletsData = await outletsResponse.json();
          setStats((prev) => ({
            ...prev,
            totalOutlets: outletsData.length,
          }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <PlusOutlined />,
      text: "Create New Class",
      action: () => navigate("/create-class"),
      color: "#E88B8F",
    },
    {
      icon: <BookOutlined />,
      text: "View All Classes",
      action: () => navigate("/classes"),
      color: "#A8C9D9",
    },
    {
      icon: <EditOutlined />,
      text: "Edit Profile",
      action: () => navigate("/profile"),
      color: "#52c41a",
    },
    {
      icon: <BarChartOutlined />,
      text: "View Analytics",
      action: () => {},
      color: "#fa8c16",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <Title level={2} className="welcome-title">
          Welcome back, {user?.partner_name || "Partner"}! 👋
        </Title>
        <Paragraph className="welcome-text">
          Here's what's happening with your classes today
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-pink" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <BookOutlined className="stats-icon" />
              <Title level={2} className="stats-number">
                {stats.totalClasses}
              </Title>
              <Text className="stats-label">Total Classes</Text>
              <div className="stats-change">
                <RiseOutlined /> All time
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-blue" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined className="stats-icon" />
              <Title level={2} className="stats-number">
                {stats.activeClasses}
              </Title>
              <Text className="stats-label">Active Classes</Text>
              <div className="stats-change">Currently running</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-green" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <ShopOutlined className="stats-icon" />
              <Title level={2} className="stats-number">
                {stats.totalOutlets}
              </Title>
              <Text className="stats-label">Total Outlets</Text>
              <div className="stats-change">Locations</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-orange" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <TeamOutlined className="stats-icon" />
              <Title level={2} className="stats-number">
                {stats.totalStudents}
              </Title>
              <Text className="stats-label">Total Enrollments</Text>
              <div className="stats-change">Coming soon</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: "#E88B8F" }} />
            <span>Quick Actions</span>
          </Space>
        }
        className="quick-actions-card"
      >
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <Button
                className="quick-action-button"
                onClick={action.action}
                block
              >
                <div
                  className="quick-action-icon"
                  style={{ color: action.color }}
                >
                  {action.icon}
                </div>
                <div className="quick-action-text">{action.text}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#E88B8F" }} />
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
                      <div style={{ flex: 1 }}>
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
                  <div style={{ marginTop: 8 }}>
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
                <CalendarOutlined style={{ color: "#E88B8F" }} />
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
