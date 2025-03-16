import {
  InboxOutlined,
  PlusCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
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
import getBaseURL from "../../utils/config";
import { DataContext } from "../../hooks/DataContext";
import ScheduleItem from "../../utils/ScheduleItem";

const { Title } = Typography;
const { Dragger } = Upload;

const CreateClass = () => {
  const baseURL = getBaseURL();
  const [images, setImages] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);
  const [createClassForm] = Form.useForm();
  const [selectedPackageTypes, setSelectedPackageTypes] = useState([]);
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);

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
        }
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
        prevImages.filter((img) => img.uid !== info.uid)
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
    console.log(values);

    try {
      // 1. Create the listing first
      const createListingResponse = await fetch(`${baseURL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          partner_id: user.partner_id,
          images: [], // temporarily empty, will be updated later
          short_term_start_date: values.short_term_start_date || null,
          long_term_start_date: values.long_term_start_date || null,
        }),
      });

      const createListingResult = await createListingResponse.json();
      if (createListingResponse.status !== 201) {
        throw new Error(
          createListingResult.error || "Failed to create listing"
        );
      }

      const listingId = createListingResult.data.listing_id;

      // 2. upload images to S3 with correct folder path
      const uploadedImageURLs = [];
      for (let img of images) {
        try {
          const response = await fetch(
            `${baseURL}/misc/s3url?folder=partners/${user?.partner_id}/${listingId}`
          );
          const { uploadURL } = await response.json();

          // post the image directly to S3 bucket
          const s3upload = await fetch(uploadURL, {
            method: "PUT",
            headers: {
              "Content-Type": img.type,
            },
            body: img,
          });

          if (s3upload.status !== 200) {
            throw new Error("Failed to upload image");
          }

          const imageURL = uploadURL.split("?")[0];
          uploadedImageURLs.push(imageURL);
        } catch (error) {
          console.error("Image upload failed:", error);

          // 3. (Rollback): delete the listing if any image upload fails
          await fetch(`${baseURL}/listings/${listingId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          throw new Error("Image upload failed. Listing has been rolled back.");
        }
      }

      // 4. Update the lsiting with the uploaded image URLs
      const updateListingResponse = await fetch(
        `${baseURL}/listings/${listingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: JSON.stringify(uploadedImageURLs),
          }),
        }
      );

      const updateListingResult = await updateListingResponse.json();
      if (updateListingResponse.status === 200) {
        createClassForm.resetFields();
        toast.success(
          updateListingResult.message || "Listing created successfully"
        );
        navigate("/classes");
      } else {
        throw new Error(
          updateListingResult.error || "Failed to update listing with images"
        );
      }
    } catch (error) {
      console.error(error.message);
      toast.error("ERROR in creating class. Please try again later.");
    }
  };

  return (
    <>
      <Space
        direction="horizontal"
        style={{
          alignItems: "center",
        }}
      >
        <LeftOutlined
          onClick={() => {
            return navigate(-1);
          }}
        />
        <Title level={3}>Create Class</Title>
      </Space>

      <Form
        name="create-class"
        style={{
          maxWidth: "100%",
        }}
        form={createClassForm}
        onFinish={handleCreateClass}
      >
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: "Please input the class title",
            },
          ]}
        >
          <Input placeholder="Class Title" size={"large"} required />
        </Form.Item>
        <Form.Item
          name="package_types"
          rules={[
            {
              required: true,
              message: "Please select the package type",
            },
          ]}
        >
          <Select
            placeholder="Select package type"
            onChange={handleSelectPackage}
            mode="multiple"
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
            rules={[
              {
                required: true,
                message: "Please select the start date for short-term",
              },
            ]}
          >
            <DatePicker placeholder="Select short-term start date" />
          </Form.Item>
        )}
        {createClassForm
          .getFieldValue("package_types")
          ?.includes("long-term") && (
          <Form.Item
            name="long_term_start_date"
            rules={[
              {
                required: true,
                message: "Please select the start date for long-term",
              },
            ]}
          >
            <DatePicker placeholder="Select long-term start date" />
          </Form.Item>
        )}
        <Form.Item
          name="credit"
          rules={[
            {
              required: true,
              message: "Please input your credit",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            prefix={<Avatar src={require("../../images/credit.png")}></Avatar>}
          />
        </Form.Item>
        <Form.Item
          name="description"
          rules={[
            {
              required: true,
              message: "Please input your description",
            },
          ]}
        >
          <TextArea
            showCount
            maxLength={5000}
            placeholder="Class Description"
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>
        <Form.Item
          name={"age_groups"}
          rules={[
            {
              required: true,
              message: "Please select your age groups",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select age groups"
            onChange={handleSelectAgeGroups}
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

        <Form.List name="outlets">
          {(outletFields, { add: addOutlet, remove: removeOutlet }) => (
            <>
              <Button
                type="dashed"
                icon={<PlusCircleOutlined />}
                style={{ marginBottom: "16px" }}
                onClick={() => addOutlet({ schedules: [{}] })} // Ensure schedules exist in each new outlet
              >
                Add outlet
              </Button>

              {outletFields.map((outletField, outletIndex) => (
                <div
                  key={outletField.key}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Col flex="1 0 25%">
                    {/* Outlet Selection */}
                    <Form.Item
                      name={[outletField.name, "outlet_id"]}
                      label="Outlet"
                      rules={[
                        { required: true, message: "Please select an outlet" },
                      ]}
                    >
                      <Select placeholder="Select an outlet">
                        {outlets.map((outletOption) => {
                          const parsedAddress = JSON.parse(
                            outletOption.address
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
                        { add: addSchedule, remove: removeSchedule }
                      ) => (
                        <div
                          style={{
                            border: "1px dotted #cccccc",
                            borderRadius: "5px",
                            padding: "12px",
                          }}
                        >
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
                            >
                              Add schedule
                            </Button>
                            {/* <Form.ErrorList errors={errors} /> */}
                          </Form.Item>
                        </div>
                      )}
                    </Form.List>

                    <Button
                      type="dashed"
                      danger
                      onClick={() => removeOutlet(outletField.name)}
                      style={{ marginTop: "10px" }}
                    >
                      Remove Outlet
                    </Button>
                  </Col>
                </div>
              ))}
            </>
          )}
        </Form.List>

        <Dragger {...props} style={{ marginBottom: "24px" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint"></p>
        </Dragger>
        <Button
          type="primary"
          size="large"
          block
          htmlType="submit"
          loading={false}
        >
          Create Class
        </Button>
      </Form>
    </>
  );
};

export default CreateClass;
