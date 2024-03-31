import { InboxOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Upload,
} from "antd";
import { useContext, useEffect, useState } from "react";
import mrt from "../../data/mrt.json";
import toast from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import SearchInput from "../../utils/SearchInput";
import UserContext from "../UserContext";

const { Title } = Typography;
const { Dragger } = Upload;

const CreateClass = () => {
  const [list, setList] = useState([]);
  const [addressValue, setAddressValue] = useState();
  const [ageGroup, setAgeGroup] = useState();
  const [categories, setCategories] = useState();
  const [createClassForm] = Form.useForm();
  const { user } = useContext(UserContext);
  console.log("userusreur", user);

  async function getMRTLocations() {
    const response = await fetch(
      "https://www.onemap.gov.sg/api/auth/post/getToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: process.env.REACT_APP_ONEMAPS_EMAIL,
          password: process.env.REACT_APP_ONEMAPS_PASSWORD,
        }),
      }
    );
    const parseRes = await response.json();
    // console.log(parseRes);
  }

  async function getAgeGroups() {
    try {
      const response = await fetch(
        "http://localhost:5000/misc/getAllAgeGroups",
        {
          method: "GET",
        }
      );
      const parseRes = await response.json();
      setAgeGroup(parseRes);
      // console.log("parseRes", parseRes);
    } catch (error) {
      console.error("ERROR in fetching getAgeGroups()");
    }
  }

  async function getCategories() {
    const response = await fetch(
      "http://localhost:5000/misc/getAllCategories",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const parseRes = await response.json();
    // setCategories(parseRes.enum_range);
  }

  const props = {
    name: "file",
    multiple: true,
    fileList: list,
    accept: "images/*",
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        // TODO: push into array and save
        // console.log(info.file, info.fileList);
      }
      if (status === "done") {
        setList((prev) => [...prev, info]);
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const handleSelectAgeGroup = (values) => {
    console.log(values);
    createClassForm.setFieldValue("age_group", values);
  };

  const handleCreateClass = async (values) => {
    const response = await fetch(
      "http://localhost:5000/listing/createListing",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, partner_id: user.partner_id }),
      }
    );
    const parseRes = await response.json();
    console.log("pparese", parseRes);
  };

  useEffect(() => {
    getMRTLocations();
    getAgeGroups();
    getCategories();
  }, []);

  return (
    <>
      <Title level={3}>Create Class</Title>
      <Form
        name="create-class"
        style={{
          maxWidth: "300px",
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
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Title"
            size={"large"}
            required
          />
        </Form.Item>
        <Form.Item
          name="price"
          rules={[
            {
              required: true,
              message: "Please input your price",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={10}
            defaultValue={1}
            style={{ width: "300px" }}
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
          name="category"
          rules={[
            {
              required: true,
              message: "Please input your category",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Category"
            size={"large"}
            required
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
            maxLength={100}
            placeholder="Description"
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>
        <Form.Item
          name="address"
          rules={[
            {
              required: true,
              message: "Please input your address",
            },
          ]}
        >
          <SearchInput
            placeholder="Address"
            value={addressValue}
            addressValue={addressValue}
            setAddressValue={setAddressValue}
            style={{
              width: 300,
            }}
            setFieldValue={createClassForm.setFieldValue}
            required
          />
        </Form.Item>

        {/* TODO: Remove duplicate of region */}
        <Form.Item
          name="region"
          rules={[
            {
              required: true,
              message: "Please input your region",
            },
          ]}
        >
          <Select
            placeholder="Region"
            filterOption={(input, option) =>
              (option["Station Name"] ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA["Station Name"] ?? "")
                .toLowerCase()
                .localeCompare((optionB["Station Name"] ?? "").toLowerCase())
            }
          >
            {/* TODO: search for mrt station */}
            {mrt && [
              ...new Set(
                mrt.map((station, index) => (
                  <Select.Option
                    key={index}
                    value={station["Station Name"]}
                  ></Select.Option>
                ))
              ),
            ]}
          </Select>
        </Form.Item>
        <Form.Item name={"age_group"}>
          <Select
            optionLabelProp="name"
            placeholder="Select age group"
            onSelect={handleSelectAgeGroup}
          >
            {ageGroup &&
              ageGroup.map((age, index) => (
                <Select.Option
                  key={age.id}
                  value={
                    age.max_age !== null
                      ? `${age.min_age} to ${age.max_age} years old: ${age.name}`
                      : `${age.name} years old`
                  }
                  label={age.name}
                ></Select.Option>
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
