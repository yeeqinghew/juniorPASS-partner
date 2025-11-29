import { Card, Carousel, Dropdown, Menu, Tag } from "antd";
import { EditOutlined, SettingOutlined, EyeOutlined } from "@ant-design/icons";
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
        setListing((prevListings) =>
          prevListings.map((item) =>
            item.listing_id === listingToUpdate.listing_id
              ? { ...item, active: newStatus }
              : item
          )
        );

        toast.success(
          newStatus
            ? "Class activated successfully!"
            : "Class archived successfully!"
        );
      } else {
        toast.error("Failed to update class status");
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="view" onClick={handleClickClass}>
        <EyeOutlined /> View Details
      </Menu.Item>
      <Menu.Item key="archive" onClick={() => handleArchive(listing)}>
        <SettingOutlined /> {listing.active ? "Archive Class" : "Activate Class"}
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      hoverable
      className="class-card"
      actions={[
        <EditOutlined key="edit" onClick={handleClickClass} title="Edit Class" />,
        <Dropdown
          overlay={menu}
          trigger={["click"]}
          placement="bottomRight"
          key="setting"
        >
          <SettingOutlined
            onClick={(e) => e.stopPropagation()}
            title="More Options"
          />
        </Dropdown>,
      ]}
      cover={
        <div style={{ position: 'relative' }}>
          <div className={`class-status-badge ${listing.active ? 'class-status-active' : 'class-status-inactive'}`}>
            {listing.active ? '● Active' : '● Inactive'}
          </div>
          <Carousel autoplay autoplaySpeed={3000}>
            {listing?.images && listing.images.length > 0 ? (
              listing.images.map((imgUrl, index) => (
                <div key={index}>
                  <img
                    alt={`${listing.listing_title}-${index}`}
                    src={imgUrl}
                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                  />
                </div>
              ))
            ) : (
              <div style={{ 
                width: "100%", 
                height: "220px", 
                background: 'linear-gradient(135deg, #fef5f5 0%, #f0f8fb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#bfbfbf'
              }}>
                No Image Available
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
            ? listing.description.substring(0, 80) + (listing.description.length > 80 ? '...' : '')
            : 'No description available'
        }
      />
    </Card>
  );
};

export default ClassCard;
