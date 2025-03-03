import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getBaseURL from "../../utils/config";
import useFormInitialization from "../../hooks/useFormInitialization";
import UserContext from "../UserContext";
import _ from "lodash";
import useMRTStations from "../../hooks/useMrtStations";
import useAddressSearch from "../../hooks/useAddressSearch";
import ScheduleItem from "../../utils/ScheduleItem";
import { DataContext } from "../../hooks/DataContext";

const { Title } = Typography;
const Class = () => {
  const baseURL = getBaseURL();
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const { listing_id } = useParams();
  const [listing, setListing] = useState();
  const [editClassForm] = Form.useForm();
  const { mrtStations, renderTags } = useMRTStations();
  const { addressData, handleAddressSearch } = useAddressSearch();
  const [outlets, setOutlets] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);

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

  return (
    <>
      <Title level={3}>{listing?.listing_title}</Title>
      <Form
        name="edit-class"
        style={{
          maxWidth: "100%",
        }}
        form={editClassForm}
        autoComplete="off"
        onFinish={handleEditClass}
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
          <Input size={"large"} required />
        </Form.Item>
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
            min={1}
            max={10}
            style={{ width: "100%" }}
            prefix={
              <Avatar
                src={
                  <img
                    src={require("../../images/credit.png")}
                    alt="credit"
                    style={{
                      height: 24,
                      width: 24,
                    }}
                  />
                }
              ></Avatar>
            }
          />
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
            // onChange={handleSelectPackage}
            mode="multiple"
            value={listing?.package_types}
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
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>

        {/* dynamic form for multiple outlets */}
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

        <Form.Item
          name="age_groups"
          rules={[
            {
              required: true,
              message: "Please select your age groups",
            },
          ]}
        >
          <Select mode="multiple" placeholder="Select age groups">
            {ageGroups.map((age) => (
              <Select.Option key={age.id} value={age.name}>
                {age.max_age !== null
                  ? `${age.min_age} to ${age.max_age} years old: ${age.name}`
                  : `${age.min_age}+ years old`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Save changes
        </Button>
      </Form>
    </>
  );
};

export default Class;
