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
  Tag,
  Badge,
} from "antd";
import {
  InfoCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HomeOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import Spinner from "../../utils/Spinner";
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
  const [loading, setLoading] = useState(true); // Loading state for data fetch
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
            address: JSON.stringify(outlet.address),
            nearest_mrt: outlet.nearest_mrt,
          })),
        });

        setLoading(false);
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

  // Helper function to parse and display address
  const getDisplayAddress = (addressValue) => {
    if (!addressValue) return null;
    try {
      const parsedAddress =
        typeof addressValue === "string"
          ? JSON.parse(addressValue)
          : addressValue;
      return parsedAddress.ADDRESS || null;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return <Spinner />; // Show loading state until data is fetched
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <Title level={2} className="profile-title">
            Partner Profile
          </Title>
          <Text className="profile-subtitle">
            Manage your business information and outlet locations
          </Text>
        </div>

        <Form
          form={profileForm}
          name="edit-profile"
          initialValues={userProfile}
          onFinish={handleFormSubmit}
          layout="vertical"
        >
          <Card
            className="profile-card"
            title={
              <Space>
                <UserOutlined className="form-section-icon" />
                <Title level={4} style={{ margin: 0 }}>
                  Basic Information
                </Title>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Partner Name"
                  name="partner_name"
                  rules={[
                    { required: true, message: "Please enter your name" },
                  ]}
                >
                  <Input placeholder="Enter your partner name" size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Email" name="email">
                  <Input disabled size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Display Picture">
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-wrapper">
                      {userProfile.displayPicture?.preview ||
                      userProfile.picture ? (
                        <Badge
                          count={
                            <CheckCircleFilled style={{ color: "#52c41a" }} />
                          }
                          offset={[-10, 85]}
                        >
                          <Avatar
                            size={100}
                            src={
                              userProfile.displayPicture?.preview ||
                              userProfile.picture
                            }
                            alt="Display Picture"
                            className="profile-avatar"
                          />
                        </Badge>
                      ) : (
                        <Avatar
                          size={100}
                          icon={<UserOutlined />}
                          className="profile-avatar"
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      )}
                    </div>
                    <div>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleImageChange}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          type="primary"
                          size="large"
                        >
                          Change Picture
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: "Please enter a description" },
                  ]}
                >
                  <TextArea
                    value={userProfile?.description}
                    rows={6}
                    placeholder="Describe your business, services, and what makes you unique..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Category"
                  name="categories"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select placeholder="Select category" size="large">
                    <Option value="Music">Music</Option>
                    <Option value="Sports">Sports</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <PhoneOutlined />
                      <span>Contact Number</span>
                    </Space>
                  }
                  name="contact_number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your contact number",
                    },
                  ]}
                  className="input-with-icon"
                >
                  <Input
                    placeholder="e.g., +65 1234 5678"
                    size="large"
                    prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={
                    <Space>
                      <GlobalOutlined />
                      <span>Website</span>
                    </Space>
                  }
                  name="website"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your website URL",
                    },
                  ]}
                  className="input-with-icon"
                >
                  <Input
                    placeholder="https://www.example.com"
                    size="large"
                    prefix={<GlobalOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            className="profile-card"
            title={
              <Space>
                <HomeOutlined className="form-section-icon" />
                <Title level={4} style={{ margin: 0 }}>
                  Headquarters Address
                </Title>
              </Space>
            }
          >
            <Form.Item
              label="Address"
              name={"address"}
              fieldId={"address"}
              rules={[
                {
                  required: true,
                  message: "Please input your address",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Search and select your address"
                filterOption={false}
                onSearch={handleAddressSearch}
                notFoundContent={null}
                size="large"
                suffixIcon={<EnvironmentOutlined />}
                optionLabelProp="label"
                className="input-with-icon"
                options={(addressData || []).map((d) => ({
                  value: JSON.stringify(d),
                  label: d.ADDRESS,
                }))}
              />
            </Form.Item>
          </Card>

          <Card
            className="profile-card"
            title={
              <Space>
                <ShopOutlined />
                <Title level={4} style={{ margin: 0 }}>
                  Outlet Locations
                </Title>
                <Tooltip title="Please contact admin for the removal of outlets.">
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Form.List name={"outlets"}>
              {(fields, { add }) => (
                <>
                  {fields.length === 0 && (
                    <div className="outlet-empty-state">
                      <ShopOutlined className="outlet-empty-icon" />
                      <div>
                        <Text
                          strong
                          style={{
                            display: "block",
                            fontSize: 16,
                            marginBottom: 8,
                          }}
                        >
                          No outlets yet
                        </Text>
                        <Text type="secondary" style={{ display: "block" }}>
                          Start by adding your first outlet location below
                        </Text>
                      </div>
                    </div>
                  )}

                  {fields.map((field, index) => {
                    const addressValue = profileForm.getFieldValue([
                      "outlets",
                      field.name,
                      "address",
                    ]);

                    let displayAddress = "Address not set";
                    if (addressValue) {
                      try {
                        const parsedAddress =
                          typeof addressValue === "string"
                            ? JSON.parse(addressValue)
                            : addressValue;
                        displayAddress =
                          parsedAddress.ADDRESS || displayAddress;
                      } catch (e) {
                        // If parsing fails, use the value as is
                        displayAddress = addressValue;
                      }
                    }

                    return (
                      <Card
                        key={field.key}
                        type="inner"
                        className="outlet-card"
                        title={
                          <Space>
                            <Tag className="outlet-number-tag">
                              Outlet {index + 1}
                            </Tag>
                            <Text strong>{displayAddress}</Text>
                          </Space>
                        }
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={14}>
                            <Form.Item
                              name={[field.name, "address"]}
                              label={
                                <Space>
                                  <EnvironmentOutlined />
                                  <span>Outlet Address</span>
                                </Space>
                              }
                              rules={[
                                {
                                  required: true,
                                  message: "Please input the outlet address",
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder="Search and select outlet address"
                                filterOption={false}
                                onSearch={handleAddressSearch}
                                notFoundContent={null}
                                size="large"
                                optionLabelProp="label"
                                className="input-with-icon"
                                options={(addressData || []).map((d) => ({
                                  value: JSON.stringify(d),
                                  label: d.ADDRESS,
                                }))}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={10}>
                            <Form.Item
                              name={[field.name, "nearest_mrt"]}
                              label="Nearest MRT/LRT Station"
                              rules={[
                                {
                                  required: true,
                                  message: "Please select the nearest MRT/LRT",
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
                      </Card>
                    );
                  })}

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      className="add-outlet-button"
                    >
                      Add New Outlet
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="save-button"
            >
              💾 Save All Changes
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
