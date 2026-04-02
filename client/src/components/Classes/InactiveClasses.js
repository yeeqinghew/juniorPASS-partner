import { Typography } from "antd";
import ClassCard from "./ClassCard";
import LoadingContainer from "../../utils/LoadingContainer";

const { Text, Title } = Typography;

const InactiveClasses = ({ listing, setListing, loading }) => {
  if (loading) {
    return <LoadingContainer />;
  }

  if (!listing || listing.length === 0) {
    return (
      <div className="empty-classes">
        <div className="empty-classes-icon">📦</div>
        <Title level={3} className="empty-classes-title">
          No inactive classes
        </Title>
        <Text className="empty-classes-text">
          All your classes are currently active and visible to parents
        </Text>
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

export default InactiveClasses;