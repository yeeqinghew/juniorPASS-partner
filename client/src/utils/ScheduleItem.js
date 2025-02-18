import { Form, Select, Button, Row, Col } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";

const ScheduleItem = ({ field, remove }) => (
  <div style={{ display: "flex", marginBottom: 8, alignItems: "center" }}>
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

    <Form.Item
      name={[field.name, "timeslot"]}
      rules={[{ required: true, message: "Please select a timeslot" }]}
    >
      <TimeRangePicker style={{ width: 200 }} />
    </Form.Item>

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

    <Form.Item>
      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Form.Item>
  </div>
);

const DynamicScheduleForm = () => (
  <Form onFinish={(values) => console.log(values)}>
    <Form.List
      name="schedules"
      rules={[
        {
          validator: async (_, schedules) => {
            if (!schedules || schedules.length < 1) {
              return Promise.reject(
                new Error("Please add at least one schedule")
              );
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <div>
          {fields.map(({ key, name, fieldKey, fieldId }) => (
            <Row key={key} gutter={[16, 16]}>
              <Col span={22}>
                <ScheduleItem
                  field={{ name, key, fieldKey, fieldId }}
                  remove={remove}
                />
              </Col>
            </Row>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusCircleOutlined />}
            >
              Add schedule
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </div>
      )}
    </Form.List>
  </Form>
);

export default DynamicScheduleForm;
