import {
  DeleteOutlined,
  InboxOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getBaseURL from "../../utils/config";
import useFormInitialization from "../../hooks/useFormInitialization";
import UserContext from "../UserContext";
import _ from "lodash";
import ScheduleItem from "../../utils/ScheduleItem";
import { DataContext } from "../../hooks/DataContext";
import Dragger from "antd/es/upload/Dragger";
import "./ClassEdit.css";

const { Title } = Typography;
const Class = () => {
  const baseURL = getBaseURL();
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const { listing_id } = useParams();
  const [listing, setListing] = useState();
  const [editClassForm] = Form.useForm();
  const [outlets, setOutlets] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);

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
        setOutlets(data);
      } else {
        throw new Error("Failed to fetch outlets");
      }
    } catch (error) {
      console.error("Error fetching outlets:", error.message);
    }
  };

  useEffect(() => {
    if (user?.partner_id) {
      fetchOutlets();
    }
  }, [user?.partner_id]);

  useEffect(() => {
    async function fetchClassDetails() {
      try {
        const response = await fetch(`${baseURL}/listings/${listing_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const parseRes = await response.json();
        setListing(parseRes);
      } catch (error) {
        console.error("Error fetching class details:", error);
      }
    }
    fetchClassDetails();
  }, [listing_id]);

  useFormInitialization(editClassForm, listing);

  const handleEditClass = () => {};

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
      // setImages((prevImages) => [...prevImages, info]);
      return false;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    onRemove(info) {
      // setImage(null);
      // setImages((prevImages) =>
      //   prevImages.filter((img) => img.uid !== info.uid)
      // );
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

  return (
    <div className="class-edit-container">
      <div className="class-edit-header">
        <Title level={2} className="class-edit-title">
          {listing?.listing_title || "Edit Class"}
        </Title>
      </div>

      <Form
        name="edit-class"
        className="class-edit-form"
        form={editClassForm}
        autoComplete="off"
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
          <Input size="large" placeholder="Enter class title" />
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

        <Form.Item
          name="description"
          label="Description"
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
          <Select mode="multiple" placeholder="Select age groups" size="large">
            {ageGroups.map((age) => (
              <Select.Option key={age.id} value={age.name}>
                {age.max_age !== null
                  ? `${age.min_age} to ${age.max_age} years old: ${age.name}`
                  : `${age.min_age}+ years old`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="form-section-header">Outlets & Schedules</div>

        {/* dynamic form for multiple outlets */}
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

        <div className="form-section-header">Images</div>

        <Form.Item>
          <div className="image-grid">
            {listing?.images &&
              listing?.images.map((image, index) => (
                <div key={index} className="image-item">
                  <Image
                    src={image}
                    width={120}
                    height={120}
                    alt={`Class image ${index + 1}`}
                  />
                  <Button
                    danger
                    className="image-delete-button"
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </div>
              ))}
          </div>
        </Form.Item>

        <Dragger
          {...props}
          className="upload-dragger"
          style={{ marginBottom: "24px" }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint"></p>
        </Dragger>

        <Button type="primary" htmlType="submit" className="save-button" block>
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default Class;
