import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getBaseURL from "../../utils/config";
import { Card, Typography, Spin } from "antd";
import dayjs from "dayjs";

const NotificationDetail = () => {
  // Get base API URL and route parameter
  const baseURL = getBaseURL();
  const { id } = useParams();

  // State
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: fetch notification detail by ID
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${baseURL}/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch notification");

        const data = await res.json();
        setNotification(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, baseURL]);

  // Loading state
  if (loading) return <Spin />;

  // If notification wasn't found (404 from API)
  if (!notification)
    return (
      <Typography.Text type="danger">Notification not found.</Typography.Text>
    );

  // Render notification info
  return (
    <Card
      title="Notification Details"
      style={{ maxWidth: 600, margin: "auto" }}
    >
      <p>
        <strong>Parent:</strong> {notification.parentName}
      </p>
      <p>
        <strong>Listing Title:</strong> {notification.listingTitle}
      </p>
      <p>
        <strong>Signed Up:</strong>{" "}
        {dayjs(notification.timestamp).format("MMM D, YYYY h:mm A")}
      </p>
      <hr />
      <p>
        <strong>Child Name:</strong> {notification.childName}
      </p>
      <p>
        <strong>Age:</strong> {notification.childAge}
      </p>
      <p>
        <strong>Gender:</strong> {notification.childGender}
      </p>
    </Card>
  );
};

export default NotificationDetail;
