import { Modal, Form, DatePicker, TimePicker, Input, Button, message, Alert } from "antd";
import { CalendarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import dayjs from "dayjs";

const RescheduleModal = ({ visible, occurrence, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.RESCHEDULE_CLASS(occurrence.occurrence_id),
        {
          method: "PATCH",
          body: JSON.stringify({
            new_date: values.new_date.format("YYYY-MM-DD"),
            new_start_time: values.new_start_time.format("HH:mm:ss"),
            new_end_time: values.new_end_time.format("HH:mm:ss"),
            reason: values.reason,
          }),
        }
      );

      if (response.ok) {
        message.success("Class rescheduled successfully");
        form.resetFields();
        onSuccess();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to reschedule class");
      }
    } catch (error) {
      message.error("An error occurred while rescheduling the class");
      console.error(error);
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <Modal
      title={
        <div>
          <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Reschedule Class
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={550}
    >
      {occurrence && (
        <>
          <Alert
            message="Current Schedule"
            description={
              <div>
                <p style={{ margin: 0 }}>
                  <strong>Date:</strong>{" "}
                  {dayjs(occurrence.scheduled_date).format("DD MMM YYYY")}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Time:</strong> {occurrence.start_time} -{" "}
                  {occurrence.end_time}
                </p>
              </div>
            }
            type="info"
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
              <strong>Occurrence:</strong> {occurrence.occurrence_number} /{" "}
              {occurrence.total_classes}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="new_date"
              label="New Date"
              rules={[
                {
                  required: true,
                  message: "Please select a new date",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD MMM YYYY"
                disabledDate={disabledDate}
              />
            </Form.Item>

            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                name="new_start_time"
                label="New Start Time"
                style={{ flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: "Please select start time",
                  },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>

              <Form.Item
                name="new_end_time"
                label="New End Time"
                style={{ flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: "Please select end time",
                  },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="reason"
              label="Reason for Rescheduling"
              rules={[
                {
                  required: true,
                  message: "Please provide a reason",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Explain why this class needs to be rescheduled. Parents will be notified."
              />
            </Form.Item>

            <Alert
              message="Parents will be notified"
              description="An automatic notification will be sent to parents about this schedule change."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Confirm Reschedule
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default RescheduleModal;
