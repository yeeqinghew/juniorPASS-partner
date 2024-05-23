import React, { useContext, useEffect, useState } from "react";
import { Card, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";

const { Meta } = Card;

const AllClasses = ({ setAuth }) => {
  const baseURL = getBaseURL();
  const [listing, setListing] = useState();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const token = user && user?.token;

  const getAllListings = async () => {
    try {
      const response = await fetch(`${baseURL}/listings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const parseRes = await response.json();
      if (response.status === 200) {
        setListing(parseRes);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClickClass = (list) => {
    navigate(`/partner/class/${list?.listing_id}`, {
      state: {
        list,
      },
    });
  };

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token]);

  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {listing &&
        listing.map((list) => {
          return (
            <Card
              hoverable
              onClick={() => {
                handleClickClass(list);
              }}
              key={list.listing_id}
              style={{
                maxwidth: 300,
                margin: 24,
              }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
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
          );
        })}
    </div>
  );
};

export default AllClasses;
