import { Modal, Form, DatePicker, TimePicker, Input, Button, message, Alert } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import dayjs from "dayjs";

const MakeupClassModal = ({ visible, occurrence, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.ADD_MAKEUP_CLASS(occurrence.occurrence_id),
        {
          method: "POST",
          body: JSON.stringify({
            makeup_date: values.makeup_date.format("YYYY-MM-DD"),
            makeup_start_time: values.makeup_start_time.format("HH:mm:ss"),
            makeup_end_time: values.makeup_end_time.format("HH:mm:ss"),
            notes: values.notes,
          }),
        }
      );

      if (response.ok) {
        message.success("Makeup class added successfully");
        form.resetFields();
        onSuccess();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to add makeup class");
      }
    } catch (error) {
      message.error("An error occurred while adding makeup class");
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
          <PlusOutlined style={{ marginRight: 8, color: "#52c41a" }} />
          Add Makeup Class
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
            message="Cancelled Class Details"
            description={
              <div>
                <p style={{ margin: 0 }}>
                  <strong>Original Date:</strong>{" "}
                  {dayjs(occurrence.scheduled_date).format("DD MMM YYYY")}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Time:</strong> {occurrence.start_time} -{" "}
                  {occurrence.end_time}
                </p>
                {occurrence.cancellation_reason && (
                  <p style={{ margin: 0 }}>
                    <strong>Reason:</strong> {occurrence.cancellation_reason}
                  </p>
                )}
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
              <strong>Original Occurrence:</strong>{" "}
              {occurrence.occurrence_number} / {occurrence.total_classes}
            </p>
          </div>

          <Alert
            message="What happens when you add a makeup class?"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>A new class occurrence will be created</li>
                <li>Total classes in the package will increase by 1</li>
                <li>Parents will be automatically notified</li>
                <li>This compensates for the cancelled class</li>
              </ul>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="makeup_date"
              label="Makeup Class Date"
              rules={[
                {
                  required: true,
                  message: "Please select a date for the makeup class",
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
                name="makeup_start_time"
                label="Start Time"
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
                name="makeup_end_time"
                label="End Time"
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

            <Form.Item name="notes" label="Notes (Optional)">
              <Input.TextArea
                rows={3}
                placeholder="Add any additional information about this makeup class..."
              />
            </Form.Item>

            <Alert
              message="Parents will be notified"
              description="An automatic notification will be sent to parents about this makeup class."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Add Makeup Class
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default MakeupClassModal;
