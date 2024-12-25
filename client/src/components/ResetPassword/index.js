import { MailOutlined } from "@ant-design/icons";
import { Button, Form, Image, Input, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

const ResetPassword = () => {
  // TODO: how to resend password - consult the rest

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div>
        <Image
          src={require("../../images/logopngResize.png")}
          preview={false}
          style={{
            margin: 8,
            textAlign: "center",
            width: "auto",
          }}
        />
        <Title level={3}>Reset your password</Title>
        <Form
          style={{
            maxWidth: "300px",
          }}
        >
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
              placeholder="email"
              type={"email"}
              size={"large"}
              required
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Submit
          </Button>
          <div
            style={{
              padding: "8px 0",
              textAlign: "center",
            }}
          >
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </div>
    </section>
  );
};

export default ResetPassword;
