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
  Tag,
  TimePicker,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getBaseURL from "../../utils/config";
import useFormInitialization from "../../hooks/useFormInitialization";
import UserContext from "../UserContext";
import TimeRangePicker from "../../utils/TimeRangePicker";
import _ from "lodash";

const { Title } = Typography;
const Class = () => {
  const baseURL = getBaseURL();
  const { user } = useContext(UserContext);
  const token = user && user?.token;
  const { listing_id } = useParams();
  const [listing, setListing] = useState();
  const [ageGroup, setAgeGroup] = useState();
  const [categories, setCategories] = useState();
  const [packageTypes, setPackageTypes] = useState();
  const [editClassForm] = Form.useForm();
  const [data, setData] = useState([]);

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

  const handleAddressSearch = _.debounce(async (value) => {
    if (value) {
      const response = await fetch(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${value}&returnGeom=Y&getAddrDetails=Y&pageNum=`
      );
      const parseRes = await response.json();
      setData(parseRes.results);
    }
  }, 300); // function will execute only after the user has stopped typing for 300ms

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
          name="category"
          rules={[{ required: true, message: "Please select your categories" }]}
        >
          <Select
            placeholder="Select category"
            mode="multiple"
            value={listing?.categories}
          >
            {categories &&
              categories.map((category) => (
                <Select.Option key={category.id} value={category.name}>
                  {category.name}
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
                                        options={(data || []).map((d) => ({
                                          value: JSON.stringify(d),
                                          label: d.ADDRESS,
                                        }))}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Space.Compact>
                              </Row>
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
            // onChange={handleSelectAgeGroups}
            value={listing?.age_groups}
          >
            {ageGroup &&
              ageGroup.map((age) => (
                <Select.Option key={age.id} value={age.name}>
                  {age.max_age !== null
                    ? `${age.min_age} to ${age.max_age} years old: ${age.name}`
                    : `${age.name} years old`}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Create
        </Button>
      </Form>
    </>
  );
};

export default Class;
