import React from "react";
import {
  LockOutlined,
  MailOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Typography, Image } from "antd";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PartnerLogin = () => {
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    try {
      const response = await fetch("http://localhost:5000/partner/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const parseRes = await response.json();
      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        // TODO: to /partner/home
        navigate("/partner/home");
        toast.success("Login successfully");
      }
    } catch (err) {
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
          height: "100vh",
          margin: "auto",
        }}
      >
        <Toaster />
        <div
          style={{
            width: "300px",
          }}
        >
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
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ borderRadius: "0", width: "100%", margin: "12px 0" }}
              >
                Log in
              </Button>
              <a className="login-form-forgot" href="">
                Forgot password
              </a>
            </Form.Item>
          </Form>
        </div>
      </section>
    </>
  );
};

export default PartnerLogin;
