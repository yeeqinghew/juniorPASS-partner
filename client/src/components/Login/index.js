import React from "react";
import {
  LockOutlined,
  MailOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Typography, Image } from "antd";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import getBaseURL from "../../utils/config";

const { Title } = Typography;

const PartnerLogin = ({ setAuth }) => {
  const baseURL = getBaseURL();
  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${baseURL}/partners/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const parseRes = await response.json();
      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
        toast.success("Login successfully");
      } else {
        setAuth(false);
        toast.error("Wrong credential");
      }
    } catch (err) {
      setAuth(false);
      console.error(err.message);
      toast.error(err.message);
    }
  };

  return (
    <>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          margin: "auto",
        }}
      >
        <Toaster />
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src={require("../../images/logopngResize.png")}
              preview={false}
              style={{
                margin: 8,
                textAlign: "center",
                width: "auto",
              }}
            />
          </div>

          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            style={{
              maxWidth: "300px",
            }}
            onFinish={handleLogin}
          >
            <Title
              level={3}
              style={{
                textAlign: "center",
              }}
            >
              Partner Portal
            </Title>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Email"
                type={"email"}
                size={"large"}
                required
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
                size={"large"}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                required
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Log in
            </Button>
            <div
              style={{
                padding: "8px 0",
                textAlign: "center",
              }}
            >
              <Link to="/forgot-password">Forgot password</Link>
            </div>
          </Form>
        </div>
      </section>
    </>
  );
};

export default PartnerLogin;
