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
import toast from "react-hot-toast";
import TimeRangePicker from "./TimeRangePicker";
import day from "../data/day.json";
import frequency from "../data/frequency.json";
import "./ScheduleItemPackages.css";

const { Text } = Typography;

const ScheduleItemWithPackages = ({ field, remove, form }) => {
  const [showPackageConfig, setShowPackageConfig] = useState(false);
  const [packageTypes, setPackageTypes] = useState([]);
  const [isProgressive, setIsProgressive] = useState(false);
  const [fullTermClassCount, setFullTermClassCount] = useState(null);
  const [shortTermClassCount, setShortTermClassCount] = useState(null);

  // Pricing state
  const [pricing, setPricing] = useState({
    payAsYouGo: null,
    fullTerm: null,
  });

  const [credits, setCredits] = useState({
    payAsYouGo: 0,
    fullTerm: 0,
    shortTerm: 0, // Auto-calculated
  });

  // Get field values
  const fieldValue = form.getFieldValue(['outlets', field.name]) || {};

  // Conversion: $1 = 1 credit (rounded up)
  const dollarsToCredits = (amount) => {
    if (!amount || amount <= 0) return 0;
    return Math.ceil(amount);
  };

  // Calculate short-term price automatically
  // Short-term = (Full-term ÷ Full-term classes) × 1.15 × Short-term classes
  const calculateShortTermPrice = (fullTermPrice, fullTermClasses, shortTermClasses) => {
    if (!fullTermPrice || !fullTermClasses || !shortTermClasses) return null;
    const perClassRate = fullTermPrice / fullTermClasses;
    const shortTermPerClass = perClassRate * 1.15;
    const shortTermTotal = shortTermPerClass * shortTermClasses;
    return Math.ceil(shortTermTotal * 100) / 100; // Round to cents
  };

  // Handle price changes
  const handlePriceChange = (packageType, value) => {
    const newPricing = { ...pricing, [packageType]: value };
    setPricing(newPricing);

    // Calculate credits for pay-as-you-go and full-term
    const newCredits = {
      payAsYouGo: dollarsToCredits(newPricing.payAsYouGo),
      fullTerm: dollarsToCredits(newPricing.fullTerm),
      shortTerm: 0,
    };

    // Auto-calculate short-term price and credits
    if (packageType === "fullTerm" && value && fullTermClassCount && shortTermClassCount) {
      const shortTermPrice = calculateShortTermPrice(value, fullTermClassCount, shortTermClassCount);
      if (shortTermPrice) {
        newCredits.shortTerm = dollarsToCredits(shortTermPrice);
        // Update form field with calculated short-term price
        form.setFieldValue(
          ['outlets', field.name, 'schedules', 0, 'price_shortterm'],
          shortTermPrice
        );
      }
    }

    setCredits(newCredits);
  };

  useEffect(() => {
    const types = fieldValue.schedules?.[0]?.package_types || [];
    const progressive = fieldValue.schedules?.[0]?.is_progressive || false;

    setPackageTypes(types);
    setIsProgressive(progressive);

    setShowPackageConfig(types.length > 0 && !types.includes('pay-as-you-go'));

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

        // Recalculate short-term price if full-term price exists
        const fullTermPrice = pricing.fullTerm;
        if (fullTermPrice && types.includes('short-term')) {
          const shortTermPrice = calculateShortTermPrice(fullTermPrice, fullTerm, shortTerm);
          if (shortTermPrice) {
            setCredits(prev => ({ ...prev, shortTerm: dollarsToCredits(shortTermPrice) }));
            form.setFieldValue(
              ['outlets', field.name, 'schedules', 0, 'price_shortterm'],
              shortTermPrice
            );
          }
        }
      }
    }
  }, [fieldValue, field.name, form]);

  const handlePackageTypeChange = (types) => {
    setPackageTypes(types);
    setShowPackageConfig(types.length > 0 && !types.includes('pay-as-you-go'));
  };

  const handleProgressiveChange = (checked) => {
    setIsProgressive(checked);

    // If progressive is enabled, remove pay-as-you-go and short-term from selection
    if (checked) {
      const filtered = packageTypes.filter(
        (type) => type !== 'pay-as-you-go' && type !== 'short-term'
      );
      setPackageTypes(filtered);
      form.setFieldValue(
        ['outlets', field.name, 'schedules', 0, 'package_types'],
        filtered
      );

      if (packageTypes.includes('pay-as-you-go') || packageTypes.includes('short-term')) {
        toast.info("Pay-as-you-go and Short-term removed: not available for progressive classes");
      }
    }
  };

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

        {/* Package Type Configuration */}
        <Divider style={{ margin: "12px 0" }} />
        <div className="package-config-section">
          <Row gutter={[16, 16]}>
            {/* Progressive Classes Toggle - FIRST */}
            <Col span={24}>
              <Form.Item
                name={[field.name, "schedules", 0, "is_progressive"]}
                label=""
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Space>
                  <Switch onChange={handleProgressiveChange} />
                  <Text strong>Progressive Classes</Text>
                  <Tooltip title="When enabled: prevents mid-cycle joining and disables pay-as-you-go and short-term trial">
                    <InfoCircleOutlined style={{ color: 'var(--primary-color)' }} />
                  </Tooltip>
                </Space>
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -8 }}>
                Enable for classes that build on previous lessons (disables pay-as-you-go and trial)
              </Text>
            </Col>

            {/* Package Types - SECOND */}
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
                  <Select.Option value="full-term">Full-term Package</Select.Option>
                  <Select.Option
                    value="short-term"
                    disabled={isProgressive}
                  >
                    Short-term {isProgressive && "(Not available for progressive)"}
                  </Select.Option>
                  <Select.Option
                    value="pay-as-you-go"
                    disabled={isProgressive}
                  >
                    Pay-as-you-go {isProgressive && "(Not available for progressive)"}
                  </Select.Option>
                </Select>
              </Form.Item>

              {packageTypes.length > 0 && !isProgressive && (
                <Alert
                  message="Valid combinations: Full-term only, Full-term + Short-term, or Pay-as-you-go only"
                  type="info"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
              {isProgressive && (
                <Alert
                  message="Progressive mode: Only Full-term package available"
                  type="warning"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
            </Col>

            {/* Full Term Start Date - ONLY if full-term is selected */}
            {packageTypes.includes('full-term') && (
              <Col xs={24} md={8}>
                <Form.Item
                  name={[field.name, "schedules", 0, "full_term_start_date"]}
                  label={
                    <Space>
                      <Text strong>Full-term Start Date</Text>
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
                  When users can start booking
                </Text>
              </Col>
            )}

            {/* Full Term Class Count - ONLY if full-term is selected */}
            {packageTypes.includes('full-term') && (
              <Col xs={24} md={8}>
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
                  Package expires when complete
                </Text>
              </Col>
            )}

            {/* Short-term Preview - Auto-calculated */}
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
            {packageTypes.includes("pay-as-you-go") && (
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
            {packageTypes.includes("full-term") && (
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

            {/* Short-Term Price - AUTO-CALCULATED (Display Only) */}
            {packageTypes.includes("short-term") && pricing.fullTerm && fullTermClassCount && shortTermClassCount && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Short-Term (Auto-calculated)
                    <Tooltip title="Calculated as: (Full-term price ÷ Full-term classes) × 1.15 × Short-term classes">
                      <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, color: "#1890ff" }} />
                    </Tooltip>
                  </Text>
                </div>
                <div style={{
                  padding: "8px 12px",
                  background: "#f0f0f0",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1890ff"
                }}>
                  ${calculateShortTermPrice(pricing.fullTerm, fullTermClassCount, shortTermClassCount)?.toFixed(2)}
                </div>
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
                  = {credits.shortTerm} {credits.shortTerm === 1 ? "credit" : "credits"} (15% markup)
                </Text>
                {/* Hidden field to store the calculated price */}
                <Form.Item
                  name={[field.name, "schedules", 0, "price_shortterm"]}
                  hidden
                >
                  <InputNumber />
                </Form.Item>
              </Col>
            )}

          </Row>
        </div>
      </Space>
    </Card>
  );
};

export default ScheduleItemWithPackages;
