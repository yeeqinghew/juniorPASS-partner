import React, { useState, useEffect } from "react";
import { NumberOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCenteredLayout from "./AuthCenteredLayout";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";

const { Title } = Typography;

const MAX_OTP_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

const VerifyResetOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [form] = Form.useForm();
  const baseURL = getBaseURL();

  const [otpAttempts, setOtpAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [isLocked, setIsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email.");
      navigate("/forgot-password");
      return;
    }

    const locked = sessionStorage.getItem("otpLocked") === "1";
    if (locked) {
      setIsLocked(true);
    }

    const expiresAt =
      Number(sessionStorage.getItem("otpCooldownExpiresAt")) || 0;
    const timeLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    setCooldown(timeLeft);

    if (timeLeft > 0) {
      updateCooldownCountdown();
    } else {
      sendOtp();
      const newExpiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
      sessionStorage.setItem("otpCooldownExpiresAt", newExpiresAt.toString());
      updateCooldownCountdown();
    }
  }, []);

  const startCooldown = () => {
    const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
    sessionStorage.setItem("otpCooldownExpiresAt", expiresAt.toString());
    updateCooldownCountdown();
  };

  const updateCooldownCountdown = () => {
    const interval = setInterval(() => {
      const expiresAt =
        Number(sessionStorage.getItem("otpCooldownExpiresAt")) || 0;
      const timeLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCooldown(timeLeft);

      if (timeLeft <= 0) clearInterval(interval);
    }, 1000);
  };

  const sendOtp = async () => {
    setIsResending(true);
    try {
      const res = await fetch(`${baseURL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("OTP sent.");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
      setOtpAttempts(0);
      setIsLocked(false);
      startCooldown();
    }
  };

  const onVerify = async (values) => {
    if (isLocked) return;

    setIsVerifying(true);
    try {
      const res = await fetch(`${baseURL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: values.otp }),
      });

      if (!res.ok) {
        const attempts = otpAttempts + 1;
        setOtpAttempts(attempts);

        if (attempts >= MAX_OTP_ATTEMPTS) {
          setIsLocked(true);
          sessionStorage.setItem("otpLocked", "1"); // persist lock
          toast.error("Too many attempts. Request a new code to continue.");
        } else {
          toast.error("Invalid code.");
        }
        return;
      }

      toast.success("OTP verified.");
      sessionStorage.removeItem("otpLocked");
      navigate("/create-new-password", { state: { email } });
    } catch (err) {
      toast.error(err.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthCenteredLayout>
      <Title level={3}>Verify Your Identity</Title>
      <div
        style={{
          maxWidth: 300,
          margin: "0 auto",
          wordWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        <p>
          For your security, we've sent the code to your email{" "}
          <strong>{maskEmail(email)}</strong>.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onVerify}
        style={{ maxWidth: "300px", margin: "0 auto" }}
      >
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: "Enter the 6-digit code." },
            { pattern: /^\d{6}$/, message: "Invalid format." },
          ]}
        >
          <Input
            prefix={<NumberOutlined />}
            placeholder="Enter OTP"
            disabled={isLocked}
          />
        </Form.Item>

        <Form.Item>
          <Button
            onClick={sendOtp}
            disabled={cooldown > 0}
            loading={isResending}
            block
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isVerifying}
            disabled={isLocked}
            block
          >
            Submit Code
          </Button>
        </Form.Item>
      </Form>
    </AuthCenteredLayout>
  );
};

function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (user.length < 2) return email;
  return `${user[0]}${"*".repeat(user.length - 2)}${user.slice(-1)}@${domain}`;
}

export default VerifyResetOTP;
