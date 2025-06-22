// src/components/ClassCard.js
import { Card, Carousel, Dropdown, Menu } from "antd";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";
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
            ? "Listing activated. It will now appear on the homepage."
            : "Listing archived. It will be removed from the homepage."
        );
      } else {
        toast.error("Failed to update listing status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error(
        "An error occurred while updating the listing. Please try again later."
      );
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="archive" onClick={() => handleArchive(listing)}>
        {listing.active ? "Archive" : "Activate"}
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      hoverable
      key={listing.listing_id}
      style={{ maxWidth: 300, margin: 24 }}
      actions={[
        <Dropdown
          overlay={menu}
          trigger={["click"]}
          placement="top"
          key="setting"
        >
          <SettingOutlined
            key="setting"
            onClick={(e) => e.stopPropagation()} // Prevent card click
          />
        </Dropdown>,
        <EditOutlined key="edit" onClick={handleClickClass} />,
      ]}
      cover={
        <Carousel autoplay>
          {listing?.images.map((imgUrl, index) => (
            <div key={index}>
              <img
                alt={`carousel-${index}`}
                src={imgUrl}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            </div>
          ))}
        </Carousel>
      }
    >
      <Meta title={listing.listing_title} />
    </Card>
  );
};

export default ClassCard;
