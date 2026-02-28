import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";
import LoadingContainer from "../../utils/LoadingContainer";

const { Text, Title } = Typography;

const ActiveClasses = ({ listing, setListing, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingContainer />;
  }

  if (!listing || listing.length === 0) {
    return (
      <div className="empty-classes">
        <div className="empty-classes-icon">✅</div>
        <Title level={3} className="empty-classes-title">
          No active classes
        </Title>
        <Text className="empty-classes-text">
          Create a new class or activate an existing one to make it visible to
          parents
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-class")}
          className="empty-classes-button"
        >
          Create New Class
        </Button>
      </div>
    );
  }

  return (
    <div className="classes-grid">
      {listing.map((list) => (
        <ClassCard
          key={list.listing_id}
          listing={list}
          setListing={setListing}
        />
      ))}
    </div>
  );
};

export default ActiveClasses;