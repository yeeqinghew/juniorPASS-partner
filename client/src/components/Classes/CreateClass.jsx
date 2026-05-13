import {
  InboxOutlined,
  PlusCircleOutlined,
  LeftOutlined,
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
} from "antd";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import UserContext from "../UserContext";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { fetchWithAuth, API_ENDPOINTS } from "../../utils/api";
import { DataContext } from "../../hooks/DataContext";
import ScheduleItem from "../../utils/ScheduleItem";
import LoadingOverlay from "../LoadingOverlay";
import "./ClassEdit.css";

const { Title } = Typography;
const { Dragger } = Upload;

const CreateClass = () => {
  const [images, setImages] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);
  const [createClassForm] = Form.useForm();
  const [selectedPackageTypes, setSelectedPackageTypes] = useState([]);
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  // Fetch outlets for the current partner
  const fetchOutlets = async () => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.GET_OUTLETS(user.partner_id)
      );

      if (response.ok) {
        const data = await response.json();
        setOutlets(data); // Set the outlets state
      } else {
        throw new Error("Failed to fetch outlets");
      }
    } catch (error) {
      console.error("Error fetching outlets:", error.message);
    }
  };

  useEffect(() => {
    if (user?.partner_id) {
      fetchOutlets(); // Fetch outlets when the user is available and has a partner_id
    }
  }, [user?.partner_id]);

  const props = {
    name: "image",
    multiple: true,
    maxCount: 5,
    required: true,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    beforeUpload(info) {
      // setImage(info);
      setImages((prevImages) => [...prevImages, info]);
      return false;
    },
    onDrop(info) {
      console.log("Dropped files", info.dataTransfer.files);
    },
    onRemove(info) {
      // setImage(null);
      setImages((prevImages) =>
        prevImages.filter((img) => img.uid !== info.uid),
      );
    },
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      size: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  const handleSelectAgeGroups = (values) => {
    createClassForm.setFieldValue("age_groups", values);
  };

  const handleSelectPackage = (values) => {
    setSelectedPackageTypes(values);
    createClassForm.setFieldValue("package_types", values);
  };

  const handleCreateClass = async (values) => {
    // Validate images before proceeding
    if (images.length === 0) {
      toast.error("Please upload at least one image for the class");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStatus("Creating listing...");

    let listingId = null; // Track listing ID for rollback

    try {
      // 1. Create the listing first
      const createListingResponse = await fetchWithAuth(
        API_ENDPOINTS.CREATE_LISTING,
        {
          method: "POST",
          body: JSON.stringify({
            ...values,
            partner_id: user.partner_id,
            images: [], // temporarily empty, will be updated later
            short_term_start_date: values.short_term_start_date || null,
            long_term_start_date: values.long_term_start_date || null,
          }),
        }
      );

      const createListingResult = await createListingResponse.json();
      if (createListingResponse.status !== 201) {
        throw new Error(
          createListingResult.error || "Failed to create listing",
        );
      }

      listingId = createListingResult.data.listing_id;
      setUploadProgress(20);

      // 2. Upload images to Cloudinary
      const uploadedImageURLs = [];
      console.log(`Starting upload of ${images.length} images...`);
      setUploadStatus(`Uploading images (0/${images.length})...`);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        try {
          console.log(`Uploading image ${i + 1}/${images.length}...`);
          setUploadStatus(`Uploading image ${i + 1}/${images.length}...`);
          setUploadProgress(20 + ((i / images.length) * 60));

          // Get Cloudinary signature from backend
          const response = await fetchWithAuth(
            API_ENDPOINTS.UPLOAD_LISTING_IMAGE,
            {
              method: "POST",
              body: JSON.stringify({
                listingId: listingId,
                partnerId: user.partner_id,
              }),
            }
          );
          const sigData = await response.json();
          if (!response.ok) {
            console.error("Failed to get upload signature:", sigData);
            throw new Error(sigData.message || "Failed to get upload signature");
          }

          // Upload to Cloudinary
          const formData = new FormData();
          formData.append("file", img);
          formData.append("api_key", sigData.apiKey);
          formData.append("timestamp", sigData.allowedParams.timestamp);
          formData.append("signature", sigData.signature);
          formData.append("folder", sigData.allowedParams.folder);
          formData.append("public_id", sigData.allowedParams.public_id);
          formData.append("overwrite", sigData.allowedParams.overwrite);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            console.error("Cloudinary upload failed:", uploadData);
            throw new Error(uploadData.error?.message || "Failed to upload image");
          }

          console.log(`Image ${i + 1} uploaded successfully:`, uploadData.secure_url);
          uploadedImageURLs.push(uploadData.secure_url);
        } catch (error) {
          console.error(`Image ${i + 1} upload failed:`, error);

          // 3. (Rollback): delete the listing if any image upload fails
          setUploadStatus("Upload failed. Rolling back...");
          try {
            await fetchWithAuth(API_ENDPOINTS.DELETE_LISTING(listingId), {
              method: "DELETE",
            });
            console.log("Listing rolled back successfully");
          } catch (deleteErr) {
            console.error("Failed to rollback listing:", deleteErr);
          }

          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      setUploadProgress(80);
      setUploadStatus("Finalizing listing...");

      // 4. Update the listing with the uploaded image URLs
      console.log("Updating listing with images:", uploadedImageURLs);
      const updateListingResponse = await fetchWithAuth(
        API_ENDPOINTS.UPDATE_LISTING(listingId),
        {
          method: "PATCH",
          body: JSON.stringify({
            images: uploadedImageURLs,
          }),
        }
      );

      const updateListingResult = await updateListingResponse.json();
      console.log("Update listing response:", updateListingResult);

      if (updateListingResponse.status === 200) {
        setUploadProgress(100);
        setUploadStatus("Class created successfully!");
        createClassForm.resetFields();
        toast.success(
          updateListingResult.message || "Listing created successfully",
        );
        setTimeout(() => {
          navigate("/classes");
        }, 500);
      } else {
        // Rollback: delete the listing if PATCH fails
        setUploadStatus("Update failed. Rolling back...");
        try {
          await fetchWithAuth(API_ENDPOINTS.DELETE_LISTING(listingId), {
            method: "DELETE",
          });
        } catch (deleteErr) {
          console.error("Failed to rollback listing:", deleteErr);
        }

        throw new Error(
          updateListingResult.error || "Failed to update listing with images",
        );
      }
    } catch (error) {
      console.error(error.message);
      setUploadStatus("");

      // Rollback: Delete the listing if it was created
      if (listingId) {
        console.log(`Attempting to rollback listing ${listingId}...`);
        try {
          await fetchWithAuth(API_ENDPOINTS.DELETE_LISTING(listingId), {
            method: "DELETE",
          });
          console.log("Listing rolled back successfully");
          toast.error(
            error.message || "Failed to create class. Changes have been rolled back.",
          );
        } catch (deleteErr) {
          console.error("Failed to rollback listing:", deleteErr);
          toast.error(
            `Failed to create class. Please manually delete listing ID: ${listingId}`,
          );
        }
      } else {
        toast.error(
          error.message || "ERROR in creating class. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 2000);
    }
  };

  return (
    <div className="class-edit-container">
      <LoadingOverlay
        visible={loading}
        status={uploadStatus}
        progress={uploadProgress}
        showProgress={true}
      />

      <div className="class-edit-header">
        <Space align="center">
          <LeftOutlined onClick={() => navigate(-1)} className="back-icon" />
          <Title level={2} className="class-edit-title">
            Create New Class
          </Title>
        </Space>
      </div>

      <Form
        name="create-class"
        className="class-edit-form"
        form={createClassForm}
        onFinish={handleCreateClass}
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
        {createClassForm
          .getFieldValue("package_types")
          ?.includes("short-term") && (
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
              className="w-full"
            />
          </Form.Item>
        )}
        {createClassForm
          .getFieldValue("package_types")
          ?.includes("long-term") && (
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
              className="w-full"
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
            className="textarea-description"
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
                className="add-outlet-button mb-16"
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
                          ); // Convert string to object
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
                      className="remove-outlet-button mt-10"
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

        <div className="form-section-header">
          Class Images <span style={{ color: "red" }}>*</span>
        </div>

        <Dragger {...props} className="upload-dragger mb-24">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint">
            Upload at least 1 image (up to 5 images) for your class
          </p>
        </Dragger>

        <Button
          type="primary"
          htmlType="submit"
          className="save-button"
          loading={false}
          block
        >
          Create Class
        </Button>
      </Form>
    </div>
  );
};

export default CreateClass;
