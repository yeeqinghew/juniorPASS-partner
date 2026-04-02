import { Badge, Button, Dropdown, Menu, Tag, Typography } from "antd";
import {
  EditOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import getBaseURL from "../../utils/config";

const { Text } = Typography;

const ClassCard = ({ listing, setListing, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const baseURL = getBaseURL();

  const handleClickClass = () => {
    navigate(`/class/${listing?.listing_id}`);
  };

  const handleArchive = async (listingToUpdate) => {
    try {
      const newStatus = !listingToUpdate?.active;

      const response = await fetch(
        `${baseURL}/listings/${listingToUpdate.listing_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: newStatus }),
        }
      );

      if (response.ok) {
        // Update listing state locally
        if (setListing) {
          setListing((prevListings) =>
            prevListings.map((item) =>
              item.listing_id === listingToUpdate.listing_id
                ? { ...item, active: newStatus }
                : item
            )
          );
        }

        toast.success(
          newStatus
            ? "Listing activated. It will now appear on the homepage."
            : "Listing archived. It will be removed from the homepage."
        );
      } else {
        toast.error("Failed to update listing status");
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("An error occurred while updating the listing.");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={handleClickClass}>
        Edit Details
      </Menu.Item>
      <Menu.Item
        key="archive"
        icon={<SettingOutlined />}
        onClick={() => handleArchive(listing)}
      >
        {listing.active ? "Deactivate" : "Activate"}
      </Menu.Item>
    </Menu>
  );

  const coverImage =
    listing?.images && listing.images.length > 0
      ? listing.images[0]
      : "https://via.placeholder.com/400x200?text=No+Image";

  if (viewMode === "list") {
    return (
      <div className="class-card-list" onClick={handleClickClass}>
        <img src={coverImage} alt={listing.title} className="class-card-image" />
        <div className="class-card-content">
          <div className="class-card-header">
            <h3 className="class-card-title">{listing.title}</h3>
            <Badge
              className={
                listing.active ? "status-badge-active" : "status-badge-inactive"
              }
              count={listing.active ? "Active" : "Inactive"}
            />
          </div>

          <div className="class-card-meta">
            <div className="class-meta-item">
              <EnvironmentOutlined />
              <Text>{listing.location || "Online"}</Text>
            </div>
            <div className="class-meta-item">
              <ClockCircleOutlined />
              <Text>{listing.duration || "60 min"}</Text>
            </div>
            <div className="class-meta-item">
              <UserOutlined />
              <Text>
                {listing.participants || 0} / {listing.max_participants || 20}
              </Text>
            </div>
            {listing.category && (
              <Tag color="blue">{listing.category}</Tag>
            )}
          </div>

          <div className="class-card-footer">
            <div className="class-card-price">
              ${listing.price || 0}
              <span className="class-card-price-label"> / session</span>
            </div>
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                Actions
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="class-card-grid" onClick={handleClickClass}>
      <img src={coverImage} alt={listing.title} className="class-card-image" />
      <div className="class-card-content">
        <div className="class-card-header">
          <h3 className="class-card-title">{listing.title}</h3>
          <Badge
            className={
              listing.active ? "status-badge-active" : "status-badge-inactive"
            }
            count={listing.active ? "Active" : "Inactive"}
          />
        </div>

        {listing.category && (
          <Tag color="blue" style={{ marginBottom: 12 }}>
            {listing.category}
          </Tag>
        )}

        <div className="class-card-meta">
          <div className="class-meta-item">
            <EnvironmentOutlined />
            <Text>{listing.location || "Online"}</Text>
          </div>
          <div className="class-meta-item">
            <ClockCircleOutlined />
            <Text>{listing.duration || "60 min"}</Text>
          </div>
          <div className="class-meta-item">
            <UserOutlined />
            <Text>
              {listing.participants || 0} / {listing.max_participants || 20}
            </Text>
          </div>
        </div>

        <div className="class-card-footer">
          <div className="class-card-price">
            ${listing.price || 0}
            <span className="class-card-price-label"> / session</span>
          </div>
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
