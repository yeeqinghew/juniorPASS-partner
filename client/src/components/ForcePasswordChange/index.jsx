import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Steps,
} from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";
import "./ForcePasswordChange.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const ForcePasswordChange = ({ setAuth }) => {
  const baseURL = getBaseURL();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseURL}/partners/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Password changed successfully! Please login again with your new password.");
        form.resetFields();

        // Clear token and log out
        localStorage.removeItem("token");
        setAuth(false);

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-change-page">
      <div className="password-change-container">
        <Card className="password-change-card" bordered={false}>
          {/* Progress Steps */}
          <div className="onboarding-steps">
            <Steps current={0} size="small">
              <Step title="Change Password" icon={<LockOutlined />} />
              <Step title="Complete Profile" />
              <Step title="Start Using Portal" />
            </Steps>
          </div>

          {/* Header */}
          <div className="password-change-header">
            <div className="icon-wrapper">
              <SafetyOutlined className="icon" />
            </div>
            <Title level={2} className="title">
              Change Your Password
            </Title>
            <Paragraph className="subtitle">
              For security reasons, you must change your temporary password before
              proceeding.
            </Paragraph>
          </div>

          {/* Alert */}
          <Alert
            message="First-Time Login Security"
            description="You're logging in with a temporary password. After changing your password, you'll be logged out and asked to login again with your new credentials."
            type="warning"
            showIcon
            icon={<LockOutlined />}
            style={{ marginBottom: 24 }}
          />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Current (Temporary) Password"
              name="currentPassword"
              rules={[
                { required: true, message: "Please enter your current password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter temporary password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain uppercase, lowercase, and number",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={["newPassword"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
                size="large"
              />
            </Form.Item>

            {/* Password Requirements */}
            <div className="password-requirements">
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Password Requirements:
              </Text>
              <ul>
                <li>At least 8 characters long</li>
                <li>Contains at least one uppercase letter</li>
                <li>Contains at least one lowercase letter</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={loading}
                block
              >
                Change Password
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <LogoutOutlined style={{ marginRight: 6 }} />
                You'll be logged out after changing your password
              </Text>
            </div>
          </Form>

          {/* Security Note */}
          <div className="security-note">
            <Text type="secondary">
              <SafetyOutlined /> Your password is encrypted and secure. We never
              store passwords in plain text.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
