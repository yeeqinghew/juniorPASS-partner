import { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Tabs,
  Typography,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  Card,
} from "antd";
import {
  CalendarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserContext from "../UserContext";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import ClassOccurrenceList from "./ClassOccurrenceList";
import AttendanceModal from "./AttendanceModal";
import CancelClassModal from "./CancelClassModal";
import RescheduleModal from "./RescheduleModal";
import MakeupClassModal from "./MakeupClassModal";
import "./ClassManagement.css";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ClassManagement = () => {
  const { user } = useContext(UserContext);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // Modal states
  const [attendanceModal, setAttendanceModal] = useState({
    visible: false,
    occurrence: null,
  });
  const [cancelModal, setCancelModal] = useState({
    visible: false,
    occurrence: null,
  });
  const [rescheduleModal, setRescheduleModal] = useState({
    visible: false,
    occurrence: null,
  });
  const [makeupModal, setMakeupModal] = useState({
    visible: false,
    occurrence: null,
  });

  const fetchOccurrences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        API_ENDPOINTS.GET_CLASS_OCCURRENCES,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOccurrences(data);
      }
    } catch (error) {
      console.error("Error fetching class occurrences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.token) {
      fetchOccurrences();
    }
  }, [user?.token, fetchOccurrences]);

  // Filter occurrences
  const filteredOccurrences = occurrences.filter((occ) => {
    const matchesSearch =
      occ.listing_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.child_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || occ.status === statusFilter;

    const matchesDate =
      !dateRange ||
      (dayjs(occ.scheduled_date).isAfter(dateRange[0], "day") &&
        dayjs(occ.scheduled_date).isBefore(dateRange[1], "day")) ||
      dayjs(occ.scheduled_date).isSame(dateRange[0], "day") ||
      dayjs(occ.scheduled_date).isSame(dateRange[1], "day");

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Statistics
  const stats = {
    total: occurrences.length,
    scheduled: occurrences.filter((o) => o.status === "scheduled").length,
    completed: occurrences.filter((o) => o.status === "completed").length,
    cancelled: occurrences.filter((o) => o.status === "cancelled").length,
    today: occurrences.filter((o) =>
      dayjs(o.scheduled_date).isSame(dayjs(), "day")
    ).length,
  };

  const handleMarkAttendance = (occurrence) => {
    setAttendanceModal({ visible: true, occurrence });
  };

  const handleCancelClass = (occurrence) => {
    setCancelModal({ visible: true, occurrence });
  };

  const handleReschedule = (occurrence) => {
    setRescheduleModal({ visible: true, occurrence });
  };

  const handleAddMakeup = (occurrence) => {
    setMakeupModal({ visible: true, occurrence });
  };

  const closeAllModals = () => {
    setAttendanceModal({ visible: false, occurrence: null });
    setCancelModal({ visible: false, occurrence: null });
    setRescheduleModal({ visible: false, occurrence: null });
    setMakeupModal({ visible: false, occurrence: null });
  };

  const refreshData = () => {
    closeAllModals();
    fetchOccurrences();
  };

  return (
    <div className="class-management-container">
      {/* Header */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <Title level={2} className="welcome-title">
            Class Management
          </Title>
          <p className="welcome-text">
            Track attendance, manage schedules, and handle class occurrences
          </p>
        </div>
        <div className="welcome-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOccurrences}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <CalendarOutlined className="stat-icon total" />
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Classes</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <ClockCircleOutlined className="stat-icon scheduled" />
            <div>
              <div className="stat-value">{stats.scheduled}</div>
              <div className="stat-label">Scheduled</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <CheckCircleOutlined className="stat-icon completed" />
            <div>
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <CloseCircleOutlined className="stat-icon cancelled" />
            <div>
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card highlight">
          <div className="stat-content">
            <CalendarOutlined className="stat-icon today" />
            <div>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today's Classes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <Space wrap className="filters-container">
          <Input
            placeholder="Search by class, parent, or child name..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD MMM YYYY"
            placeholder={["Start Date", "End Date"]}
          />

          {(searchTerm || statusFilter !== "all" || dateRange) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateRange(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Space>

        <div className="filter-summary">
          Showing {filteredOccurrences.length} of {occurrences.length} classes
        </div>
      </Card>

      {/* Class List */}
      <ClassOccurrenceList
        occurrences={filteredOccurrences}
        loading={loading}
        onMarkAttendance={handleMarkAttendance}
        onCancelClass={handleCancelClass}
        onReschedule={handleReschedule}
        onAddMakeup={handleAddMakeup}
      />

      {/* Modals */}
      <AttendanceModal
        visible={attendanceModal.visible}
        occurrence={attendanceModal.occurrence}
        onClose={closeAllModals}
        onSuccess={refreshData}
      />

      <CancelClassModal
        visible={cancelModal.visible}
        occurrence={cancelModal.occurrence}
        onClose={closeAllModals}
        onSuccess={refreshData}
      />

      <RescheduleModal
        visible={rescheduleModal.visible}
        occurrence={rescheduleModal.occurrence}
        onClose={closeAllModals}
        onSuccess={refreshData}
      />

      <MakeupClassModal
        visible={makeupModal.visible}
        occurrence={makeupModal.occurrence}
        onClose={closeAllModals}
        onSuccess={refreshData}
      />
    </div>
  );
};

export default ClassManagement;
