import { Form, Select, Button, Row, Col } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";

const ScheduleItem = ({ field, remove, outletFields }) => (
  <Row gutter={[16, 16]} align="middle">
    <Col>
      <Form.Item
        name={[field.name, "day"]}
        rules={[{ required: true, message: "Please select a day" }]}
      >
        <Select placeholder="Select day" style={{ width: 150 }}>
          {day.map((d) => (
            <Select.Option key={d} value={d}>
              {d}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Col>

    <Col>
      <Form.Item
        name={[field.name, "timeslot"]}
        rules={[{ required: true, message: "Please select a timeslot" }]}
      >
        <TimeRangePicker style={{ width: 200 }} />
      </Form.Item>
    </Col>

    <Col>
      <Form.Item
        name={[field.name, "frequency"]}
        rules={[{ required: true, message: "Please select frequency" }]}
      >
        <Select
          placeholder="Select frequency"
          style={{ width: 150 }}
          options={frequency.map((freq) => ({ value: freq, label: freq }))}
        />
      </Form.Item>
    </Col>

    <Col>
      <MinusCircleOutlined
        onClick={() => remove(field.name)}
        style={{ color: "red" }}
      />
    </Col>
  </Row>
);

export default ScheduleItem;
