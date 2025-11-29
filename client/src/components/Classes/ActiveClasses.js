import { Typography, Button } from "antd";
import { CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";

const { Text, Title } = Typography;

const ActiveClasses = ({ listing, setListing }) => {
  const navigate = useNavigate();
  const activeListings = listing?.filter((list) => list.active);

  if (!activeListings || activeListings.length === 0) {
    return (
      <div className="empty-classes">
        <CheckCircleOutlined className="empty-classes-icon" />
        <Title level={3} className="empty-classes-title">
          No active classes
        </Title>
        <Text className="empty-classes-text">
          Activate your classes to make them visible to students
        </Text>
      </div>
    );
  }

  return (
    <div className="classes-grid">
      {activeListings.map((list) => (
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
