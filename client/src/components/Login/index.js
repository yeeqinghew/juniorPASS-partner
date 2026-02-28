import React, { useState } from "react";
import {
  LockOutlined,
  MailOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  ArrowRightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Checkbox, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import getBaseURL from "../../utils/config";
import "./Login.css";

const { Title, Text } = Typography;

const PartnerLogin = ({ setAuth }) => {
  const baseURL = getBaseURL();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
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
        toast.success("Welcome back! Login successful.");
      } else {
        setAuth(false);
        toast.error(parseRes.message || "Invalid email or password");
      }
    } catch (err) {
      setAuth(false);
      console.error(err.message);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "10px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#52c41a",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff4d4f",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="login-container">
        <Card className="login-card" bordered={false}>
          {/* Header Section */}
          <div className="login-header">
            <img
              src={require("../../images/logopngResize.png")}
              alt="JuniorPASS Logo"
              className="login-logo"
            />
            <div className="partner-badge">
              <TeamOutlined />
              Partner Portal
            </div>
            <Title level={2} className="login-title">
              Welcome Back
            </Title>
            <Text className="login-subtitle">
              Sign in to manage your classes and bookings
            </Text>
          </div>

          {/* Login Form */}
          <Form
            name="partner_login"
            className="partner-login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={handleLogin}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<Text strong>Email Address</Text>}
              rules={[
                {
                  required: true,
                  message: "Please enter your email address",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter your email"
                type="email"
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text strong>Password</Text>}
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="current-password"
              />
            </Form.Item>

            <div className="form-options">
              <div className="remember-checkbox">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </div>
              <Link to="/reset-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                icon={<ArrowRightOutlined />}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          {/* Help Section */}
          <div className="login-help">
            <Text className="help-text">
              Need help? Contact us at
              <a href="mailto:support@juniorpass.sg" className="help-link">
                support@juniorpass.sg
              </a>
            </Text>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default PartnerLogin;
