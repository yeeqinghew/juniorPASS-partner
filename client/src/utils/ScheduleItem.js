import { Form, Select } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import TimeRangePicker from "./TimeRangePicker";

const ScheduleItem = ({ field, remove }) => (
  <div style={{ display: "flex", marginBottom: 8 }}>
    <Form.Item
      name={[field.name, "day"]}
      rules={[{ required: true, message: "Missing day" }]}
    >
      <Select placeholder="Select day">
        {["Monday", "Tuesday", "Wednesday"].map((day) => (
          <Select.Option key={day} value={day}>
            {day}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name={[field.name, "timeslot"]}
      rules={[{ required: true, message: "Missing timeslot" }]}
    >
      <TimeRangePicker />
    </Form.Item>

    <Form.Item
      name={[field.name, "frequency"]}
      fieldId={[field.fieldId, "frequency"]}
      rules={[
        {
          required: true,
          message: "Missing frequency",
        },
      ]}
    >
      <Select
        placeholder="Select frequency"
        options={[
          {
            value: "Biweekly",
            label: "Biweekly",
          },
          {
            value: "Weekly",
            label: "Weekly",
          },
          {
            value: "Monthly",
            label: "Monthly",
          },
          {
            value: "Yearly",
            label: "Yearly",
          },
        ]}
      ></Select>
    </Form.Item>

    <Form.Item>
      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Form.Item>
  </div>
);

export default ScheduleItem;
