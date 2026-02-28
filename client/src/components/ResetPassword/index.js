import React, { useState } from "react";
import {
  MailOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import getBaseURL from "../../utils/config";
import "./ResetPassword.css";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const baseURL = getBaseURL();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/partners/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const parseRes = await response.json();
      if (response.ok) {
        setSubmittedEmail(values.email);
        setEmailSent(true);
        toast.success("Password reset email sent!");
      } else {
        toast.error(parseRes.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset-page">
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

      <div className="reset-container">
        <Card className="reset-card" bordered={false}>
          {/* Header Section */}
          <div className="reset-header">
            <img
              src={require("../../images/logopngResize.png")}
              alt="JuniorPASS Logo"
              className="reset-logo"
            />
            <div className="reset-icon-wrapper">
              <SafetyOutlined className="reset-icon" />
            </div>
            <Title level={2} className="reset-title">
              Reset Password
            </Title>
            <Text className="reset-subtitle">
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email address and we'll send you a link to reset your password"}
            </Text>
          </div>

          {emailSent ? (
            /* Success State */
            <div className="reset-success">
              <div className="success-icon-wrapper">
                <CheckCircleOutlined />
              </div>
              <h3 className="success-title">Email Sent!</h3>
              <p className="success-message">
                We've sent a password reset link to{" "}
                <strong>{submittedEmail}</strong>. Please check your inbox and
                follow the instructions to reset your password.
              </p>
              <Link to="/login" className="back-to-login">
                <ArrowLeftOutlined />
                Back to Login
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <Form
              name="partner_reset"
              className="partner-reset-form"
              onFinish={handleSubmit}
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="reset-button"
                  loading={loading}
                  icon={<SendOutlined />}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Form.Item>

              <Link to="/login" className="back-to-login">
                <ArrowLeftOutlined />
                Back to Login
              </Link>
            </Form>
          )}

          {/* Help Section */}
          <div className="reset-help">
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

export default ResetPassword;