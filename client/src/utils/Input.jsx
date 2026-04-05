import { Form, Input } from "antd";

const CustomInput = ({ name, required, placeholder, prefixIcon }) => {
  return (
    <Form.Item
      name={name}
      rules={[
        {
          required: required,
          message: `Please input your ${name}`,
        },
      ]}
    >
      <Input
        prefix={prefixIcon}
        placeholder={placeholder}
        size={"large"}
        required
      />
    </Form.Item>
  );
};

export default CustomInput;
