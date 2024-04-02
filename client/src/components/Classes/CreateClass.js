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
  const [distinctMRT, setDistinctMRT] = useState();
  const { user } = useContext(UserContext);

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
    setCategories(parseRes);
  }

  const props = {
    name: "file",
    multiple: true,
    fileList: list,
    accept: "images/*",
    onChange(info) {
      console.log("onchange x 1");
      const { status } = info.file;
      // if (status !== "uploading") {
      //   console.log(info.file, info.fileList);
      // }
      if (status === "uploading") {
        setList((state) => [...state, info.file]);
        if (status === "error") {
          toast.error(`${info.file.name} file upload failed.`);
        } else {
          info.file.status = "done";
        }
      }
      if (status === "done") {
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    onRemove(e) {},
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      size: 3,
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  const handleSelectAgeGroup = (values) => {
    createClassForm.setFieldValue("age_group", values);
  };

  const handleSelectCategory = (values) => {
    createClassForm.setFieldValue("category", values);
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
    createClassForm.resetFields();
  };

  useEffect(() => {
    // clean mrt.json
    mrt && setDistinctMRT([...new Set(mrt.map((mrt) => mrt["Station Name"]))]);

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
          <Select placeholder="Select category" onSelect={handleSelectCategory}>
            {categories &&
              categories.map((category) => (
                <Select.Option
                  key={category.id}
                  value={category.name}
                ></Select.Option>
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
        <Form.Item
          name="region"
          rules={[
            {
              required: true,
              message: "Please input your region",
            },
          ]}
        >
          <Select showSearch placeholder="Region">
            {distinctMRT &&
              distinctMRT.map((index, mrt) => (
                <Select.Option
                  key={index}
                  value={mrt["Station Name"]}
                ></Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          name={"age_group"}
          rules={[
            {
              required: true,
              message: "Please input your category",
            },
          ]}
        >
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
