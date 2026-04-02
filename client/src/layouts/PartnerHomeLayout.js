import React, { useContext, useEffect, useState } from "react";
import {
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Image, Avatar, Typography, Badge } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserContext from "../components/UserContext";
import "./PartnerLayout.css";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const PartnerHomeLayout = ({ setAuth }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(
    location.pathname === "/" || location.pathname === ""
      ? "home"
      : location.pathname.split("/").pop()
  );

  const handleSelectSideMenu = (e) => {
    setCurrent(e);
  };

  useEffect(() => {
    if (location) {
      if (current !== location.pathname) {
        setCurrent(location.pathname);
      }
    }
  }, [location, current]);

  return (
    <Layout className="partner-layout">
      <Sider className="partner-sidebar" width={240}>
        <div className="sidebar-logo-container">
          <Image
            src={require("../images/logopngResize.png")}
            preview={false}
            width={120}
            className="sidebar-logo"
          />
        </div>

        <div className="sidebar-avatar-container">
          <Avatar
            size={80}
            src={user?.picture}
            icon={<UserOutlined />}
            className="sidebar-avatar"
          />
          <Text className="sidebar-user-name">
            {user?.partner_name || "Partner"}
          </Text>
          <Text className="sidebar-user-email">{user?.email || ""}</Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[current]}
          onClick={handleSelectSideMenu}
          items={[
            {
              key: "home",
              icon: <HomeOutlined />,
              label: <Link to="/home">Dashboard</Link>,
            },
            {
              key: "profile",
              icon: <UserOutlined />,
              label: <Link to="/profile">Profile</Link>,
            },
            {
              key: "classes",
              icon: <DatabaseOutlined />,
              label: <Link to="/classes">Classes</Link>,
            },
          ]}
        />

        <div className="sidebar-footer">
          <Text className="sidebar-footer-text">© 2025 juniorPASS</Text>
        </div>
      </Sider>
      <Layout>
        <Header className="partner-header">
          <div style={{ flex: 1 }} />
          <Menu mode="horizontal" className="header-menu" selectable={false}>
            <Menu.Item
              key="notification"
              onClick={() => {
                toast("Notifications feature coming soon!", {
                  icon: "🔔",
                });
              }}
            >
              <Badge count={0} showZero={false}>
                <BellOutlined className="notification-icon" />
              </Badge>
            </Menu.Item>
            <Menu.Item key="logout">
              <LogoutOutlined
                className="logout-button"
                onClick={() => {
                  localStorage.clear();
                  setAuth(false);
                  toast.success("Logged out successfully");
                  navigate("/login");
                }}
              />
            </Menu.Item>
          </Menu>
        </Header>
        <Content className="partner-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PartnerHomeLayout;
