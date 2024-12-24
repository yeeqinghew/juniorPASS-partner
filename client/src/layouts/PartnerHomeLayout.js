import React, { useContext, useEffect, useState } from "react";
import {
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Image, Divider, Avatar } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserContext from "../components/UserContext";

const { Header, Sider, Content } = Layout;

const PartnerHomeLayout = ({ setAuth, setIsLoggingOut }) => {
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
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          width: "200px",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            margin: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={require("../images/logopngResize.png")}
            preview={false}
            width={100}
          />
        </div>
        <Divider />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "24px",
          }}
        >
          <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            src={<Image preview={false} src={user?.picture} />}
          />
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={[current]}
          onClick={handleSelectSideMenu}
          items={[
            {
              key: "home",
              icon: <HomeOutlined />,
              label: <Link to="/portal/home">Dashboard</Link>,
            },
            {
              key: "profile",
              icon: <UserOutlined />,
              label: <Link to="/portal/profile">Profile</Link>,
            },
            {
              key: "classes",
              icon: <DatabaseOutlined />,
              label: <Link to="/portal/classes">Classes</Link>,
            },
          ]}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: 200,
        }}
      >
        <Header
          style={{
            padding: 0,
          }}
        >
          <Menu
            mode="horizontal"
            style={{ flex: 1, minWidth: 0, display: "block" }}
          >
            <Menu.Item key="logout" style={{ float: "right" }}>
              <LogoutOutlined
                onClick={() => {
                  localStorage.clear();
                  setAuth(false);
                  setIsLoggingOut(true);
                  toast.success("Logout successfully");
                  navigate("/portal/login");
                }}
              />
            </Menu.Item>
            <Menu.Item
              key="notification"
              style={{ float: "right" }}
              onClick={() => {
                // TODO: Popover antd to show a list of notifcations
              }}
            >
              {/* TODO: <Badge> */}
              <i className="fa fa-bell-o"></i>
            </Menu.Item>
          </Menu>
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "initial",
            padding: 24,
            background: "white",
            borderRadius: "25px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PartnerHomeLayout;
