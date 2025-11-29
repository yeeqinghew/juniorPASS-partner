import { Empty, Typography, Button } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";

const { Text, Title } = Typography;

const AllClasses = ({ listing, setListing }) => {
  const navigate = useNavigate();

  if (!listing || listing.length === 0) {
    return (
      <div className="empty-classes">
        <BookOutlined className="empty-classes-icon" />
        <Title level={3} className="empty-classes-title">
          No classes yet
        </Title>
        <Text className="empty-classes-text">
          Start by creating your first class to attract students
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-class")}
          className="empty-classes-button"
        >
          Create Your First Class
        </Button>
      </div>
    );
  }

  return (
    <div className="classes-grid">
      {listing.map((list) => (
        <ClassCard key={list.listing_id} listing={list} setListing={setListing} />
      ))}
    </div>
  );
};

export default AllClasses;
