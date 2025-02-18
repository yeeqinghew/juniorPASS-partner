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
  // Stores the selected outlet and its schedule
  const [outlets, setOutlets] = useState([]);

  // async function getMRTLocations() {
  //   const response = await fetch(
  //     "https://www.onemap.gov.sg/api/auth/post/getToken",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: process.env.REACT_APP_ONEMAPS_EMAIL,
  //         password: process.env.REACT_APP_ONEMAPS_PASSWORD,
  //       }),
  //     }
  //   );
  //   const parseRes = await response.json();
  //   // console.log(parseRes);
  // }

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
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
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
      // tranform the locations data
      const transformedLocations = values.locations.map((location) => ({
        address: JSON.parse(location.address),
        nearest_mrt: location.nearest_mrt,
        schedules: location.schedules.map((schedule) => ({
          day: schedule.day,
          timeslot: schedule.timeslot,
          frequency: schedule.frequency,
        })),
      }));

      const uploadedImageURLs = [];
      for (let img of images) {
        const response = await fetch(`${baseURL}/misc/s3url`);
        const { url } = await response.json();
        // post the image directly to S3 bucket
        const s3upload = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: img,
        });

        if (s3upload.status === 200) {
          const imageURL = url.split("?")[0];
          uploadedImageURLs.push(imageURL);
        }
      }

      // get the URL and store as image
      const response = await fetch(`${baseURL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          partner_id: user.partner_id,
          images: JSON.stringify(uploadedImageURLs),
          locations: transformedLocations,
          short_term_start_date: values.short_term_start_date || null,
          long_term_start_date: values.long_term_start_date || null,
        }),
      });

      const parseRes = await response.json();
      if (response.status === 201) {
        createClassForm.resetFields();
        toast.success(parseRes.message);
        navigate("/classes");
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

        {/* Add another outlet button */}
        <Button
          type="dashed"
          icon={<PlusCircleOutlined />}
          onClick={(selectedOutlet) => {
            if (
              !outlets.some(
                (outlet) => outlet.outlet_id === selectedOutlet.outlet_id
              )
            ) {
              setOutlets([...outlets, selectedOutlet]);
            }
          }}
          style={{ marginBottom: "16px" }}
        >
          Add outlet
        </Button>

        {/* Render each outlet field dynamically */}
        {outlets.map((outlet, index) => (
          <Row key={outlet.outlet_id} gutter={[16, 16]}>
            <Col flex="1 0 25%">
              {/* Outlet selection */}
              <Form.Item
                name={[`outlet_${index}`, "outlet_id"]}
                label={`Outlet ${index + 1}`}
                rules={[{ required: true, message: "Please select an outlet" }]}
              >
                <Select placeholder="Select an outlet">
                  {outlets.map((outletOption) => (
                    <Select.Option
                      key={outletOption.outlet_id}
                      value={outletOption.outlet_id}
                    >
                      {outletOption.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Dynamic Schedules List */}
              <Form.Item label="Schedules">
                <Form.Item>
                  <Form.List
                    name={[`outlet_${index}`, "schedules"]}
                    initialValue={[{}]}
                    rules={[
                      {
                        validator: async (_, schedules) =>
                          !schedules || schedules.length <= 0
                            ? Promise.reject(new Error("Please pick dates"))
                            : Promise.resolve(),
                      },
                    ]}
                  >
                    {(fields, { remove }) => (
                      <div
                        style={{
                          border: "1px dotted #cccccc",
                          borderRadius: "5px",
                          padding: "12px",
                        }}
                      >
                        {fields.map((field) => (
                          <Row key={field.key} gutter={[16, 8]} align="middle">
                            <Col span={20}>
                              <ScheduleItem
                                key={fields.key}
                                field={fields}
                                remove={remove}
                              />
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )}
                  </Form.List>
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>
        ))}

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
