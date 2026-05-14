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
  Typography,
  Divider
} from "antd";
import {
  MinusCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";
import "./ScheduleItemPackages.css";

const { Text } = Typography;

const ScheduleItemWithPackages = ({ field, remove, form, packageTypes: selectedPackages, isProgressive }) => {
  const [showPackageConfig, setShowPackageConfig] = useState(false);
  const [packageTypes, setPackageTypes] = useState([]);
  const [fullTermClassCount, setFullTermClassCount] = useState(null);
  const [shortTermClassCount, setShortTermClassCount] = useState(null);

  // Pricing state
  const [pricing, setPricing] = useState({
    payAsYouGo: null,
    shortTerm: null,
    fullTerm: null,
  });

  const [credits, setCredits] = useState({
    payAsYouGo: 0,
    shortTerm: 0,
    fullTerm: 0,
  });

  // Get field values
  const fieldValue = form.getFieldValue(['outlets', field.name]) || {};

  // Conversion: $1 = 1 credit (rounded up)
  const dollarsToCredits = (amount) => {
    if (!amount || amount <= 0) return 0;
    return Math.ceil(amount);
  };

  // Calculate suggested short-term price (15% markup, rounded up to cents)
  const calculateSuggestedShortTerm = (fullTermPrice) => {
    if (!fullTermPrice || fullTermPrice <= 0) return null;
    return Math.ceil(fullTermPrice * 1.15 * 100) / 100;
  };

  // Validate short-term pricing (must be 10-20% more than full-term)
  const validateShortTermPrice = (fullTermPrice, shortTermPrice) => {
    if (!fullTermPrice || !shortTermPrice) return { valid: true, message: "" };

    const minPrice = fullTermPrice * 1.10;
    const maxPrice = fullTermPrice * 1.20;

    if (shortTermPrice < minPrice) {
      return {
        valid: false,
        message: `Too low! Min: $${minPrice.toFixed(2)} (10% markup)`,
        type: "error"
      };
    }

    if (shortTermPrice > maxPrice) {
      return {
        valid: false,
        message: `Too high! Max: $${maxPrice.toFixed(2)} (20% markup)`,
        type: "error"
      };
    }

    return { valid: true, message: "✓ Valid pricing (10-20% markup)", type: "success" };
  };

  // Handle price changes
  const handlePriceChange = (packageType, value) => {
    const newPricing = { ...pricing, [packageType]: value };
    setPricing(newPricing);

    // Auto-calculate credits
    const newCredits = {
      payAsYouGo: dollarsToCredits(newPricing.payAsYouGo),
      shortTerm: dollarsToCredits(newPricing.shortTerm),
      fullTerm: dollarsToCredits(newPricing.fullTerm),
    };
    setCredits(newCredits);

    // Auto-suggest short-term price if full-term is set
    if (packageType === "fullTerm" && value && !newPricing.shortTerm) {
      const suggested = calculateSuggestedShortTerm(value);
      if (suggested) {
        setPricing(prev => ({ ...prev, shortTerm: suggested }));
        setCredits(prev => ({ ...prev, shortTerm: dollarsToCredits(suggested) }));
        // Update form field
        form.setFieldValue(
          ['outlets', field.name, 'schedules', 0, 'price_shortterm'],
          suggested
        );
      }
    }
  };

  useEffect(() => {
    // Auto-calculate short-term class count (25% of full-term, rounded up)
    const fullTerm = fieldValue.schedules?.[0]?.full_term_class_count;
    setFullTermClassCount(fullTerm);

    if (fullTerm) {
      const shortTerm = Math.ceil(fullTerm * 0.25);
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

  const handleFullTermClassCountChange = (value) => {
    setFullTermClassCount(value);
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

          <Col xs={24} sm={3} style={{ textAlign: "center" }}>
            <MinusCircleOutlined
              onClick={() => remove(field.name)}
              className="remove-schedule-btn"
            />
          </Col>
        </Row>

        {/* Pricing Section */}
        <Divider style={{ margin: "12px 0" }} />
        <div style={{ padding: "12px", backgroundColor: "#f5f5f5", borderRadius: 6 }}>
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
            <DollarOutlined style={{ color: "#52c41a" }} /> Pricing per Session
            <Tooltip title="Enter prices in dollars. Credits are automatically calculated and rounded up.">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#1890ff", fontSize: 12 }} />
            </Tooltip>
          </div>

          <Row gutter={[12, 12]}>
            {/* Pay-As-You-Go */}
            {selectedPackages?.includes("pay-as-you-go") && !isProgressive && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>Pay-As-You-Go</Text>
                </div>
                <Form.Item
                  name={[field.name, "schedules", 0, "price_payg"]}
                  rules={[
                    { required: true, message: "Required" },
                    { type: "number", min: 0.01, message: "Must be > $0" }
                  ]}
                  style={{ marginBottom: 4 }}
                >
                  <InputNumber
                    prefix="$"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                    size="large"
                    style={{ width: "100%" }}
                    onChange={(value) => handlePriceChange("payAsYouGo", value)}
                  />
                </Form.Item>
                {credits.payAsYouGo > 0 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    = {credits.payAsYouGo} {credits.payAsYouGo === 1 ? "credit" : "credits"}
                  </Text>
                )}
              </Col>
            )}

            {/* Full-Term */}
            {selectedPackages?.includes("full-term") && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>Full-Term</Text>
                </div>
                <Form.Item
                  name={[field.name, "schedules", 0, "price_fullterm"]}
                  rules={[
                    { required: true, message: "Required" },
                    { type: "number", min: 0.01, message: "Must be > $0" }
                  ]}
                  style={{ marginBottom: 4 }}
                >
                  <InputNumber
                    prefix="$"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                    size="large"
                    style={{ width: "100%" }}
                    onChange={(value) => handlePriceChange("fullTerm", value)}
                  />
                </Form.Item>
                {credits.fullTerm > 0 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    = {credits.fullTerm} {credits.fullTerm === 1 ? "credit" : "credits"}
                  </Text>
                )}
              </Col>
            )}

            {/* Short-Term */}
            {selectedPackages?.includes("short-term") && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Short-Term
                    {pricing.fullTerm && (
                      <Tooltip title={`Suggested: $${calculateSuggestedShortTerm(pricing.fullTerm)?.toFixed(2)} (15% markup)`}>
                        <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, color: "#1890ff" }} />
                      </Tooltip>
                    )}
                  </Text>
                </div>
                <Form.Item
                  name={[field.name, "schedules", 0, "price_shortterm"]}
                  rules={[
                    { required: true, message: "Required" },
                    { type: "number", min: 0.01, message: "Must be > $0" },
                    {
                      validator: (_, value) => {
                        if (!pricing.fullTerm || !value) return Promise.resolve();
                        const validation = validateShortTermPrice(pricing.fullTerm, value);
                        return validation.valid
                          ? Promise.resolve()
                          : Promise.reject(new Error(validation.message));
                      },
                    },
                  ]}
                  style={{ marginBottom: 4 }}
                >
                  <InputNumber
                    prefix="$"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                    size="large"
                    style={{ width: "100%" }}
                    onChange={(value) => handlePriceChange("shortTerm", value)}
                  />
                </Form.Item>
                {pricing.fullTerm && pricing.shortTerm && (
                  <Text
                    type={validateShortTermPrice(pricing.fullTerm, pricing.shortTerm).type === "success" ? "success" : "danger"}
                    style={{ fontSize: 11 }}
                  >
                    {validateShortTermPrice(pricing.fullTerm, pricing.shortTerm).message}
                  </Text>
                )}
                {credits.shortTerm > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      = {credits.shortTerm} {credits.shortTerm === 1 ? "credit" : "credits"}
                    </Text>
                  </div>
                )}
              </Col>
            )}

            {/* Trial */}
            {selectedPackages?.includes("trial") && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>Trial</Text>
                </div>
                <Form.Item
                  name={[field.name, "schedules", 0, "price_trial"]}
                  rules={[
                    { required: true, message: "Required" },
                    { type: "number", min: 0, message: "Must be >= $0" }
                  ]}
                  style={{ marginBottom: 4 }}
                >
                  <InputNumber
                    prefix="$"
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </div>

        {/* Package Configuration (for full-term/short-term) */}
        {(selectedPackages?.includes('full-term') || selectedPackages?.includes('short-term')) && (
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
                    name={[field.name, "schedules", 0, "full_term_start_date"]}
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
                    name={[field.name, "schedules", 0, "full_term_class_count"]}
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
                      onChange={handleFullTermClassCountChange}
                    />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Package expires when user completes all classes
                  </Text>
                </Col>


                {/* Short-term Preview */}
                {packageTypes.includes('short-term') && fullTermClassCount && (
                  <Col span={24}>
                    <Alert
                      message={
                        <Space direction="vertical" size={4}>
                          <Text strong>Short-term Trial: {shortTermClassCount} classes</Text>
                          <Text type="secondary">
                            Automatically calculated as 25% of full-term ({fullTermClassCount} classes)
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

export default ScheduleItemWithPackages;
