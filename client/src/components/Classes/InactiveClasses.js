import { Typography, Button } from "antd";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ClassCard from "./ClassCard";

const { Text, Title } = Typography;

const InactiveClasses = ({ listing, setListing }) => {
  const navigate = useNavigate();
  const inactiveListings = listing?.filter((list) => !list.active);

  if (!inactiveListings || inactiveListings.length === 0) {
    return (
      <div className="empty-classes">
        <CloseCircleOutlined className="empty-classes-icon" />
        <Title level={3} className="empty-classes-title">
          No inactive classes
        </Title>
        <Text className="empty-classes-text">
          All your classes are currently active
        </Text>
      </div>
    );
  }

  return (
    <div className="classes-grid">
      {inactiveListings.map((list) => (
        <ClassCard
          key={list.listing_id}
          listing={list}
          setListing={setListing}
        />
      ))}
    </div>
  );
};

export default InactiveClasses;
