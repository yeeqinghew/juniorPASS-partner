import { useState } from "react";
import { Form, Input, Select, Button, Space, Row, Col, Checkbox } from "antd";
import { fetchWithAuth } from "../../utils/api";
import useAddressSearch from "../../hooks/useAddressSearch";
import useMRTStations from "../../hooks/useMrtStations";

const { TextArea } = Input;

const OutletForm = ({ outlet, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { addressData, handleAddressSearch } = useAddressSearch();
  const { mrtStations, renderTags } = useMRTStations();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const url = outlet ? `/outlets/${outlet.outlet_id}` : "/outlets";

      const method = outlet ? "PATCH" : "POST";
      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        form.setFields([
          {
            name: "outlet_name",
            errors: [data.error],
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving outlet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={
        outlet
          ? {
              outlet_name: outlet.outlet_name,
              address: outlet.address,
              nearest_mrt: outlet.nearest_mrt,
              description: outlet.description,
              phone_number: outlet.phone_number,
            }
          : {}
      }
    >
      <Form.Item
        name="outlet_name"
        label="Outlet Name"
        rules={[
          { required: true, message: "Please enter outlet name" },
          { max: 255, message: "Name too long" },
        ]}
        extra="e.g., 'Main Branch - Bedok' or 'Downtown Studio'"
      >
        <Input placeholder="SG Basketball - Bedok Branch" size="large" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description (Optional)"
        extra="What makes this outlet special?"
      >
        <TextArea
          rows={3}
          placeholder="Our flagship outlet features 2 full-size courts with premium flooring..."
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please select address" }]}
          >
            <Select
              showSearch
              placeholder="Search for address"
              onSearch={handleAddressSearch}
              options={(addressData || []).map((d) => ({
                value: JSON.stringify(d),
                label: d.ADDRESS,
              }))}
              size="large"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="nearest_mrt"
            label="Nearest MRT"
            rules={[{ required: true, message: "Please select MRT" }]}
          >
            <Select showSearch placeholder="Select nearest MRT" size="large">
              {Object.keys(mrtStations).map((k) => (
                <Select.Option key={k} value={k}>
                  {renderTags(mrtStations[k])} {k}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="phone_number"
        label="Contact Number (Optional)"
        rules={[
          { pattern: /^[689]\d{7}$/, message: "Invalid Singapore number" },
        ]}
        extra="8-digit Singapore phone number for this outlet"
      >
        <Input placeholder="91234567" maxLength={8} size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
          >
            {outlet ? "Update Outlet" : "Create Outlet"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default OutletForm;
