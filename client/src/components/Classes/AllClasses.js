import { Empty } from "antd";
import ClassCard from "./ClassCard";
import LoadingContainer from "../../utils/LoadingContainer";

const { Text, Title } = Typography;

const AllClasses = ({ listing, setListing, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingContainer />;
  }

  if (!listing || listing.length === 0) {
    return (
      <div className="empty-classes">
        <div className="empty-classes-icon">📚</div>
        <Title level={3} className="empty-classes-title">
          No classes yet
        </Title>
        <Text className="empty-classes-text">
          Start by creating your first class to attract students and grow your
          business
        </Text>
      </div>
    );
  }

  const AllClasses = ({ listing, setListing, viewMode = "grid" }) => {
    if (!listing || listing.length === 0) {
      return (
        <div className="classes-empty">
          <Empty
            description="No classes found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div className={viewMode === "grid" ? "classes-grid" : "classes-list"}>
        {listing.map((list) => (
          <ClassCard
            key={list.listing_id}
            listing={list}
            setListing={setListing}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  };
};

export default AllClasses;
