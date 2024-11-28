import { Form, Select } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";

const ScheduleItem = ({ field, remove }) => (
  <div style={{ display: "flex", marginBottom: 8 }}>
    <Form.Item
      name={[field.name, "day"]}
      rules={[{ required: true, message: "Missing day" }]}
    >
      <Select placeholder="Select day">
        {day.map((day) => (
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
        options={frequency.map((freq) => ({ value: freq, label: freq }))}
      ></Select>
    </Form.Item>

    <Form.Item>
      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Form.Item>
  </div>
);

export default ScheduleItem;
