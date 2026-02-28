import { Card, Carousel, Dropdown, Tag } from "antd";
import { InboxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";

const { Meta } = Card;

const ClassCard = ({ listing, setListing }) => {
  const navigate = useNavigate();
  const baseURL = getBaseURL();

  const handleClickClass = () => {
    navigate(`/class/${listing?.listing_id}`);
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const newStatus = !listing?.active;

      const response = await fetch(
        `${baseURL}/listings/${listing.listing_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: newStatus }),
        },
      );

      if (response.ok) {
        // Update listing state locally
        setListing((prevListings) =>
          prevListings.map((item) =>
            item.listing_id === listing.listing_id
              ? { ...item, active: newStatus }
              : item,
          ),
        );

        toast.success(
          newStatus
            ? "Class activated successfully!"
            : "Class archived successfully!",
        );
      } else {
        toast.error("Failed to update class status");
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  // Right-click context menu items
  const contextMenuItems = [
    {
      key: "view",
      label: "View Details",
      onClick: handleClickClass,
    },
    {
      type: "divider",
    },
    {
      key: "archive",
      label: listing.active ? "Archive Class" : "Activate Class",
      icon: listing.active ? <InboxOutlined /> : <CheckCircleOutlined />,
      onClick: handleArchive,
      danger: listing.active,
    },
  ];

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

  const images = getImages();

  return (
    <Dropdown menu={{ items: contextMenuItems }} trigger={["contextMenu"]}>
      <Card
        hoverable
        className="class-card"
        onClick={handleClickClass}
        cover={
          <div style={{ position: "relative" }}>
            <div
              className={`class-status-badge ${
                listing.active ? "class-status-active" : "class-status-inactive"
              }`}
            >
              {listing.active ? "● Active" : "● Inactive"}
            </div>
            <Carousel autoplay autoplaySpeed={3000}>
              {images.length > 0 ? (
                images.map((imgUrl, index) => (
                  <div key={index}>
                    <img
                      alt={`${listing.listing_title}-${index}`}
                      src={imgUrl}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background:
                      "linear-gradient(135deg, #f8fcff 0%, #FCFBF8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#bfbfbf",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <InboxOutlined style={{ fontSize: 32 }} />
                  <span>No Image</span>
                </div>
              )}
            </Carousel>
          </div>
        }
      >
        <Meta
          title={listing.listing_title}
          description={
            listing.description
              ? listing.description.substring(0, 80) +
                (listing.description.length > 80 ? "..." : "")
              : "No description available"
          }
        />
        <div className="class-info-tags">
          {listing.schedule_info?.length > 0 && (
            <Tag color="blue">{listing.schedule_info.length} Schedule(s)</Tag>
          )}
        </div>
      </Card>
    </Dropdown>
  );
};

export default ClassCard;
