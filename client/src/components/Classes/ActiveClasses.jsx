import { Empty } from "antd";
import ClassCard from "./ClassCard";

const ActiveClasses = ({ listing, setListing, viewMode = "grid" }) => {
  if (!listing || listing.length === 0) {
    return (
      <div className="classes-empty">
        <Empty
          description="No active classes found"
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

export default ActiveClasses;