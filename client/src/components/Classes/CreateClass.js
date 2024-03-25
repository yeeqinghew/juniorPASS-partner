import {
  EyeInvisibleOutlined,
  InboxOutlined,
  LockOutlined,
  MailOutlined,
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
} from "antd";
import CustomInput from "../../utils/Input";
import { useEffect, useState } from "react";
import mrt from "../../data/mrt.json";
import toast from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import SearchInput from "../../utils/SearchInput";

const { Title, Link } = Typography;
const { Dragger } = Upload;

const CreateClass = () => {
  const mrtStations = [];
  const [list, setList] = useState([]);
  const [addressValue, setAddressValue] = useState();
  console.log("addressValue", addressValue);

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
    console.log(parseRes);
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

  const handleCreateClass = (values) => {};

  useEffect(() => {
    getMRTLocations();
    mrt.forEach((location, index) => {
      // TODO: to filter out all the duplicate
      mrtStations.push({
        value: location["Station Name"],
        label: location["Station Name"],
      });
    });
  }, []);

  return (
    <>
      <Title level={3}>Create Class</Title>
      <Form
        name="create-class"
        initialValues={{}}
        style={{
          maxWidth: "300px",
        }}
        onFinish={handleCreateClass}
      >
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: "Please input your title",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Title"
            type={"title"}
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
            type="category"
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
            addressValue={addressValue}
            setAddressValue={setAddressValue}
            style={{
              width: 300,
            }}
          />
        </Form.Item>

        <Form.Item
          name="latitude"
          rules={[
            {
              required: true,
              message: "Please input your latitude",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="latitude"
            placeholder="Latitude"
            size={"large"}
            required
          />
        </Form.Item>
        <Form.Item
          name="longitude"
          rules={[
            {
              required: true,
              message: "Please input your longitude",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="longitude"
            placeholder="Longitude"
            size={"large"}
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
            showSearch
            placeholder="Region"
            options={mrtStations}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
          />
        </Form.Item>
        <CustomInput
          name={"price"}
          required={true}
          placeholder={"Price"}
          prefixIcon={<EyeInvisibleOutlined />}
        />
        <CustomInput
          name={"ageGroup"}
          required={true}
          placeholder={"Age Group"}
          prefixIcon={<EyeInvisibleOutlined />}
        />
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </Dragger>
        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Create
        </Button>
      </Form>
    </>
  );
};

export default CreateClass;
