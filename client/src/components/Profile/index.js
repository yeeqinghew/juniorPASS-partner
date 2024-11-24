import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Upload, message, Select, Avatar } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import Spinner from "../../utils/Spinner";
import { DataContext } from "../../hooks/DataContext";

const { Option } = Select;

const Profile = () => {
  const baseURL = getBaseURL();
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [userProfile, setUserProfile] = useState({});
  const token = localStorage.getItem("token");
  const { categories, packageTypes, ageGroups } = useContext(DataContext);
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

  const handleFormSubmit = (values) => {
    // Send form data to the backend API for updating the profile
    message.success("Profile updated successfully!");
    console.log("Updated Profile:", values);
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
      <Form.Item label="Display Picture" name="displayPicture">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageChange}
        >
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
        {userProfile.displayPicture && (
          <Avatar size={64} src={userProfile.displayPicture} />
        )}
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
        label="Phone Number"
        name="phone_number"
        rules={[{ required: true, message: "Please enter your phone number" }]}
      >
        <Input placeholder="Enter phone number" />
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
