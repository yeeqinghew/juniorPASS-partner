import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Avatar,
  Row,
  Col,
  Tooltip,
  Card,
  Typography,
  Divider,
  Space,
  Spin,
} from "antd";
import {
  InfoCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import UserContext from "../UserContext";
import useAddressSearch from "../../hooks/useAddressSearch";
import _ from "lodash";
import useMRTStations from "../../hooks/useMrtStations";
import "./Profile.css";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useContext(UserContext);
  const { addressData, handleAddressSearch } = useAddressSearch();
  const { mrtStations, renderTags } = useMRTStations();
  const baseURL = getBaseURL();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileForm] = Form.useForm();
  const [userProfile, setUserProfile] = useState({});

  useEffect(() => {
    async function retrieveUser() {
      if (!user || !user.partner_id) return;
      if (!token) return;

      setLoading(true);

      try {
        const partnerResponse = await fetch(`${baseURL}/partners/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!partnerResponse.ok) {
          throw new Error(
            `Failed to fetch profile data: ${partnerResponse.statusText}`,
          );
        }

        const partnerData = await partnerResponse.json();
        setUserProfile(partnerData);

        const outletsResponse = await fetch(
          `${baseURL}/partners/${user?.partner_id}/outlets`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!outletsResponse.ok) {
          throw new Error(
            `Failed to fetch outlets data: ${outletsResponse.statusText}`,
          );
        }

        let outletsData = await outletsResponse.json();
        outletsData = outletsData.map((outlet) => ({
          ...outlet,
          address: JSON.parse(outlet.address), // Convert string to object
        }));

        // reset the form and stop loading
        profileForm.setFieldsValue({
          outlets: outletsData.map((outlet) => ({
            address: outlet?.address?.ADDRESS,
            nearest_mrt: outlet.nearest_mrt,
          })),
        });
      } catch (error) {
        message.error("Error fetching profile data");
        setLoading(false); // Hide loading state even on error
      } finally {
        setLoading(false);
      }
    }

    retrieveUser();
  }, []);

  const handleFormSubmit = async (values) => {
    setSaving(true);
    try {
      const response = await fetch(`${baseURL}/partners/${user.partner_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Profile updated successfully!");
        setUserProfile((prev) => ({ ...prev, ...values }));
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error in handleFormSubmit:", err);
      message.error("Error updating profile");
    } finally {
      setSaving(false);
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
    return (
      <div className="profile-loading">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <Title level={2}>Partner Profile</Title>
        <Text type="secondary">Manage your business information and settings</Text>
      </div>

      <Form
        form={profileForm}
        name="edit-profile"
        initialValues={userProfile}
        onFinish={handleFormSubmit}
        layout="vertical"
      >
        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={8}>
            {/* Profile Picture Card */}
            <Card className="profile-card profile-picture-card">
              <div className="profile-avatar-section">
                <Avatar
                  size={120}
                  src={userProfile.displayPicture?.preview || userProfile.picture}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleImageChange}
                >
                  <Button
                    icon={<UploadOutlined />}
                    type="default"
                    className="upload-button"
                  >
                    Change Picture
                  </Button>
                </Upload>
                <div className="profile-quick-info">
                  <Title level={4}>{userProfile.partner_name}</Title>
                  <Text type="secondary">{userProfile.email}</Text>
                </div>
              </div>
            </Card>

            {/* Quick Stats Card */}
            <Card className="profile-card stats-card">
              <Title level={5}>Quick Stats</Title>
              <Divider />
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div className="stat-item">
                  <Text type="secondary">Total Classes</Text>
                  <Text strong className="stat-value">
                    {userProfile.total_classes || 0}
                  </Text>
                </div>
                <div className="stat-item">
                  <Text type="secondary">Total Bookings</Text>
                  <Text strong className="stat-value">
                    {userProfile.total_bookings || 0}
                  </Text>
                </div>
                <div className="stat-item">
                  <Text type="secondary">Member Since</Text>
                  <Text strong className="stat-value">
                    {userProfile.created_at
                      ? new Date(userProfile.created_at).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={16}>
            {/* Basic Information Card */}
            <Card className="profile-card" title={<><UserOutlined /> Basic Information</>}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Partner Name"
                    name="partner_name"
                    rules={[{ required: true, message: "Please enter your name" }]}
                  >
                    <Input
                      prefix={<UserOutlined className="input-prefix-icon" />}
                      placeholder="Enter your name"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" name="email">
                    <Input
                      prefix={<MailOutlined className="input-prefix-icon" />}
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter a description" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Tell us about your business..."
                  size="large"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Category"
                    name="categories"
                    rules={[{ required: true, message: "Please select a category" }]}
                  >
                    <Select placeholder="Select category" size="large">
                      <Option value="Music">Music</Option>
                      <Option value="Sports">Sports</Option>
                      <Option value="Arts">Arts</Option>
                      <Option value="Academic">Academic</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Website"
                    name="website"
                    rules={[
                      { required: true, message: "Please enter your website URL" },
                    ]}
                  >
                    <Input
                      prefix={<GlobalOutlined className="input-prefix-icon" />}
                      placeholder="https://example.com"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Contact Information Card */}
            <Card
              className="profile-card"
              title={<><PhoneOutlined /> Contact Information</>}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Contact Number"
                    name="contact_number"
                    rules={[
                      { required: true, message: "Please enter your contact number" },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="input-prefix-icon" />}
                      placeholder="+65 1234 5678"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Address (HQ)"
                    name="address"
                    rules={[
                      { required: true, message: "Please input your address" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Search address..."
                      filterOption={false}
                      onSearch={handleAddressSearch}
                      notFoundContent={null}
                      size="large"
                      options={(addressData || []).map((d) => ({
                        value: JSON.stringify(d),
                        label: d.ADDRESS,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Outlets Card */}
            <Card
              className="profile-card"
              title={
                <span>
                  <ShopOutlined /> Outlets&nbsp;
                  <Tooltip title="Please contact admin for the removal of outlets.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </span>
              }
            >
              <Form.List name="outlets">
                {(fields, { add }) => (
                  <>
                    {fields.map((field) => (
                      <div key={field.key} className="outlet-item">
                        <Row gutter={16}>
                          <Col span={11}>
                            <Form.Item
                              name={[field.name, "address"]}
                              label="Outlet Address"
                              rules={[
                                {
                                  required: true,
                                  message: "Please input your address",
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder="Search address..."
                                filterOption={false}
                                onSearch={handleAddressSearch}
                                notFoundContent={null}
                                size="large"
                                options={(addressData || []).map((d) => ({
                                  value: JSON.stringify(d),
                                  label: d.ADDRESS,
                                }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={11}>
                            <Form.Item
                              name={[field.name, "nearest_mrt"]}
                              label="Nearest MRT/LRT"
                              rules={[
                                {
                                  required: true,
                                  message: "Please input the nearest MRT/LRT",
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder="Select nearest station"
                                size="large"
                              >
                                {!_.isEmpty(mrtStations) &&
                                  Object.keys(mrtStations).map((key, index) => (
                                    <Option key={index} value={key} label={key}>
                                      {renderTags(mrtStations[key])}
                                      {key}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                        className="add-outlet-button"
                      >
                        Add New Outlet
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Save Button */}
            <div className="profile-actions">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                className="save-button"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Profile;
