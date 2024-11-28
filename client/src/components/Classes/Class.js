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
        <Form.Item>
          <Form.List
            name="locations"
            rules={[
              {
                validator: async (_, locations) => {
                  if (!locations || locations.length <= 0) {
                    return Promise.reject(new Error("Please pick location"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div
                style={{
                  border: "1px dotted #cccccc",
                  borderRadius: "5px",
                  margin: "12px 0",
                  padding: "12px ",
                }}
              >
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusCircleOutlined />}
                  >
                    Add location(s)
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>

                <Col>
                  <Row gutter={16}>
                    <Col span={1}>
                      <div>Index</div>
                    </Col>
                    <Col span={13}>
                      <div>Location(s)</div>
                    </Col>
                    <Col span={6}>
                      <div>Schedule(s)</div>
                    </Col>
                  </Row>

                  {fields.map((field, index) => {
                    return (
                      <Row key={`location-${field.key}`}>
                        <Col flex={"1 0 50%"} key={`location-${field.key}`}>
                          <Row
                            key={`location-${field.key}`}
                            style={{
                              marginBottom: 8,
                              border: "1px dotted #cccccc",
                              padding: "8px",
                            }}
                          >
                            <Col span={1}>{index}</Col>
                            <Col span={13} flex="1 0 50%">
                              <Row>
                                <Space.Compact block>
                                  <Col flex="1 0 50%">
                                    <Form.Item
                                      name={[field.name, "address"]}
                                      fieldId={[field.fieldId, "address"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Please input your address",
                                        },
                                      ]}
                                    >
                                      <Select
                                        {...field}
                                        showSearch
                                        placeholder={"Address"}
                                        filterOption={false}
                                        onSearch={handleAddressSearch}
                                        notFoundContent={null}
                                        options={(addressData || []).map(
                                          (d) => ({
                                            value: JSON.stringify(d),
                                            label: d.ADDRESS,
                                          })
                                        )}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col flex="1 0 50%">
                                    <Form.Item
                                      name={[field.name, "nearest_mrt"]}
                                      fieldId={[field.fieldId, "nearest_mrt"]}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            "Please input the nearest MRT/LRT",
                                        },
                                      ]}
                                    >
                                      <Select
                                        showSearch
                                        placeholder="Nearest MRT/LRT"
                                      >
                                        {!_.isEmpty(mrtStations) &&
                                          Object.keys(mrtStations).map(
                                            (key, index) => {
                                              return (
                                                <Select.Option
                                                  key={index}
                                                  value={key}
                                                  label={key}
                                                >
                                                  {renderTags(mrtStations[key])}
                                                  {key}
                                                </Select.Option>
                                              );
                                            }
                                          )}
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                </Space.Compact>
                              </Row>
                            </Col>

                            {/* dynamic form for multiple schedules */}
                            <Col flex="1 0 25%">
                              <Form.Item>
                                <Form.List
                                  name={[field.name, "schedules"]}
                                  rules={[
                                    {
                                      validator: async (_, schedules) => {
                                        if (
                                          !schedules ||
                                          schedules.length <= 0
                                        ) {
                                          return Promise.reject(
                                            new Error("Please pick dates")
                                          );
                                        }
                                      },
                                    },
                                  ]}
                                >
                                  {(times, { add, remove }, { errors }) => (
                                    <div
                                      style={{
                                        border: "1px dotted #cccccc",
                                        borderRadius: "5px",
                                        padding: "12px",
                                      }}
                                    >
                                      {times.map((time) => (
                                        <ScheduleItem
                                          key={time.key}
                                          field={time}
                                          remove={remove}
                                        />
                                      ))}
                                      <Form.Item>
                                        <Button
                                          type="dashed"
                                          onClick={() => {
                                            add();
                                          }}
                                          icon={<PlusCircleOutlined />}
                                        >
                                          Add schedule
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                      </Form.Item>
                                    </div>
                                  )}
                                </Form.List>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
              </div>
            )}
          </Form.List>
        </Form.Item>

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
