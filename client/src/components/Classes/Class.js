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
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getBaseURL from "../../utils/config";

const { Title } = Typography;
const Class = () => {
  const baseURL = getBaseURL();
  const { state } = useLocation();
  const { list } = state;
  const [ageGroup, setAgeGroup] = useState();
  const [categories, setCategories] = useState();
  const [packageTypes, setPackageTypes] = useState();
  const [editClassForm] = Form.useForm();

  async function getAgeGroups() {
    try {
      const response = await fetch(`${baseURL}/misc/getAllAgeGroups`, {
        method: "GET",
      });
      const parseRes = await response.json();
      setAgeGroup(parseRes);
    } catch (error) {
      console.error("ERROR in fetching getAgeGroups()");
    }
  }

  async function getCategories() {
    const response = await fetch(`${baseURL}/misc/getAllCategories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const parseRes = await response.json();
    setCategories(parseRes);
  }

  async function getPackageTypes() {
    const response = await fetch(`${baseURL}/misc/getAllPackages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const parseRes = await response.json();
    setPackageTypes(parseRes);
  }

  const handleEditClass = () => {};

  useEffect(() => {
    getAgeGroups();
    getCategories();
    getPackageTypes();
  }, []);

  useEffect(() => {
    console.log("list: ", list);
    editClassForm.setFieldsValue({
      // Set initial values of the form fields

      title: list?.listing_title,
      credit: list?.credit,
      description: list?.description,
      package_types: list?.package_types,
      category: list?.categories,
      age_groups: list?.age_groups,
    });
  }, [editClassForm, list]);

  return (
    <>
      <Title level={3}>{list.listing_title}</Title>
      <Form
        name="create-class"
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
            value={list?.package_types}
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
            value={list?.categories}
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
            placeholder="Description"
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
            value={list?.age_groups}
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
