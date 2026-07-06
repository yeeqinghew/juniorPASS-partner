import { Modal, Form, Radio, Input, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import dayjs from "dayjs";

const AttendanceModal = ({ visible, occurrence, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.MARK_ATTENDANCE(occurrence.occurrence_id),
        {
          method: "PATCH",
          body: JSON.stringify({
            attended: values.attended,
            notes: values.notes,
          }),
        }
      );

      if (response.ok) {
        message.success(
          `Attendance marked: ${values.attended ? "Present" : "Absent"}`
        );
        form.resetFields();
        onSuccess();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to mark attendance");
      }
    } catch (error) {
      message.error("An error occurred while marking attendance");
      console.error(error);
    }
  };

  return (
    <Modal
      title={
        <div>
          <CheckCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
          Mark Attendance
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {occurrence && (
        <>
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
            <p>
              <strong>Occurrence:</strong> {occurrence.occurrence_number} /{" "}
              {occurrence.total_classes}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ attended: true }}
          >
            <Form.Item
              name="attended"
              label="Attendance Status"
              rules={[
                { required: true, message: "Please select attendance status" },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} /> Present
                </Radio>
                <Radio value={false}>
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} /> Absent
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="notes" label="Notes (Optional)">
              <Input.TextArea
                rows={3}
                placeholder="Add any notes about this class session..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Mark Attendance
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default AttendanceModal;
