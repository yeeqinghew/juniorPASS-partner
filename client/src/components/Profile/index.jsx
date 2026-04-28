import { useState, useEffect, useContext, useRef } from "react";
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
  CameraOutlined,
} from "@ant-design/icons";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import UserContext from "../UserContext";
import useAddressSearch from "../../hooks/useAddressSearch";
import _ from "lodash";
import useMRTStations from "../../hooks/useMrtStations";
import "./Profile.css";
import LoadingContainer from "../../utils/LoadingContainer";
import toast from "react-hot-toast";

const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const { user } = useContext(UserContext);
  const { addressData, handleAddressSearch } = useAddressSearch();
  const { mrtStations, renderTags } = useMRTStations();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileForm] = Form.useForm();
  const [userProfile, setUserProfile] = useState({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function retrieveUser() {
      if (!user || !user.partner_id || !token) return;

      setLoading(true);

      try {
        const partnerRes = await fetchWithAuth(API_ENDPOINTS.GET_PARTNER);

        const partnerData = await partnerRes.json();
        setUserProfile(partnerData);

        const outletRes = await fetchWithAuth(
          API_ENDPOINTS.GET_OUTLETS(user.partner_id)
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
      const res = await fetchWithAuth(
        API_ENDPOINTS.UPDATE_PARTNER(user.partner_id),
        {
          method: "PATCH",
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) throw new Error();

      message.success("Profile updated!");
      setUserProfile((prev) => ({ ...prev, ...values }));
    } catch {
      message.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async(e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    if (file.size / 1024 / 1024 > 5) { toast.error("Image must be under 5MB");   return; }
    try {
      setUploadLoading(true);
      const token = localStorage.getItem("token");
      const sigRes = await fetchWithAuth(API_ENDPOINTS.UPLOAD_PARTNER_DP, {
        method: "POST",
      });
      const sigData = await sigRes.json();
      if(!sigRes.ok) throw new Error(sigData.message || "Failed to get upload signature");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key",   sigData.apiKey);
      formData.append("timestamp", sigData.allowedParams.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder",    sigData.allowedParams.folder);
      formData.append("public_id", sigData.allowedParams.public_id);
      formData.append("overwrite", sigData.allowedParams.overwrite);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");

      const updateRes = await fetchWithAuth(
        API_ENDPOINTS.UPDATE_PARTNER(user.partner_id),
        {
          method: "PATCH",
          body: JSON.stringify({ picture: uploadData.secure_url }),
        }
      );
      if (!updateRes.ok) throw new Error("Failed to update profile picture");

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadLoading(false);
      e.target.value = ""; // Reset file input
    }
  };

  if (loading) {
    return <LoadingContainer />;
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
                  <div className="ac-avatar-wrap">
                    <Avatar
                      size={88}
                      className="ac-avatar"
                      src={userProfile?.picture}
                      icon={<UserOutlined />}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <button
                      className="ac-camera-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadLoading}
                      title="Change photo"
                    >
                      <CameraOutlined />
                    </button>
                  </div>

                  <h3 style={{ marginTop: 12 }}>{userProfile.partner_name}</h3>
                  <p>{userProfile.email}</p>
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
