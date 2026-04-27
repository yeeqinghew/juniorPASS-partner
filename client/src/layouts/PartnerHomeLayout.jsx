import { useContext, useEffect, useState } from "react";
import {
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Image, Avatar, Typography, Badge, Drawer, Button } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserContext from "../components/UserContext";
import logo from "../images/logopngResize.png";
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
      : location.pathname.split("/").pop(),
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleSelectSideMenu = (e) => {
    setCurrent(e);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location) {
      if (current !== location.pathname) {
        setCurrent(location.pathname);
      }
    }
  }, [location, current]);

  const renderSidebarContent = () => (
    <>
      <div className="sidebar-logo-container">
        <Image
          src={logo}
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
    </>
  );

  return (
    <Layout className="partner-layout">
      <Header className="partner-header">
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="mobile-menu-button"
          />
        )}
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

      <Layout>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider className="partner-sidebar" width={240}>
            {renderSidebarContent()}
          </Sider>
        )}

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          className="mobile-sidebar-drawer"
          width={280}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
          }}
        >
          <div className="mobile-drawer-close">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerVisible(false)}
              className="drawer-close-button"
            />
          </div>
          {renderSidebarContent()}
        </Drawer>

        <Content className="partner-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PartnerHomeLayout;
