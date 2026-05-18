import React, { useContext, useEffect, useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import UserContext from "../UserContext";
import "./ClassEdit.css";

const { Title, Text, Paragraph } = Typography;

const Class = () => {
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
      const response = await fetchWithAuth(
        API_ENDPOINTS.GET_BOOKINGS_FOR_LISTING(listing_id),
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
        const response = await fetchWithAuth(
          API_ENDPOINTS.GET_LISTING(listing_id),
          {
            method: "GET",
          },
        );
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

  // Parse outlets and schedule groups
  const getOutletsInfo = () => {
    return listing?.outlets_info || [];
  };

  // Get total schedule count across all outlets
  const getTotalScheduleCount = () => {
    return getOutletsInfo().reduce((total, outlet) => {
      return total + (outlet.schedule_groups?.length || 0);
    }, 0);
  };

  // Format time for display
  const formatTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    return `${startTime} - ${endTime}`;
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
              value={getTotalScheduleCount()}
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
      <Card className="info-card" title="Class Information" bordered={false}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={3} style={{ marginBottom: 12 }}>
                  {listing?.listing_title}
                </Title>
                <Paragraph
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                  }}
                >
                  {listing?.description}
                </Paragraph>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Age Groups
                    </Text>
                    <Space wrap size={[8, 8]}>
                      {listing?.age_groups &&
                        (Array.isArray(listing.age_groups) ? (
                          listing.age_groups.map((age, i) => (
                            <Tag key={i} color="blue" style={{ margin: 0 }}>
                              {age}
                            </Tag>
                          ))
                        ) : (
                          <Tag color="blue">{listing.age_groups}</Tag>
                        ))}
                    </Space>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Created
                    </Text>
                    <Text strong>
                      {listing?.created_at
                        ? new Date(listing.created_at).toLocaleDateString(
                            "en-SG",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "N/A"}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
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

      {/* Schedules & Locations grouped by outlet */}
      <Card
        className="info-card mt-16"
        title={
          <Space>
            <EnvironmentOutlined />
            <span>Schedules & Locations</span>
          </Space>
        }
        bordered={false}
      >
        {getOutletsInfo().length > 0 ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {getOutletsInfo().map((outlet, outletIndex) => (
              <div key={outletIndex}>
                {/* Outlet Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    background: "var(--bg-lighter)",
                    borderRadius: "8px",
                    marginBottom: 16,
                  }}
                >
                  <Space>
                    <EnvironmentOutlined
                      style={{ fontSize: 18, color: "var(--primary-color)" }}
                    />
                    <Text strong style={{ fontSize: 16 }}>
                      {outlet.outlet_address || "Unknown Location"}
                    </Text>
                    {outlet.nearest_mrt && (
                      <Tag color="blue">{outlet.nearest_mrt} MRT</Tag>
                    )}
                  </Space>
                </div>

                {/* Schedule Groups for this outlet */}
                {outlet.schedule_groups && outlet.schedule_groups.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {outlet.schedule_groups.map((group, groupIndex) => (
                      <Col xs={24} lg={12} key={groupIndex}>
                        <Card
                          size="small"
                          style={{
                            borderRadius: 12,
                            border: "1px solid var(--border-light)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                          hoverable
                        >
                          <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                          >
                            {/* Package Types & Tags */}
                            <div>
                              <Space wrap size={[8, 8]}>
                                {group.package_types?.map((type, i) => (
                                  <Tag
                                    key={i}
                                    color={
                                      type === "full-term"
                                        ? "purple"
                                        : type === "short-term"
                                        ? "blue"
                                        : "green"
                                    }
                                    style={{ margin: 0, fontSize: 13 }}
                                  >
                                    {type.toUpperCase()}
                                  </Tag>
                                ))}
                                {group.is_progressive && (
                                  <Tag
                                    color="orange"
                                    style={{ margin: 0, fontSize: 13 }}
                                  >
                                    PROGRESSIVE
                                  </Tag>
                                )}
                                <Tag
                                  color="cyan"
                                  icon={<SyncOutlined />}
                                  style={{ margin: 0 }}
                                >
                                  {group.frequency || "Weekly"}
                                </Tag>
                                <Tag icon={<TeamOutlined />} style={{ margin: 0 }}>
                                  {group.slots || 10} slots
                                </Tag>
                              </Space>
                            </div>

                            {/* Time Slots */}
                            <div>
                              <Text
                                type="secondary"
                                strong
                                style={{ fontSize: 12, marginBottom: 8, display: "block" }}
                              >
                                TIME SLOTS
                              </Text>
                              <Space
                                direction="vertical"
                                size={4}
                                style={{ width: "100%" }}
                              >
                                {group.time_slots?.map((slot, slotIndex) => (
                                  <div
                                    key={slotIndex}
                                    style={{
                                      padding: "8px 12px",
                                      background: "var(--bg-lighter)",
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Space>
                                      <CalendarOutlined
                                        style={{
                                          color: "var(--primary-color)",
                                          fontSize: 14,
                                        }}
                                      />
                                      <Text strong style={{ minWidth: 80 }}>
                                        {slot.day}
                                      </Text>
                                      <ClockCircleOutlined
                                        style={{
                                          color: "var(--text-muted)",
                                          fontSize: 14,
                                        }}
                                      />
                                      <Text>
                                        {formatTime(slot.start_time, slot.end_time)}
                                      </Text>
                                    </Space>
                                  </div>
                                ))}
                              </Space>
                            </div>

                            {/* Pricing */}
                            {(group.price_payg ||
                              group.price_fullterm ||
                              group.price_shortterm) && (
                              <div>
                                <Text
                                  type="secondary"
                                  strong
                                  style={{
                                    fontSize: 12,
                                    marginBottom: 8,
                                    display: "block",
                                  }}
                                >
                                  PRICING
                                </Text>
                                <Row gutter={[12, 12]}>
                                  {group.price_payg && (
                                    <Col span={24}>
                                      <Space
                                        style={{
                                          padding: "8px 12px",
                                          background: "#f0fdf4",
                                          borderRadius: 6,
                                          width: "100%",
                                        }}
                                      >
                                        <DollarOutlined
                                          style={{ color: "#16a34a" }}
                                        />
                                        <Text type="secondary">Pay-as-you-go:</Text>
                                        <Text strong style={{ color: "#16a34a" }}>
                                          ${group.price_payg}
                                        </Text>
                                      </Space>
                                    </Col>
                                  )}
                                  {group.price_fullterm && (
                                    <Col span={24}>
                                      <Space
                                        style={{
                                          padding: "8px 12px",
                                          background: "#faf5ff",
                                          borderRadius: 6,
                                          width: "100%",
                                        }}
                                      >
                                        <DollarOutlined
                                          style={{ color: "#9333ea" }}
                                        />
                                        <Text type="secondary">Full-term:</Text>
                                        <Text strong style={{ color: "#9333ea" }}>
                                          ${group.price_fullterm}
                                        </Text>
                                        {group.full_term_class_count && (
                                          <Text type="secondary" style={{ fontSize: 12 }}>
                                            ({group.full_term_class_count} classes)
                                          </Text>
                                        )}
                                      </Space>
                                    </Col>
                                  )}
                                  {group.price_shortterm && (
                                    <Col span={24}>
                                      <Space
                                        style={{
                                          padding: "8px 12px",
                                          background: "#eff6ff",
                                          borderRadius: 6,
                                          width: "100%",
                                        }}
                                      >
                                        <DollarOutlined
                                          style={{ color: "#2563eb" }}
                                        />
                                        <Text type="secondary">Short-term:</Text>
                                        <Text strong style={{ color: "#2563eb" }}>
                                          ${group.price_shortterm}
                                        </Text>
                                        {group.short_term_class_count && (
                                          <Text type="secondary" style={{ fontSize: 12 }}>
                                            ({group.short_term_class_count} classes)
                                          </Text>
                                        )}
                                      </Space>
                                    </Col>
                                  )}
                                </Row>
                              </div>
                            )}

                            {/* Start Date */}
                            {group.full_term_start_date && (
                              <div
                                style={{
                                  padding: "8px 12px",
                                  background: "var(--bg-lighter)",
                                  borderRadius: 6,
                                  marginTop: 8,
                                }}
                              >
                                <Space>
                                  <PlayCircleOutlined
                                    style={{ color: "var(--primary-color)" }}
                                  />
                                  <Text type="secondary">Starts:</Text>
                                  <Text strong>
                                    {new Date(
                                      group.full_term_start_date,
                                    ).toLocaleDateString("en-SG", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </Text>
                                </Space>
                              </div>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="No schedules for this outlet" />
                )}

                {outletIndex < getOutletsInfo().length - 1 && (
                  <Divider style={{ margin: "32px 0" }} />
                )}
              </div>
            ))}
          </Space>
        ) : (
          <Empty
            description="No schedules configured"
            style={{ padding: "48px 0" }}
          />
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
