import { Modal, Form, Select, Input, Button, message, Alert } from "antd";
import { CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const CancelClassModal = ({ visible, occurrence, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.CANCEL_CLASS(occurrence.occurrence_id),
        {
          method: "PATCH",
          body: JSON.stringify({
            cancellation_reason: values.cancellation_reason,
            notes: values.notes,
          }),
        }
      );

      if (response.ok) {
        message.success("Class cancelled successfully");
        form.resetFields();
        onSuccess();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to cancel class");
      }
    } catch (error) {
      message.error("An error occurred while cancelling the class");
      console.error(error);
    }
  };

  return (
    <Modal
      title={
        <div>
          <CloseCircleOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
          Cancel Class
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {occurrence && (
        <>
          <Alert
            message="Important"
            description="Parents will be automatically notified about this cancellation. You can add a makeup class later to compensate."
            type="warning"
            icon={<ExclamationCircleOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div className="modal-info-section">
            <p>
              <strong>Class:</strong> {occurrence.listing_title}
            </p>
            <p>
              <strong>Child:</strong> {occurrence.child_name}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {dayjs(occurrence.scheduled_date).format("DD MMM YYYY")}
            </p>
            <p>
              <strong>Time:</strong> {occurrence.start_time} -{" "}
              {occurrence.end_time}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="cancellation_reason"
              label="Cancellation Reason"
              rules={[
                {
                  required: true,
                  message: "Please select a cancellation reason",
                },
              ]}
            >
              <Select placeholder="Select reason">
                <Option value="partner_unavailable">Partner Unavailable</Option>
                <Option value="partner_sick">Partner Sick</Option>
                <Option value="facility_issue">Facility Issue</Option>
                <Option value="weather">Weather Conditions</Option>
                <Option value="emergency">Emergency</Option>
                <Option value="low_enrollment">Low Enrollment</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes"
              rules={[
                {
                  required: true,
                  message: "Please provide details for cancellation",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Provide details about the cancellation. This will be shared with the parents."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" danger htmlType="submit">
                  Confirm Cancellation
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default CancelClassModal;
