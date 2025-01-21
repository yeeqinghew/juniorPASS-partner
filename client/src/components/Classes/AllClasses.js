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

  const handleArchive = async (listing) => {
    console.log(listing);
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
        }
      );

      if (response.ok) {
        toast.success(
          `Listing ${listing.listing_id} is now ${
            newStatus ? "active" : "inactive"
          }.`
        );
        // Optionally, update the UI state if needed
      } else {
        toast.error("Failed to update listing status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
    }
  };

  const menu = (listing) => (
    <Menu>
      <Menu.Item key="archive" onClick={() => handleArchive(listing)}>
        {listing.active ? "Inactive it" : "Activate it"}
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
                {list.images.map((imgUrl, index) => (
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
