import React, { useState } from "react";
import {
  LockOutlined,
  MailOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Typography, Checkbox, Card } from "antd";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
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
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const parseRes = await response.json();

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);

        // Save remember me preference
        if (values.remember) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("userEmail", values.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("userEmail");
        }

        setAuth(true);
        toast.success("Welcome back!");
      } else {
        setAuth(false);
        toast.error(parseRes.message || "Invalid credentials");
      }
    } catch (err) {
      setAuth(false);
      console.error(err.message);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get saved email if remember me was checked
  const savedEmail = localStorage.getItem("rememberMe")
    ? localStorage.getItem("userEmail")
    : "";

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-section">
              <img
                src={require("../../images/logopngResize.png")}
                alt="JuniorPASS"
                className="brand-logo"
              />
            </div>
            <Title level={2} className="brand-title">
              Partner Portal
            </Title>
            <Text className="brand-subtitle">
              Manage your classes, track bookings, and grow your business
            </Text>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  <Text strong>Analytics Dashboard</Text>
                  <Text type="secondary">Track your performance</Text>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📅</div>
                <div className="feature-text">
                  <Text strong>Easy Scheduling</Text>
                  <Text type="secondary">Manage classes effortlessly</Text>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <div className="feature-text">
                  <Text strong>Revenue Tracking</Text>
                  <Text type="secondary">Monitor your earnings</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <Card className="login-card" bordered={false}>
            <div className="form-header">
              <Title level={3}>Welcome Back</Title>
              <Text type="secondary">
                Sign in to access your partner dashboard
              </Text>
            </div>

            <Form
              name="partner_login"
              initialValues={{
                remember: true,
                email: savedEmail,
              }}
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="partner@example.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
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
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <div className="form-extras">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Link to="/reset-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<LoginOutlined />}
                  loading={loading}
                  size="large"
                  className="login-button"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Form.Item>
            </Form>

            <div className="form-footer">
              <Text type="secondary">
                Don't have an account?{" "}
                <a href="mailto:admin@juniorpass.sg" className="signup-link">
                  Contact us
                </a>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
