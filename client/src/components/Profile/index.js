import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Upload, message, Select, Avatar } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import Spinner from "../../utils/Spinner";
import UserContext from "../UserContext";

const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const { user } = useContext(UserContext);
  const baseURL = getBaseURL();
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [userProfile, setUserProfile] = useState({});
  const token = localStorage.getItem("token");
  const [profileForm] = Form.useForm();

  useEffect(() => {
    async function retrieveUser() {
      try {
        const response = await fetch(`${baseURL}/partners/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const parseRes = await response.json();
        setUserProfile(parseRes);
        profileForm.setFieldValue({});
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        message.error("Error fetching profile data");
        setLoading(false); // Hide loading state even on error
      }
    }

    retrieveUser();
  }, []);

  const handleFormSubmit = async (values) => {
    try {
      const response = await fetch(`${baseURL}/partners/${user.partner_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values), // Ensure JSON payload
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error in handleFormSubmit:", err);
      message.error("Error updating profile");
    }
  };

  const handleImageChange = (file) => {
    // Handle image upload logic here (e.g., send it to the server)
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserProfile((prev) => ({
        ...prev,
        displayPicture: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
    return false; // Prevent the default upload behavior
  };

  if (loading) {
    return <Spinner />; // Show loading state until data is fetched
  }

  return (
    <Form
      form={profileForm}
      name="edit-profile"
      initialValues={userProfile}
      onFinish={handleFormSubmit}
      layout="vertical"
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        label="Name"
        name="partner_name"
        rules={[{ required: true, message: "Please enter your name" }]}
      >
        <Input placeholder="Enter your name" />
      </Form.Item>

      {/* TODO: Load existing picture and allow user to change display picture */}
      <Form.Item label="Display Picture">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageChange}
        >
          <Button icon={<UploadOutlined />}>Upload New Picture</Button>
        </Upload>
        {userProfile.displayPicture?.preview || userProfile.picture ? (
          <Avatar
            size={64}
            src={userProfile.displayPicture?.preview || userProfile.picture}
            alt="Display Picture"
            style={{ marginTop: 8 }}
          />
        ) : (
          <Avatar
            size={64}
            icon={<UploadOutlined />}
            style={{ marginTop: 8 }}
          />
        )}
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter your name" }]}
      >
        <TextArea value={userProfile?.description} />
      </Form.Item>

      {/* TODO: to change to multiselect and existing value */}
      <Form.Item
        label="Category"
        name="categories"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          <Option value="Music">Music</Option>
          <Option value="Sports">Sports</Option>
          <Option value="Other">Other</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Website"
        name="website"
        rules={[{ required: true, message: "Please enter your website URL" }]}
      >
        <Input placeholder="Enter website URL" />
      </Form.Item>

      {/* TODO: Search by address */}
      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: "Please enter your address" }]}
      >
        <Input placeholder="Enter your address" />
      </Form.Item>

      <Form.Item
        label="Contact Number"
        name="phone_number"
        rules={[
          { required: true, message: "Please enter your contact number" },
        ]}
      >
        <Input placeholder="Enter contact number" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Profile;
