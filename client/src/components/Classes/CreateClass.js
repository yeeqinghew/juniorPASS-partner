import {
  InboxOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
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
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import UserContext from "../UserContext";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import getBaseURL from "../../utils/config";
import { DataContext } from "../../hooks/DataContext";
import useMRTStations from "../../hooks/useMrtStations";
import useAddressSearch from "../../hooks/useAddressSearch";
import ScheduleItem from "../../utils/ScheduleItem";

const { Title } = Typography;
const { Dragger } = Upload;

const CreateClass = () => {
  const baseURL = getBaseURL();
  const [images, setImages] = useState([]);
  const { packageTypes, ageGroups } = useContext(DataContext);
  const [createClassForm] = Form.useForm();
  const [selectedPackageTypes, setSelectedPackageTypes] = useState([]);
  const { addressData, handleAddressSearch } = useAddressSearch();
  const { user } = useContext(UserContext);
  const { mrtStations, renderTags } = useMRTStations();
  const token = user && user?.token;
  const navigate = useNavigate();

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
        navigate("/portal/classes");
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
          <Input placeholder="Title" size={"large"} required />
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

                  {fields.map((field, index) => (
                    <Row key={`location-${field.key}`}>
                      <Col flex="1 0 50%" key={`location-${field.key}`}>
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
                                      if (!schedules || schedules.length <= 0) {
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
                      <Col>
                        <Form.Item>
                          {fields.length > 1 ? (
                            <MinusCircleOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          ) : null}
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
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
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint"></p>
        </Dragger>
        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Create
        </Button>
      </Form>
    </>
  );
};

export default CreateClass;
