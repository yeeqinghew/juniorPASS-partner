import React, { useState, useEffect, useRef } from "react";
import { Badge, Dropdown, List, Typography, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import getBaseURL from "../../utils/config";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import "./NotificationBell.css";

// Format user ID to show last 6 characters — used in dropdown preview for clarity
const formatUserId = (uuid) => (uuid ? `(...${uuid.slice(-6)})` : "");

const NotificationBell = () => {
  // Get base API URL and router navigation handler
  const baseURL = getBaseURL();
  const navigate = useNavigate();

  // Ref
  const previousTotalCountRef = useRef(0); // track previously known notification count for polling comparison

  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // whether more notifications exist beyond current page
  const [unreadCount, setUnreadCount] = useState(0); // bell icon badge counter

  // On mount: fetch initial notifications, then poll for new ones every 30s (compared by total count)
  useEffect(() => {
    let interval;

    const initialize = async () => {
      await fetchInitialNotifications();
      interval = setInterval(pollForNewNotifications, 30000);
    };

    initialize();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Load latest notifications (first 10), unread count, and total count
  const fetchInitialNotifications = async () => {
    try {
      const [notifRes, countRes, unreadRes] = await Promise.all([
        fetch(`${baseURL}/notifications/initial`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${baseURL}/notifications/count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${baseURL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!notifRes.ok || !countRes.ok || !unreadRes.ok)
        throw new Error("Failed to fetch notification data");

      const notifData = await notifRes.json();
      const { count } = await countRes.json();
      const { unreadCount } = await unreadRes.json();

      setNotifications(notifData.notifications);
      setHasMore(notifData.notifications.length === 10); // enable "Load More" if we got a full page (10 notifications)
      previousTotalCountRef.current = count;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error("Error fetching initial notifications:", err);
    }
  };

  // Re-fetch if total count increases, indicating new notifications
  const pollForNewNotifications = async () => {
    try {
      const res = await fetch(`${baseURL}/notifications/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Failed to fetch count");

      const { count } = await res.json();

      if (count > previousTotalCountRef.current) {
        toast.success("You have new notifications!");
        await fetchInitialNotifications();
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  // Fetch next page of notifications and append
  const fetchMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${baseURL}/notifications/more?offset=${notifications.length}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch more notifications");

      const data = await res.json();
      const newItems = data.notifications;

      if (newItems.length === 0) {
        setHasMore(false); // no more pages left
        return;
      }

      setNotifications((prev) => [...prev, ...data.notifications]);
    } catch (err) {
      console.error("Error loading more notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // When dropdown closes: mark visible unread notifications as read
  const handleDropdownVisibleChange = async (visible) => {
    if (!visible) {
      const unreadVisibleIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);

      if (unreadVisibleIds.length > 0) {
        await fetch(`${baseURL}/notifications/mark-read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ids: unreadVisibleIds }),
        });

        // Update local UI to reflect read state
        setNotifications((prev) =>
          prev.map((n) =>
            unreadVisibleIds.includes(n.id) ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - unreadVisibleIds.length, 0));
      }
    }
  };

  // Renders a single notification item or the "Load More" button
  const renderNotificationItem = (item) => {
    if (item.isLoadMoreButton) {
      return (
        <List.Item className="load-more-container">
          <Button
            disabled={loading}
            loading={loading}
            size="small"
            onClick={fetchMore}
          >
            Load More
          </Button>
        </List.Item>
      );
    }

    return (
      <List.Item
        className="notification-item"
        onClick={() => navigate(`/notifications/${item.id}`)}
      >
        <List.Item.Meta
          title={
            <div className="notification-title">
              <div style={{ fontWeight: item.read ? "normal" : "bold" }}>
                {item.parentName}{" "}
                <span style={{ color: "#999", fontWeight: "normal" }}>
                  {formatUserId(item.parentUserId)}
                </span>
              </div>
              {!item.read && <div className="unread-dot" />}
            </div>
          }
          description={
            <>
              <Typography.Text>{item.listingTitle}</Typography.Text>
              <br />
              <small>
                {dayjs(item.timestamp).format("MMM D, YYYY h:mm A")}
              </small>
            </>
          }
        />
      </List.Item>
    );
  };

  // Dropdown menu with notifications + optional Load More
  const dropdownContent = (
    <div className="dropdown-content">
      <div className="notification-list">
        <List
          itemLayout="horizontal"
          dataSource={
            hasMore
              ? [...notifications, { isLoadMoreButton: true }]
              : notifications
          }
          locale={{ emptyText: "No notifications yet." }}
          renderItem={renderNotificationItem}
        />
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      arrow
      onOpenChange={handleDropdownVisibleChange}
    >
      <Badge
        count={unreadCount}
        overflowCount={99}
        size="small"
        offset={[0, 3]}
        className="custom-badge"
      >
        <BellOutlined style={{ fontSize: "16px", cursor: "pointer" }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
