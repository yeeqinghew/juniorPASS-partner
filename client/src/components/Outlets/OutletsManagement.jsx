import { useContext, useState, useEffect } from "react";
import {
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Table,
  Space,
  List,
  Card,
  Popconfirm,
  Row,
  Col,
  Tag,
} from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { fetchWithAuth } from "../../utils/api";
import UserContext from "../UserContext";
import OutletForm from "./OutletForm";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const OutletsManagement = () => {
  const { user } = useContext(UserContext);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  useEffect(() => {
    fetchOutlets();
  }, [user]);

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `/outlets/partner/${user?.partner_id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setOutlets(data);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOutlet(null);
  };

  const handleSaveSuccess = () => {
    toast.success(
      `Outlet ${editingOutlet ? "updated" : "created"} successfully!`,
    );
    setIsModalOpen(false);
    setEditingOutlet(null);
    fetchOutlets();
  };

  return (
    <div className="outlets-management">
      <div className="outlets-header">
        <div>
          <Title level={2}>My Outlets</Title>
          <Text type="secondary">Manage your outlets and their details</Text>
        </div>
        <Button size="large" icon={<PlusOutlined />} onClick={handleCreate}>
          Add outlet
        </Button>
      </div>

      <List
        loading={loading}
        dataSource={outlets}
        locale={{ emptyText: "No outlets found." }}
        renderItem={(outlet) => (
          <Card
            className="outlet-card"
            hoverable
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(outlet)}
              >
                Edit
              </Button>,
            ]}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div>
                    <Title level={4}> {outlet.outlet_name} </Title>
                    {outlet?.description && (
                      <Text type="secondary"> {outlet.description} </Text>
                    )}
                  </div>

                  <Space wrap>
                    <Tag icon={<EnvironmentOutlined />} color="blue">
                      {outlet?.nearest_mrt} MRT
                    </Tag>
                    <Tag icon={<ShopOutlined />} color="green">
                      {outlet.listing_count} Listings
                    </Tag>
                    {outlet?.phone_number && (
                      <Tag icon={<ShopOutlined />} color="volcano">
                        {outlet.phone_number}
                      </Tag>
                    )}
                  </Space>

                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {JSON.parse(outlet?.address)?.ADDRESS}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        )}
      />

      <Modal
        title={editingOutlet ? "Edit Outlet" : "Add Outlet"}
        open={isModalOpen}
        footer={null}
        width={700}
        destroyOnClose
      >
        <OutletForm
          outlet={editingOutlet}
          onSuccess={handleSaveSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default OutletsManagement;
