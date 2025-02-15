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
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import getBaseURL from "../../utils/config";
import Spinner from "../../utils/Spinner";
import UserContext from "../UserContext";
import useAddressSearch from "../../hooks/useAddressSearch";
import _ from "lodash";
import useMRTStations from "../../hooks/useMrtStations";

const { Option } = Select;
const { TextArea } = Input;

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
            `Failed to fetch profile data: ${partnerResponse.statusText}`
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
          }
        );
        if (!outletsResponse.ok) {
          throw new Error(
            `Failed to fetch outlets data: ${outletsResponse.statusText}`
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

      <Form.Item label="Email" name="email">
        <Input disabled />
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
        <TextArea value={userProfile?.description} rows={8} />
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

      <Form.Item
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
          placeholder={"Address"}
          filterOption={false}
          onSearch={handleAddressSearch}
          notFoundContent={null}
          options={(addressData || []).map((d) => ({
            value: JSON.stringify(d),
            label: d.ADDRESS,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Contact Number"
        name="contact_number"
        rules={[
          { required: true, message: "Please enter your contact number" },
        ]}
      >
        <Input placeholder="Enter contact number" />
      </Form.Item>

      <Form.Item label="Outlets">
        <Form.List name={"outlets"}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={24}>
                  <Col span={10}>
                    <Form.Item
                      name={[field.name, "address"]}
                      rules={[
                        {
                          required: true,
                          message: "Please input your address",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder={"Address"}
                        filterOption={false}
                        onSearch={handleAddressSearch}
                        notFoundContent={null}
                        options={(addressData || []).map((d) => ({
                          value: JSON.stringify(d),
                          label: d.ADDRESS,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={10}>
                    <Form.Item
                      name={[field.name, "nearest_mrt"]}
                      rules={[
                        {
                          required: true,
                          message: "Please input the nearest MRT/LRT",
                        },
                      ]}
                    >
                      <Select showSearch placeholder={"Nearest MRT/LRT"}>
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

                  <Col span={4}>
                    <Button
                      type="dashed"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                    ></Button>
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Outlet
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
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
