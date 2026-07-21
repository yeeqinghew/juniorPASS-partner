import { useContext, useEffect, useState } from "react";
import { Button, Calendar, Card, Col, Row, Skeleton, Typography } from "antd";
import {
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
  PlusOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import "./Dashboard.css";

const { Title, Text, Paragraph } = Typography;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const PartnerHome = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(API_ENDPOINTS.DASHBOARD_OVERVIEW);
        if (response.ok) setStats(await response.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      icon: <BookOutlined />,
      value: stats.listings ?? 0,
      label: "Published classes",
      detail: "Across your catalogue",
      tone: "blue",
    },
    {
      icon: <TeamOutlined />,
      value: stats.bookings ?? 0,
      label: "Total bookings",
      detail: "All-time enrolments",
      tone: "pink",
    },
    {
      icon: <ShopOutlined />,
      value: stats.credit ?? 0,
      label: "Credit balance",
      detail: "Available partner credits",
      tone: "green",
    },
    {
      icon: <NotificationOutlined />,
      value: stats.unread_notifications ?? 0,
      label: "Unread updates",
      detail: "Items needing attention",
      tone: "amber",
    },
  ];

  const quickActions = [
    {
      icon: <PlusOutlined />,
      title: "Create a class",
      description: "Add a new activity to your catalogue",
      route: "/create-class",
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Manage outlets",
      description: "Keep venue information up to date",
      route: "/outlets",
    },
    {
      icon: <BookOutlined />,
      title: "View all classes",
      description: "Edit schedules, pricing, and availability",
      route: "/classes",
    },
  ];

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <Text className="dashboard-hero-kicker">Partner workspace</Text>
          <Title level={1} className="dashboard-hero-title">
            {getGreeting()}, {user?.partner_name || "Partner"}
          </Title>
          <Paragraph className="dashboard-hero-description">
            Keep an eye on your catalogue, bookings, and locations from one place.
          </Paragraph>
          <div className="dashboard-hero-actions">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/create-class")}
              className="dashboard-primary-action"
            >
              Create class
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/classes")}
              className="dashboard-secondary-action"
            >
              Manage classes
            </Button>
          </div>
        </div>

        <div className="dashboard-hero-visual" aria-hidden="true">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-visual-card">
            <span className="hero-visual-icon">
              <CalendarOutlined />
            </span>
            <div>
              <Text className="hero-visual-label">Today</Text>
              <Text className="hero-visual-date">
                {new Intl.DateTimeFormat("en-SG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date())}
              </Text>
            </div>
          </div>
        </div>
      </section>

      <Row gutter={[16, 16]} className="dashboard-stats-row">
        {statsConfig.map((stat) => (
          <Col xs={12} xl={6} key={stat.label}>
            <Card className="dashboard-stat-card" bordered={false}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: "45%" }} />
              ) : (
                <>
                  <div className={`dashboard-stat-icon ${stat.tone}`}>{stat.icon}</div>
                  <div className="dashboard-stat-value">{stat.value}</div>
                  <div className="dashboard-stat-label">{stat.label}</div>
                  <div className="dashboard-stat-detail">{stat.detail}</div>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]} className="dashboard-main-grid">
        <Col xs={24} xl={14}>
          <Card
            className="dashboard-panel calendar-panel"
            title={
              <div className="dashboard-panel-heading">
                <span className="dashboard-panel-icon"><CalendarOutlined /></span>
                <div>
                  <Text className="dashboard-panel-title">Schedule overview</Text>
                  <Text className="dashboard-panel-subtitle">Plan around upcoming class dates</Text>
                </div>
              </div>
            }
          >
            <Calendar fullscreen={false} />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="dashboard-panel quick-actions-panel"
            title={
              <div className="dashboard-panel-heading">
                <span className="dashboard-panel-icon"><ShopOutlined /></span>
                <div>
                  <Text className="dashboard-panel-title">Quick actions</Text>
                  <Text className="dashboard-panel-subtitle">Common workspace tasks</Text>
                </div>
              </div>
            }
          >
            <div className="dashboard-action-list">
              {quickActions.map((action) => (
                <button
                  type="button"
                  className="dashboard-action-item"
                  key={action.title}
                  onClick={() => navigate(action.route)}
                >
                  <span className="dashboard-action-icon">{action.icon}</span>
                  <span className="dashboard-action-copy">
                    <strong>{action.title}</strong>
                    <small>{action.description}</small>
                  </span>
                  <ArrowRightOutlined className="dashboard-action-arrow" />
                </button>
              ))}
            </div>
          </Card>

          <div className="dashboard-help-card">
            <div>
              <Text className="dashboard-help-kicker">Account</Text>
              <Title level={4}>Keep your business details current</Title>
              <Paragraph>
                Accurate profile and outlet information helps families discover you.
              </Paragraph>
            </div>
            <Button onClick={() => navigate("/profile")}>Review profile</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PartnerHome;
