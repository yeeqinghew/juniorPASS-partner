import {
  InboxOutlined,
  PlusCircleOutlined,
  LeftOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
  Upload,
  Row,
  Col,
  Space,
  DatePicker,
  Image,
  message,
  Spin,
} from "antd";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import UserContext from "../UserContext";
import { useNavigate, useParams } from "react-router-dom";
import _ from "lodash";
import getBaseURL from "../../utils/config";
import { DataContext } from "../../hooks/DataContext";
import ScheduleItem from "../../utils/ScheduleItem";
import dayjs from "dayjs";
import "./ClassEdit.css";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const EditClass = () => {
  const baseURL = getBaseURL();
  const { listing_id } = useParams();
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);
  const [editClassForm] = Form.useForm();
  const [selectedPackageTypes, setSelectedPackageTypes] = useState([]);
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);

  // Fetch outlets for the current partner
  const fetchOutlets = async () => {
    try {
      const response = await fetch(
        `${baseURL}/partners/${user.partner_id}/outlets`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOutlets(data);
      } else {
        throw new Error("Failed to fetch outlets");
      }
    } catch (error) {
      console.error("Error fetching outlets:", error.message);
    }
  };

  // Fetch class details including outlets and schedules
  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/listings/${listing_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const parseRes = await response.json();
      setListing(parseRes);

      // Parse existing images
      let imgs = parseRes.images;
      if (typeof imgs === "string") {
        try {
          imgs = JSON.parse(imgs);
        } catch (e) {
          imgs = [];
        }
      }
      setExistingImages(imgs || []);

      // Parse existing outlets and schedules from schedule_info
      let outletsData = [];
      if (parseRes.schedule_info && parseRes.schedule_info.length > 0) {
        // Group schedules by outlet_id
        const outletMap = {};
        parseRes.schedule_info.forEach((schedule) => {
          const outletId = schedule.outlet_id || schedule.listing_outlet_id;
          if (!outletMap[outletId]) {
            outletMap[outletId] = {
              outlet_id: outletId,
              schedules: [],
            };
          }
          outletMap[outletId].schedules.push({
            day: schedule.day,
            timeslot: schedule.timeslot,
            frequency: schedule.frequency,
            slots: schedule.slots,
            credit: schedule.credit,
          });
        });
        outletsData = Object.values(outletMap);
      }

      // Set form values
      editClassForm.setFieldsValue({
        title: parseRes.listing_title,
        description: parseRes.description,
        package_types: parseRes.package_types,
        age_groups: parseRes.age_groups,
        short_term_start_date: parseRes.short_term_start_date
          ? dayjs(parseRes.short_term_start_date)
          : null,
        long_term_start_date: parseRes.long_term_start_date
          ? dayjs(parseRes.long_term_start_date)
          : null,
        outlets: outletsData,
      });

      setSelectedPackageTypes(parseRes.package_types || []);
    } catch (error) {
      console.error("Error fetching class details:", error);
      message.error("Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.partner_id) {
      fetchOutlets();
    }
  }, [user?.partner_id]);

  useEffect(() => {
    if (token) {
      fetchClassDetails();
    }
  }, [listing_id, token]);

  const props = {
    name: "image",
    multiple: true,
    maxCount: 5,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    beforeUpload(info) {
      setImages((prevImages) => [...prevImages, info]);
      return false;
    },
    onRemove(info) {
      setImages((prevImages) =>
        prevImages.filter((img) => img.uid !== info.uid),
      );
    },
  };

  const handleSelectAgeGroups = (values) => {
    editClassForm.setFieldValue("age_groups", values);
  };

  const handleSelectPackage = (values) => {
    setSelectedPackageTypes(values);
    editClassForm.setFieldValue("package_types", values);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditClass = async (values) => {
    try {
      setSaving(true);

      // Format dates for backend
      const shortTermDate = values.short_term_start_date
        ? values.short_term_start_date.format("YYYY-MM-DD")
        : null;
      const longTermDate = values.long_term_start_date
        ? values.long_term_start_date.format("YYYY-MM-DD")
        : null;

      // 1. Update the listing basic info
      const updateResponse = await fetch(`${baseURL}/listings/${listing_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title_name: values.title,
          description: values.description,
          package_types: values.package_types,
          age_groups: values.age_groups,
          short_term_start_date: shortTermDate,
          long_term_start_date: longTermDate,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update listing");
      }

      // 2. Update schedules if outlets are provided
      if (values.outlets && values.outlets.length > 0) {
        const schedulesResponse = await fetch(
          `${baseURL}/listings/${listing_id}/schedules`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              outlets: values.outlets.map((outlet) => ({
                outlet_id: outlet.outlet_id,
                schedules:
                  outlet.schedules?.map((schedule) => ({
                    day: schedule.day,
                    timeslot: schedule.timeslot,
                    frequency: schedule.frequency,
                    slots: schedule.slots || 10,
                    credit: schedule.credit || 1,
                  })) || [],
              })),
            }),
          },
        );

        if (!schedulesResponse.ok) {
          const errorData = await schedulesResponse.json();
          console.error("Schedule update error:", errorData);
          // Don't throw - listing was updated, just warn about schedules
          message.warning(
            "Listing updated but schedules may not have been saved",
          );
        }
      }

      // 3. Upload new images if any
      const uploadedImageURLs = Array.isArray(existingImages)
        ? [...existingImages]
        : [];

      if (images.length > 0) {
        for (let img of images) {
          try {
            const response = await fetch(
              `${baseURL}/misc/s3url?folder=partners/${user?.partner_id}/${listing_id}`,
            );
            const { uploadURL } = await response.json();

            const s3upload = await fetch(uploadURL, {
              method: "PUT",
              headers: {
                "Content-Type": img.type,
              },
              body: img,
            });

            if (s3upload.status === 200) {
              const imageURL = uploadURL.split("?")[0];
              uploadedImageURLs.push(imageURL);
            }
          } catch (error) {
            console.warn("Image upload error:", error.message);
          }
        }
      }

      // 4. Update images if changed
      if (
        uploadedImageURLs.length !== existingImages.length ||
        images.length > 0
      ) {
        await fetch(`${baseURL}/listings/${listing_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: uploadedImageURLs,
          }),
        });
      }

      toast.success("Class updated successfully!");
      navigate(`/class/${listing_id}`);
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "Failed to update class");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading class details...</div>
      </div>
    );
  }

  return (
    <div className="class-edit-container">
      {/* Header */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <Space align="center" style={{ marginBottom: 8 }}>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate(`/class/${listing_id}`)}
              style={{ padding: 0 }}
            />
            <Text type="secondary">Back to class details</Text>
          </Space>
          <Title
            level={2}
            className="welcome-title"
            style={{ marginBottom: 0 }}
          >
            Edit Class
          </Title>
          <Text className="welcome-text">
            Update your class information, schedules, and images
          </Text>
        </div>
        <div className="welcome-actions">
          <Button
            onClick={() => navigate(`/class/${listing_id}`)}
            className="welcome-btn-secondary"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => editClassForm.submit()}
            loading={saving}
            className="welcome-btn-primary"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Form
        name="edit-class"
        className="class-edit-form"
        form={editClassForm}
        onFinish={handleEditClass}
        layout="vertical"
      >
        <div className="form-section-header">Basic Information</div>

        <Form.Item
          name="title"
          label="Class Title"
          rules={[
            {
              required: true,
              message: "Please input the class title",
            },
          ]}
        >
          <Input placeholder="Enter class title" size="large" />
        </Form.Item>

        <Form.Item
          name="package_types"
          label="Package Types"
          rules={[
            {
              required: true,
              message: "Please select the package type",
            },
          ]}
        >
          <Select
            placeholder="Select package types"
            onChange={handleSelectPackage}
            mode="multiple"
            size="large"
          >
            {packageTypes &&
              packageTypes.map((packageType) => (
                <Select.Option
                  key={packageType.id}
                  value={packageType.package_type}
                >
                  {packageType.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        {selectedPackageTypes?.includes("short-term") && (
          <Form.Item
            name="short_term_start_date"
            label="Short-term Start Date"
            rules={[
              {
                required: true,
                message: "Please select the start date for short-term",
              },
            ]}
          >
            <DatePicker
              placeholder="Select short-term start date"
              size="large"
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

        {selectedPackageTypes?.includes("long-term") && (
          <Form.Item
            name="long_term_start_date"
            label="Long-term Start Date"
            rules={[
              {
                required: true,
                message: "Please select the start date for long-term",
              },
            ]}
          >
            <DatePicker
              placeholder="Select long-term start date"
              size="large"
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="Class Description"
          rules={[
            {
              required: true,
              message: "Please input a description",
            },
          ]}
        >
          <TextArea
            showCount
            maxLength={5000}
            placeholder="Describe your class..."
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>

        <Form.Item
          name="age_groups"
          label="Age Groups"
          rules={[
            {
              required: true,
              message: "Please select age groups",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select age groups"
            onChange={handleSelectAgeGroups}
            size="large"
          >
            {ageGroups &&
              ageGroups.map((age) => (
                <Select.Option key={age.id} value={age.name}>
                  {age.max_age !== null
                    ? `${age.min_age} to ${age.max_age} years old: ${age.name}`
                    : `${age.name} years old`}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <div className="form-section-header">Outlets & Schedules</div>

        <Form.List name="outlets">
          {(outletFields, { add: addOutlet, remove: removeOutlet }) => (
            <>
              <Button
                type="dashed"
                icon={<PlusCircleOutlined />}
                className="add-outlet-button"
                style={{ marginBottom: "16px" }}
                onClick={() => addOutlet({ schedules: [{}] })}
                block
              >
                Add Outlet
              </Button>

              {outletFields.map((outletField, outletIndex) => (
                <div key={outletField.key} className="outlet-section">
                  <div className="outlet-section-title">
                    Outlet {outletIndex + 1}
                  </div>
                  <Col flex="1 0 25%">
                    <Form.Item
                      name={[outletField.name, "outlet_id"]}
                      label="Select Outlet Location"
                      rules={[
                        { required: true, message: "Please select an outlet" },
                      ]}
                    >
                      <Select placeholder="Select an outlet" size="large">
                        {outlets.map((outletOption) => {
                          const parsedAddress = JSON.parse(
                            outletOption.address,
                          );
                          return (
                            <Select.Option
                              key={outletOption.outlet_id}
                              value={outletOption.outlet_id}
                            >
                              {parsedAddress.ADDRESS}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    {/* Dynamic Schedules List */}
                    <Form.List name={[outletField.name, "schedules"]}>
                      {(
                        scheduleFields,
                        { add: addSchedule, remove: removeSchedule },
                      ) => (
                        <div className="schedule-section">
                          {scheduleFields.map((scheduleField) => (
                            <Row
                              key={scheduleField.key}
                              gutter={[16, 8]}
                              align="middle"
                            >
                              <Col span={20}>
                                <ScheduleItem
                                  key={scheduleField.key}
                                  field={scheduleField}
                                  remove={() =>
                                    removeSchedule(scheduleField.name)
                                  }
                                />
                              </Col>
                            </Row>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => addSchedule()}
                              icon={<PlusCircleOutlined />}
                              className="add-schedule-button"
                              block
                            >
                              Add Schedule
                            </Button>
                          </Form.Item>
                        </div>
                      )}
                    </Form.List>

                    <Button
                      type="dashed"
                      danger
                      onClick={() => removeOutlet(outletField.name)}
                      className="remove-outlet-button"
                      style={{ marginTop: "10px" }}
                      block
                    >
                      Remove Outlet
                    </Button>
                  </Col>
                </div>
              ))}
            </>
          )}
        </Form.List>

        <div className="form-section-header">Class Images</div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="image-grid" style={{ marginBottom: 16 }}>
            {existingImages.map((image, index) => (
              <div key={index} className="image-item">
                <Image
                  src={image}
                  width={120}
                  height={120}
                  alt={`Class image ${index + 1}`}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
                <Button
                  danger
                  className="image-delete-button"
                  icon={<DeleteOutlined />}
                  size="small"
                  shape="circle"
                  onClick={() => handleRemoveExistingImage(index)}
                />
              </div>
            ))}
          </div>
        )}

        <Dragger
          {...props}
          className="upload-dragger"
          style={{ marginBottom: "24px" }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint">
            Upload up to 5 images for your class
          </p>
        </Dragger>

        <Button
          type="primary"
          htmlType="submit"
          className="save-button"
          loading={saving}
          block
        >
          <SaveOutlined /> Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default EditClass;
