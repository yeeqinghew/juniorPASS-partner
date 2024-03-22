import React from "react";
import {
  DatabaseOutlined,
  AntDesignOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Image, Divider, Avatar } from "antd";
import { Link, Outlet } from "react-router-dom";
const { Header, Sider, Content } = Layout;

const PartnerHomeLayout = () => {
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
            icon={<AntDesignOutlined />}
          />
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <HomeOutlined />,
              label: <Link to="/partner/home">Dashboard</Link>,
            },
            {
              key: "2",
              icon: <DatabaseOutlined />,
              label: <Link to="/partner/classes">Classes</Link>,
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
                  // handle Logout
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
