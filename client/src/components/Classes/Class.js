import {
  InboxOutlined,
  LeftOutlined,
  DownloadOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Image,
  Row,
  Typography,
  Tabs,
  Table,
  Card,
  Tag,
  Space,
  Statistic,
  Empty,
  Badge,
  Divider,
  message,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import getBaseURL from "../../utils/config";
import UserContext from "../UserContext";
import "./ClassEdit.css";

const { Title, Text, Paragraph } = Typography;

const Class = () => {
  const baseURL = getBaseURL();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const { listing_id } = useParams();
  const [listing, setListing] = useState();
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch registered students for this class
  const fetchRegisteredStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(
        `${baseURL}/bookings/listing/${listing_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setRegisteredStudents(data || []);
      } else {
        setRegisteredStudents([]);
      }
    } catch (error) {
      console.error("Error fetching registered students:", error);
      setRegisteredStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    async function fetchClassDetails() {
      try {
        const response = await fetch(`${baseURL}/listings/${listing_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const parseRes = await response.json();
        setListing(parseRes);
      } catch (error) {
        console.error("Error fetching class details:", error);
      }
    }
    fetchClassDetails();
    fetchRegisteredStudents();
  }, [listing_id]);

  // Export students to CSV
  const exportToCSV = () => {
    if (registeredStudents.length === 0) {
      message.warning("No students to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Child Name",
      "Child Age",
      "Schedule",
      "Booking Date",
    ];
    const csvContent = [
      headers.join(","),
      ...registeredStudents.map((student) =>
        [
          student.parent_name || "N/A",
          student.email || "N/A",
          student.phone || "N/A",
          student.child_name || "N/A",
          student.child_age || "N/A",
          student.schedule_day || "N/A",
          student.booking_date
            ? new Date(student.booking_date).toLocaleDateString()
            : "N/A",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${listing?.listing_title || "class"}_students_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Student list exported successfully!");
  };

  // Navigate to edit page
  const handleEditClass = () => {
    navigate(`/class/${listing_id}/edit`);
  };

  // Parse images
  const getImages = () => {
    let images = listing?.images;
    if (typeof images === "string") {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = [];
    }
    return images;
  };

  // Parse schedule info
  const getScheduleInfo = () => {
    return listing?.schedule_info || [];
  };

  // Format timeslot for display
  const formatTimeslot = (timeslot) => {
    if (!timeslot) return "N/A";
    if (Array.isArray(timeslot)) {
      return timeslot
        .map((time) => {
          if (typeof time === "string") {
            return time.trim();
          }
          return time;
        })
        .join(" - ");
    }
    return String(timeslot);
  };

  // Overview Tab Content
  const OverviewTab = () => (
    <div className="overview-tab">
      {/* Stats Row */}
      <Row gutter={[16, 16]} className="mb-24">
        <Col xs={12} sm={6}>
          <Card className="stat-mini-card">
            <Statistic
              title="Total Bookings"
              value={registeredStudents.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-mini-card">
            <Statistic
              title="Schedules"
              value={getScheduleInfo().length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-mini-card">
            <Statistic
              title="Status"
              value={listing?.active ? "Active" : "Inactive"}
              valueStyle={{
                color: listing?.active
                  ? "var(--jp-success)"
                  : "var(--jp-text-muted)",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-mini-card">
            <Statistic
              title="Rating"
              value={listing?.rating || 0}
              suffix="/ 5"
            />
          </Card>
        </Col>
      </Row>

      {/* Class Info */}
      <Card className="info-card" title="Class Information">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={16}>
            <div className="info-section">
              <Title level={4}>{listing?.listing_title}</Title>
              <Paragraph>{listing?.description}</Paragraph>

              <Space wrap className="mt-16">
                {listing?.package_types &&
                  (Array.isArray(listing.package_types) ? (
                    listing.package_types.map((type, i) => (
                      <Tag key={i} color="blue">
                        {type}
                      </Tag>
                    ))
                  ) : (
                    <Tag color="blue">{listing.package_types}</Tag>
                  ))}
              </Space>

              <Divider />

              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Age Groups:</Text>
                  <div>
                    {listing?.age_groups &&
                      (Array.isArray(listing.age_groups) ? (
                        listing.age_groups.map((age, i) => (
                          <Tag key={i}>{age}</Tag>
                        ))
                      ) : (
                        <Tag>{listing.age_groups}</Tag>
                      ))}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Created:</Text>
                  <div>
                    {listing?.created_on
                      ? new Date(listing.created_on).toLocaleDateString()
                      : "N/A"}
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="images-preview">
              {getImages().length > 0 ? (
                <Image.PreviewGroup>
                  {getImages()
                    .slice(0, 4)
                    .map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        width={100}
                        height={100}
                        className="class-preview-image"
                      />
                    ))}
                </Image.PreviewGroup>
              ) : (
                <div className="no-images">
                  <InboxOutlined className="no-images-icon" />
                  <Text type="secondary">No images</Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Package Types & Start Dates */}
      <Card className="info-card mt-16" title="Package Information">
        <Row gutter={[16, 16]}>
          {listing?.package_types && (
            <>
              {(Array.isArray(listing.package_types)
                ? listing.package_types
                : listing.package_types.replace(/[{}]/g, "").split(",")
              ).map((type, i) => {
                const packageType = type.trim().toLowerCase();
                let startDate = null;
                let color = "default";

                if (
                  packageType.includes("long") ||
                  packageType.includes("term")
                ) {
                  if (packageType.includes("long")) {
                    startDate = listing.long_term_start_date;
                    color = "purple";
                  } else if (packageType.includes("short")) {
                    startDate = listing.short_term_start_date;
                    color = "blue";
                  }
                } else if (
                  packageType.includes("pay") ||
                  packageType.includes("go")
                ) {
                  color = "green";
                }

                return (
                  <Col xs={24} sm={8} key={i}>
                    <Card size="small" className="package-info-card">
                      <Space direction="vertical" className="w-full">
                        <Tag color={color} className="package-tag">
                          {type.trim()}
                        </Tag>
                        {startDate && (
                          <div className="mt-8">
                            <PlayCircleOutlined className="schedule-card-icon" />
                            <Text type="secondary">Starts: </Text>
                            <Text strong>
                              {new Date(startDate).toLocaleDateString("en-SG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </>
          )}
        </Row>
      </Card>

      {/* Schedules */}
      <Card className="info-card mt-16" title="Schedules & Locations">
        {getScheduleInfo().length > 0 ? (
          <Row gutter={[16, 16]}>
            {getScheduleInfo().map((schedule, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card size="small" className="schedule-card">
                  <Space direction="vertical" className="w-full">
                    {/* Frequency Tag */}
                    <div className="mb-8">
                      <Tag color="cyan" icon={<SyncOutlined />}>
                        {schedule.frequency || "Weekly"}
                      </Tag>
                    </div>
                    <div>
                      <CalendarOutlined className="schedule-card-icon" />
                      <Text strong>{schedule.day}</Text>
                    </div>
                    <div>
                      <ClockCircleOutlined className="schedule-card-icon" />
                      <Text>{formatTimeslot(schedule.timeslot)}</Text>
                    </div>
                    <div>
                      <EnvironmentOutlined className="schedule-card-icon" />
                      <Text type="secondary">{schedule.nearest_mrt} MRT</Text>
                    </div>
                    <Divider className="divider-compact" />
                    <Row gutter={16}>
                      <Col span={12}>
                        <div>
                          <TeamOutlined className="schedule-card-icon" />
                          <Text>Slots: </Text>
                          <Text strong>{schedule.slots || 10}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <DollarOutlined className="schedule-card-icon-secondary" />
                          <Text>Credits: </Text>
                          <Text strong>{schedule.credit || 1}</Text>
                        </div>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No schedules configured" />
        )}
      </Card>
    </div>
  );

  // Group students by class date
  const getStudentsGroupedByDate = () => {
    const grouped = {};
    registeredStudents.forEach((student) => {
      const dateKey = student.start_date
        ? new Date(student.start_date).toLocaleDateString("en-SG", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "No Date";

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: student.start_date,
          students: [],
        };
      }
      grouped[dateKey].students.push(student);
    });

    // Sort by date
    return Object.entries(grouped)
      .sort(([, a], [, b]) => new Date(a.date) - new Date(b.date))
      .map(([dateKey, data]) => ({
        dateKey,
        ...data,
      }));
  };

  // Simplified columns for grouped view (without Class Date column)
  const groupedStudentColumns = [
    {
      title: "Parent",
      dataIndex: "parent_name",
      key: "parent_name",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div className="text-medium">{text || "N/A"}</div>
            <Text type="secondary" className="text-small">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Child",
      dataIndex: "child_name",
      key: "child_name",
      render: (text, record) => (
        <div>
          <div>{text || "N/A"}</div>
          <Text type="secondary" className="text-small">
            Age: {record.child_age || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Schedule",
      dataIndex: "schedule_day",
      key: "schedule_day",
      render: (text, record) => {
        let timeDisplay = "";
        if (record.schedule_time) {
          if (Array.isArray(record.schedule_time)) {
            timeDisplay = record.schedule_time.join(" - ");
          } else if (typeof record.schedule_time === "string") {
            try {
              const parsed = JSON.parse(record.schedule_time);
              if (Array.isArray(parsed)) {
                timeDisplay = parsed.join(" - ");
              } else {
                timeDisplay = record.schedule_time;
              }
            } catch {
              timeDisplay = record.schedule_time;
            }
          } else {
            timeDisplay = String(record.schedule_time);
          }
        }
        return (
          <Tag color="blue">
            {text} {timeDisplay}
          </Tag>
        );
      },
    },
    {
      title: "Booked On",
      dataIndex: "booking_date",
      key: "booking_date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "orange"}>
          {status || "Active"}
        </Tag>
      ),
    },
  ];

  // Students Tab Content
  const StudentsTab = () => {
    const groupedStudents = getStudentsGroupedByDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="students-tab">
        <Card
          className="students-card"
          title={
            <Space>
              <TeamOutlined />
              <span>Registered Students ({registeredStudents.length})</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToCSV}
              disabled={registeredStudents.length === 0}
            >
              Export to CSV
            </Button>
          }
        >
          {registeredStudents.length > 0 ? (
            <div className="grouped-students">
              {groupedStudents.map((group, index) => {
                const classDate = new Date(group.date);
                classDate.setHours(0, 0, 0, 0);
                const isPast = classDate < today;
                const isToday = classDate.getTime() === today.getTime();

                const headerClass = isPast
                  ? "past"
                  : isToday
                    ? "today"
                    : "upcoming";

                return (
                  <div key={index} className="date-group mb-24">
                    {/* Date Header */}
                    <div className={`date-group-header ${headerClass}`}>
                      <CalendarOutlined
                        className={`date-group-icon ${headerClass}`}
                      />
                      <div className="flex-1">
                        <Text
                          strong
                          className={`date-group-title ${isPast ? "past" : ""}`}
                        >
                          {group.dateKey}
                        </Text>
                        {isToday && (
                          <Tag color="blue" className="ml-8">
                            Today
                          </Tag>
                        )}
                        {isPast && (
                          <Tag color="default" className="ml-8">
                            Past
                          </Tag>
                        )}
                      </div>
                      <Badge
                        count={group.students.length}
                        className={`date-group-badge ${headerClass}`}
                      />
                      <Text type="secondary" className="ml-8">
                        {group.students.length === 1 ? "student" : "students"}
                      </Text>
                    </div>

                    {/* Students Table for this date */}
                    <Table
                      columns={groupedStudentColumns}
                      dataSource={group.students}
                      loading={loadingStudents}
                      rowKey={(record) => record.booking_id || record.id}
                      pagination={false}
                      size="small"
                      className={isPast ? "opacity-70" : ""}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  No students registered yet.
                  <br />
                  <Text type="secondary">
                    Students will appear here once they book this class.
                  </Text>
                </span>
              }
            />
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="class-detail-container">
      {/* Header */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <Space align="center" className="mb-8">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/classes")}
              className="p-0"
            />
            <Badge status={listing?.active ? "success" : "default"} />
            <Tag color={listing?.active ? "green" : "default"}>
              {listing?.active ? "Active" : "Inactive"}
            </Tag>
          </Space>
          <Title level={2} className="welcome-title mb-0">
            {listing?.listing_title || "Class Details"}
          </Title>
          <Text className="welcome-text">
            Manage class information, view registered students, and track
            performance
          </Text>
        </div>
        <div className="welcome-actions">
          <Button
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
            disabled={registeredStudents.length === 0}
            className="welcome-btn-secondary"
          >
            Export Students
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditClass}
            className="welcome-btn-primary"
          >
            Edit Class
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="class-detail-tabs"
        items={[
          {
            key: "overview",
            label: (
              <span>
                <EyeOutlined />
                Overview
              </span>
            ),
            children: <OverviewTab />,
          },
          {
            key: "students",
            label: (
              <span>
                <TeamOutlined />
                Students ({registeredStudents.length})
              </span>
            ),
            children: <StudentsTab />,
          },
        ]}
      />
    </div>
  );
};

export default Class;
