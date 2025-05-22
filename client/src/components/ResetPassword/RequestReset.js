import React, { useState } from "react";
import { MailOutlined } from "@ant-design/icons";
import { Button, Form, Image, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import AuthCenteredLayout from "./AuthCenteredLayout";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";

const { Title } = Typography;

const COOLDOWN_SECONDS = 60;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const baseURL = getBaseURL();
  const navigate = useNavigate();

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/partners/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Invalid email.");
        return;
      }

      toast.success("OTP sent to your email.");
      const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
      sessionStorage.setItem("otpCooldownExpiresAt", expiresAt.toString());
      navigate("/verify-reset-otp", { state: { email } });
    } catch (err) {
      toast.error(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCenteredLayout>
      <Title level={3}>Reset your password</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: "300px", margin: "0 auto" }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Invalid email address." },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
            required
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: "100%" }}
        >
          Continue
        </Button>

        <div style={{ padding: "8px 0", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </div>
      </Form>
    </AuthCenteredLayout>
  );
};

export default ResetPassword;
