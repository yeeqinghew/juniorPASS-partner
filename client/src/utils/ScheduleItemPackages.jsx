import {
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Switch,
  DatePicker,
  Alert,
  Tooltip,
  Card,
  Space,
  Typography
} from "antd";
import {
  MinusCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";
import "./ScheduleItemPackages.css";

const { Text } = Typography;

const ScheduleItemWithPackages = ({ field, remove, form }) => {
  const [showPackageConfig, setShowPackageConfig] = useState(false);
  const [packageTypes, setPackageTypes] = useState([]);
  const [longTermClassCount, setLongTermClassCount] = useState(null);
  const [shortTermClassCount, setShortTermClassCount] = useState(null);

  // Get field values
  const fieldValue = form.getFieldValue(['outlets', field.name]) || {};

  useEffect(() => {
    const types = fieldValue.schedules?.[0]?.package_types || [];
    setPackageTypes(types);
    setShowPackageConfig(types.length > 0 && types[0] !== 'pay-as-you-go');

    const longTerm = fieldValue.schedules?.[0]?.long_term_class_count;
    setLongTermClassCount(longTerm);

    // Auto-calculate short-term (25% rounded up)
    if (longTerm) {
      const shortTerm = Math.ceil(longTerm * 0.25);
      setShortTermClassCount(shortTerm);

      // Update form value
      const currentSchedules = form.getFieldValue(['outlets', field.name, 'schedules']) || [];
      if (currentSchedules[0]) {
        form.setFieldValue(
          ['outlets', field.name, 'schedules', 0, 'short_term_class_count'],
          shortTerm
        );
      }
    }
  }, [fieldValue, field.name, form]);

  const handlePackageTypeChange = (types) => {
    setPackageTypes(types);
    setShowPackageConfig(types.length > 0 && types[0] !== 'pay-as-you-go');
  };

  const handleLongTermClassCountChange = (value) => {
    setLongTermClassCount(value);
    if (value) {
      const shortTerm = Math.ceil(value * 0.25);
      setShortTermClassCount(shortTerm);

      // Update form
      form.setFieldValue(
        ['outlets', field.name, 'schedules', 0, 'short_term_class_count'],
        shortTerm
      );
    }
  };

  return (
    <Card className="schedule-item-card" size="small">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Basic Schedule Info */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={5}>
            <Form.Item
              name={[field.name, "schedules", 0, "day"]}
              rules={[{ required: true, message: "Select day" }]}
              style={{ marginBottom: 0 }}
            >
              <Select placeholder="Select day" size="large">
                {day.map((d) => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={6}>
            <Form.Item
              name={[field.name, "schedules", 0, "timeslot"]}
              rules={[{ required: true, message: "Select time" }]}
              style={{ marginBottom: 0 }}
            >
              <TimeRangePicker />
            </Form.Item>
          </Col>

          <Col xs={24} sm={4}>
            <Form.Item
              name={[field.name, "schedules", 0, "frequency"]}
              rules={[{ required: true, message: "Select frequency" }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder="Frequency"
                size="large"
                options={frequency.map((freq) => ({ value: freq, label: freq }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={3}>
            <Form.Item
              name={[field.name, "schedules", 0, "slots"]}
              rules={[
                { required: true, message: "Required" },
                { type: 'number', min: 1, max: 100, message: "1-100" }
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                placeholder="Slots"
                min={1}
                max={100}
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={3}>
            <Form.Item
              name={[field.name, "schedules", 0, "credit"]}
              rules={[
                { required: true, message: "Required" },
                { type: 'number', min: 1, max: 10, message: "1-10" }
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                placeholder="Credits"
                min={1}
                max={10}
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={3} style={{ textAlign: "center" }}>
            <MinusCircleOutlined
              onClick={() => remove(field.name)}
              className="remove-schedule-btn"
            />
          </Col>
        </Row>

        {/* Package Type Configuration */}
        <div className="package-config-section">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name={[field.name, "schedules", 0, "package_types"]}
                label={
                  <Space>
                    <Text strong>Package Types</Text>
                    <Tooltip title="Choose how users can book this schedule">
                      <InfoCircleOutlined style={{ color: 'var(--primary-color)' }} />
                    </Tooltip>
                  </Space>
                }
                rules={[{ required: true, message: "Select at least one package type" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select package types"
                  size="large"
                  onChange={handlePackageTypeChange}
                  maxTagCount={3}
                >
                  <Select.Option value="long-term">Long-term Package</Select.Option>
                  <Select.Option value="short-term">Short-term Trial (25%)</Select.Option>
                  <Select.Option value="pay-as-you-go">Pay-as-you-go</Select.Option>
                </Select>
              </Form.Item>

              {packageTypes.length > 0 && (
                <Alert
                  message="Valid combinations: Long-term only, Long-term + Short-term, or Pay-as-you-go only"
                  type="info"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
            </Col>
          </Row>

          {/* Long-term Configuration */}
          {showPackageConfig && packageTypes.includes('long-term') && (
            <div className="long-term-config">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={[field.name, "schedules", 0, "is_progressive"]}
                    label={
                      <Space>
                        <Text strong>Progressive Classes</Text>
                        <Tooltip title="When enabled: prevents mid-cycle joining and closes short-term after start date">
                          <InfoCircleOutlined style={{ color: 'var(--primary-color)' }} />
                        </Tooltip>
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Enable for classes that build on previous lessons
                  </Text>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={[field.name, "schedules", 0, "long_term_start_date"]}
                    label={
                      <Space>
                        <Text strong>Start Date</Text>
                        <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
                      </Space>
                    }
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      placeholder="Select start date"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    When users can start booking this package
                  </Text>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name={[field.name, "schedules", 0, "long_term_class_count"]}
                    label={
                      <Space>
                        <Text strong>Number of Classes</Text>
                        <ClockCircleOutlined style={{ color: 'var(--primary-color)' }} />
                      </Space>
                    }
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      placeholder="e.g., 12 classes"
                      size="large"
                      style={{ width: '100%' }}
                      onChange={handleLongTermClassCountChange}
                    />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Package expires when user completes all classes
                  </Text>
                </Col>


                {/* Short-term Preview */}
                {packageTypes.includes('short-term') && longTermClassCount && (
                  <Col span={24}>
                    <Alert
                      message={
                        <Space direction="vertical" size={4}>
                          <Text strong>Short-term Trial: {shortTermClassCount} classes</Text>
                          <Text type="secondary">
                            Automatically calculated as 25% of long-term ({longTermClassCount} classes)
                          </Text>
                        </Space>
                      }
                      type="success"
                      showIcon
                      icon={<InfoCircleOutlined />}
                    />
                    <Form.Item
                      name={[field.name, "schedules", 0, "short_term_class_count"]}
                      hidden
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default ScheduleItemWithPackages;
