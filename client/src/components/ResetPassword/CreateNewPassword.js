import React from "react";
import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCenteredLayout from "./AuthCenteredLayout";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";

const { Title, Text } = Typography;

const CreateNewPassword = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const baseURL = getBaseURL();

  if (!email) {
    toast.error("Email missing. Please retry the reset flow.");
    navigate("/reset-password");
    return null;
  }

  const onFinish = async ({ newPassword }) => {
    try {
      const res = await fetch(`${baseURL}/partners/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Password reset failed.");
        return;
      }

      toast.success("Password updated. You can now log in.");
      sessionStorage.removeItem("otpCooldownExpiresAt");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Unexpected error.");
    }
  };
  return (
    <AuthCenteredLayout>
      <Title level={3}>Create New Password</Title>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <Text>You'll use this password each time you sign in.</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{
          marginTop: 24,
          maxWidth: 300,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Form.Item
          name="newPassword"
          rules={[{ required: true, message: "Enter your new password." }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Confirm your password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match."));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </AuthCenteredLayout>
  );
};

export default CreateNewPassword;
