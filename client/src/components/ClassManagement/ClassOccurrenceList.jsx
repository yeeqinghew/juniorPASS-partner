import { Table, Button, Space, Tag, Tooltip, Empty } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const ClassOccurrenceList = ({
  occurrences,
  loading,
  onMarkAttendance,
  onCancelClass,
  onReschedule,
  onAddMakeup,
}) => {
  const getStatusTag = (status) => {
    const statusConfig = {
      scheduled: { color: "blue", icon: <ClockCircleOutlined /> },
      completed: { color: "green", icon: <CheckCircleOutlined /> },
      cancelled: { color: "red", icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <Tag icon={config.icon} color={config.color}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const getAttendanceTag = (attended) => {
    if (attended === null) return <Tag color="default">Pending</Tag>;
    return attended ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Present
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error">
        Absent
      </Tag>
    );
  };

  const canMarkAttendance = (record) => {
    return (
      record.status === "scheduled" &&
      dayjs(record.scheduled_date).isSameOrBefore(dayjs(), "day")
    );
  };

  const canCancelOrReschedule = (record) => {
    return (
      record.status === "scheduled" &&
      dayjs(record.scheduled_date).isAfter(dayjs(), "day")
    );
  };

  const canAddMakeup = (record) => {
    return record.status === "cancelled";
  };

  const columns = [
    {
      title: "Date & Time",
      key: "datetime",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(record.scheduled_date).format("DD MMM YYYY")}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.start_time} - {record.end_time}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        dayjs(a.scheduled_date).unix() - dayjs(b.scheduled_date).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Class",
      dataIndex: "listing_title",
      key: "listing_title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Child",
      key: "child",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.child_name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.parent_name}
          </div>
        </div>
      ),
    },
    {
      title: "Occurrence",
      dataIndex: "occurrence_number",
      key: "occurrence_number",
      width: 100,
      align: "center",
      render: (num, record) => (
        <span>
          {num} / {record.total_classes}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Scheduled", value: "scheduled" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Attendance",
      dataIndex: "attended",
      key: "attended",
      width: 120,
      render: (attended, record) =>
        record.status === "scheduled" ? (
          <Tag color="default">Not Marked</Tag>
        ) : (
          getAttendanceTag(attended)
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          {canMarkAttendance(record) && (
            <Tooltip title="Mark attendance for this class">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onMarkAttendance(record)}
              >
                Attendance
              </Button>
            </Tooltip>
          )}

          {canCancelOrReschedule(record) && (
            <>
              <Tooltip title="Reschedule this class">
                <Button
                  size="small"
                  icon={<CalendarOutlined />}
                  onClick={() => onReschedule(record)}
                >
                  Reschedule
                </Button>
              </Tooltip>

              <Tooltip title="Cancel this class">
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => onCancelClass(record)}
                >
                  Cancel
                </Button>
              </Tooltip>
            </>
          )}

          {canAddMakeup(record) && (
            <Tooltip title="Add makeup class for cancelled session">
              <Button
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => onAddMakeup(record)}
              >
                Makeup
              </Button>
            </Tooltip>
          )}

          {record.status === "completed" && (
            <Tag color="success">Completed</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={occurrences}
      rowKey="occurrence_id"
      loading={loading}
      pagination={{
        pageSize: 20,
        showTotal: (total) => `Total ${total} classes`,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      locale={{
        emptyText: (
          <Empty
            description="No class occurrences found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ),
      }}
      scroll={{ x: 1200 }}
    />
  );
};

export default ClassOccurrenceList;
