import React, { useContext, useEffect, useState, useCallback } from "react";
import { Card, Carousel, Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";
import toast from "react-hot-toast";

const { Meta } = Card;

const AllClasses = ({ setAuth }) => {
  const { user } = useContext(UserContext);
  const baseURL = getBaseURL();
  const [listing, setListing] = useState([]);
  const navigate = useNavigate();
  const token = user && user?.token;

  const getAllListings = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseURL}/listings/partner/${user.partner_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const parseRes = await response.json();
      if (response.status === 200) {
        setListing(parseRes);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [baseURL, token, setAuth]);

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
  const menu = (listing) => (
    <Menu>
      <Menu.Item key="archive" onClick={() => handleArchive(listing)}>
        {listing.active ? "Archive" : "Activate"}
      </Menu.Item>
    </Menu>
  );

  const handleClickClass = (list) => {
    navigate(`/class/${list?.listing_id}`, {});
  };

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token, getAllListings]);

  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {listing &&
        listing.map((list) => (
          <Card
            hoverable
            key={list.listing_id}
            style={{
              maxWidth: 300,
              margin: 24,
            }}
            actions={[
              <Dropdown
                overlay={menu(list)}
                trigger={["click"]}
                placement="top"
                key="setting"
              >
                <SettingOutlined
                  key="setting"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                  }}
                />
              </Dropdown>,
              <EditOutlined
                key="edit"
                onClick={() => {
                  handleClickClass(list);
                }}
              />,
            ]}
            cover={
              <Carousel autoplay>
                {list?.images.map((imgUrl, index) => (
                  <div key={index}>
                    <img
                      alt={`carousel-${index}`}
                      src={imgUrl}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            }
          >
            <Meta title={list.listing_title} />
          </Card>
        ))}
    </div>
  );
};

export default AllClasses;
