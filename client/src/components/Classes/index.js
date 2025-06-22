import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import ActiveClasses from "./ActiveClasses";
import InactiveClasses from "./InactiveClasses";
import AllClasses from "./AllClasses";
import UserContext from "../UserContext";
import getBaseURL from "../../utils/config";

const { Title } = Typography;

const PartnerClasses = ({ setAuth }) => {
  const { user } = useContext(UserContext);
  const baseURL = getBaseURL();
  const navigate = useNavigate();
  const [listing, setListing] = useState([]);

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

  useEffect(() => {
    if (!token) return;
    getAllListings();
  }, [token, getAllListings]);

  const handleCreateClass = () => {
    navigate("/create-class");
  };

  return (
    <>
      <Title level={3}>Classes</Title>
      <Button onClick={handleCreateClass}>Create a new class</Button>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size={"small"}
        items={[
          {
            label: "All",
            key: 1,
            children: <AllClasses listing={listing} setListing={setListing} />,
          },
          {
            label: "Active",
            key: 2,
            children: (
              <ActiveClasses listing={listing.filter((l) => l.active)} />
            ),
          },
          {
            label: "Inactive",
            key: 3,
            children: (
              <InactiveClasses
                listing={listing.filter((l) => !l.active)}
                setListing={setListing}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default PartnerClasses;
