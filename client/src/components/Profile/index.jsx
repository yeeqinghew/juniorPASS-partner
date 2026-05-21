import { useState, useEffect, useContext } from "react";
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
  SaveOutlined,
} from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import UserContext from "../UserContext";
import useAddressSearch from "../../hooks/useAddressSearch";
import _ from "lodash";
import useMRTStations from "../../hooks/useMrtStations";
import "./Profile.css";
import LoadingContainer from "../../utils/LoadingContainer";

const { Option } = Select;
const { TextArea } = Input;

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
      if (!user || !user.partner_id || !token) return;

      setLoading(true);

      try {
        const partnerRes = await fetch(`${baseURL}/partners/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const partnerData = await partnerRes.json();
        setUserProfile(partnerData);

        const outletRes = await fetch(
          `${baseURL}/partners/${user.partner_id}/outlets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        let outlets = await outletRes.json();

        outlets = outlets.map((o) => ({
          address: o.address ? JSON.parse(o.address).ADDRESS : "",
          nearest_mrt: o.nearest_mrt,
        }));

        profileForm.setFieldsValue({
          ...partnerData,
          outlets,
        });
      } catch (err) {
        message.error("Error fetching profile");
      } finally {
        setLoading(false);
      }
    }

    retrieveUser();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const res = await fetch(`${baseURL}/partners/${user.partner_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error();

      message.success("Profile updated!");
      setUserProfile((prev) => ({ ...prev, ...values }));
    } catch {
      message.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserProfile((prev) => ({
        ...prev,
        displayPicture: reader.result,
      }));
    };
    if (file) reader.readAsDataURL(file);
    return false;
  };

  if (loading) {
    return (
      <LoadingContainer />
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* HEADER */}
        <div className="profile-header">
          <h2 className="profile-title">Partner Profile</h2>
          <p className="profile-subtitle">
            Manage your business information and settings
          </p>
        </div>

        <Form form={profileForm} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[24, 24]}>
            {/* LEFT */}
            <Col xs={24} lg={8}>
              <Card className="profile-card">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    <Avatar
                      size={110}
                      src={userProfile.displayPicture || userProfile.picture}
                      icon={<UserOutlined />}
                      className="profile-avatar"
                    />
                  </div>

                  <Upload
                    showUploadList={false}
                    beforeUpload={handleImageChange}
                  >
                    <Button icon={<UploadOutlined />}>Change Picture</Button>
                  </Upload>

                  <h3 style={{ marginTop: 12 }}>{userProfile.partner_name}</h3>
                  <p>{userProfile.email}</p>
                </div>
              </Card>

              <Card className="profile-card">
                <h4>Quick Stats</h4>
                <Divider />
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="stat-item">
                    <span>Total Classes</span>
                    <strong>{userProfile.total_classes || 0}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Bookings</span>
                    <strong>{userProfile.total_bookings || 0}</strong>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* RIGHT */}
            <Col xs={24} lg={16}>
              {/* BASIC */}
              <Card
                className="profile-card"
                title={
                  <>
                    <UserOutlined className="form-section-icon" />
                    Basic Information
                  </>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="partner_name" label="Name" required>
                      <Input className="input-with-icon" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label="Email">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Description" required>
                  <TextArea rows={4} className="input-with-icon" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="categories" label="Category" required>
                      <Select className="input-with-icon">
                        <Option value="Music">Music</Option>
                        <Option value="Sports">Sports</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="website" label="Website" required>
                      <Input className="input-with-icon" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* CONTACT */}
              <Card
                className="profile-card"
                title={
                  <>
                    <PhoneOutlined className="form-section-icon" />
                    Contact
                  </>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="contact_number" label="Phone" required>
                      <Input className="input-with-icon" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="address" label="HQ Address" required>
                      <Select
                        showSearch
                        onSearch={handleAddressSearch}
                        options={(addressData || []).map((d) => ({
                          value: JSON.stringify(d),
                          label: d.ADDRESS,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* OUTLETS */}
              <Card
                className="profile-card"
                title={
                  <>
                    <ShopOutlined /> Outlets{" "}
                    <Tooltip title="Contact admin to remove outlets">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </>
                }
              >
                <Form.List name="outlets">
                  {(fields, { add }) => (
                    <>
                      {fields.map((field) => (
                        <Card
                          key={field.key}
                          className="outlet-card"
                          title={`Outlet ${field.name + 1}`}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name={[field.name, "address"]}
                                label="Address"
                                required
                              >
                                <Select
                                  showSearch
                                  onSearch={handleAddressSearch}
                                  options={(addressData || []).map((d) => ({
                                    value: JSON.stringify(d),
                                    label: d.ADDRESS,
                                  }))}
                                />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                name={[field.name, "nearest_mrt"]}
                                label="Nearest MRT"
                                required
                              >
                                <Select>
                                  {Object.keys(mrtStations).map((k) => (
                                    <Option key={k} value={k}>
                                      {renderTags(mrtStations[k])} {k}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}

                      <Button
                        type="dashed"
                        block
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                        className="add-outlet-button"
                      >
                        Add Outlet
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>

              <div className="profile-actions">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  className="save-button"
                >
                  Save Changes
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
