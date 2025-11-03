import { useEffect, useState } from "react";
import {
  TextInput,
  Select,
  Button,
  Table,
  Group,
  Stack,
  Title,
  Loader,
  Textarea,
  Modal,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Text,
  Box,
  MultiSelect,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconRefresh,
  IconCheck,
  IconX,
  IconPackage,
  IconCategory,
  IconBuilding,
  IconTag,
} from "@tabler/icons-react";
import { CreateProductPayload, Product } from "./type";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../AuthProvider";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const { logout } = useAuth();

  const [branches] = useState([
    { value: "73745874-e70b-498f-afd1-465464934f5b", label: "Main Branch" },
    { value: "branch-2", label: "Downtown Branch" },
    { value: "branch-3", label: "West Side Branch" },
  ]);

  const companyId = "61651c07-0fe1-4cb7-9d03-b918a613a5c9";

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      name: "",
      company_id: companyId,
      base_uom: "",
      branch_id: [] as string[],
      description: "",
      actual_cost: 0,
      selling_price: 0,
    },
    validate: {
      name: (v) => (!v ? "Product name is required" : null),
      company_id: (v) => (!v ? "Company ID is required" : null),
      base_uom: (v) => (!v ? "Base UOM is required" : null),
      branch_id: (v) =>
        v.length === 0 ? "At least one branch is required" : null,
      actual_cost: (v) =>
        v <= 0 ? "Actual cost must be greater than 0" : null,
      selling_price: (v) =>
        v <= 0 ? "Selling price must be greater than 0" : null,
      description: (v) => (!v ? "Description is required" : null),
    },
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoadingTable(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/product/all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
        setFilteredProducts(data.data || []);
      } else if (res.status === 401) {
        logout();
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.serial_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleSubmit = async (values: CreateProductPayload) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("company_id", values.company_id);
      formData.append("base_uom", values.base_uom);
      formData.append("description", values.description || "");
      formData.append("actual_cost", String(values.actual_cost));
      formData.append("selling_price", String(values.selling_price));

      values.branch_id.forEach((id: string) => {
        formData.append("branch_id[]", id);
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/product/create`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );
      const result = await res.json();
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result?.message || "Product created successfully!",
          icon: <IconCheck />,
          color: "teal",
        });
        form.reset();
        close();
        fetchProducts();
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to create Product",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Something went wrong!",
        message: "Please check your connection",
        icon: <IconX />,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // const handleDelete = async (productId: string) => {
  //   if (!confirm("Are you sure you want to delete this product?")) return;

  //   try {
  //     const res = await fetch(`/margaret/product/delete/${productId}`, {
  //       method: "DELETE",
  //     });

  //     if (res.ok) {
  //       setNotif({ type: "success", message: "Product deleted successfully!" });
  //       fetchProducts();
  //     } else {
  //       setNotif({ type: "error", message: "Failed to delete product" });
  //     }
  //   } catch {
  //     setNotif({ type: "error", message: "Network error" });
  //   }
  // };

  return (
    <Stack p="xs" gap="sm">
      {/* Header Section */}
      <Card
        withBorder
        shadow="xs"
        radius="md"
        p="sm"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Title order={5} fw={600} c="indigo">
              Product Management
            </Title>
            <Text c="dimmed" fz="xs" mt={2}>
              Manage your product catalog and inventory
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={open}
            size="xs"
            radius="sm"
            color="purple"
          >
            Add Product
          </Button>
        </Group>
      </Card>

      {/* Stats Cards */}
      <Grid gutter="sm">
        {[
          {
            color: "#4299e1",
            label: "Total Products",
            value: products.length,
            icon: <IconPackage size={16} color="#4299e1" />,
          },
          {
            color: "#48bb78",
            label: "Categories",
            value: new Set(products.map((p) => p.category).filter(Boolean))
              .size,
            icon: <IconCategory size={16} color="#48bb78" />,
          },
          {
            color: "#ed8936",
            label: "Departments",
            value: new Set(products.map((p) => p.department).filter(Boolean))
              .size,
            icon: <IconBuilding size={16} color="#ed8936" />,
          },
          {
            color: "#9f7aea",
            label: "Brands",
            value: new Set(products.map((p) => p.brand_name).filter(Boolean))
              .size,
            icon: <IconTag size={16} color="#9f7aea" />,
          },
        ].map(({ color, label, value, icon }, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card
              withBorder
              p="sm"
              radius="sm"
              style={{
                borderLeft: `3px solid ${color}`,
                background: "white",
              }}
            >
              <Group gap={6} align="flex-start">
                <Box
                  p={6}
                  style={{
                    background: `${color}1A`, // translucent background
                    borderRadius: 6,
                  }}
                >
                  {icon}
                </Box>
                <div style={{ flex: 1 }}>
                  <Text fz="xs" c="dimmed" fw={500}>
                    {label}
                  </Text>
                  <Text fz="lg" fw={700} c="dark.4">
                    {value}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Table Section */}
      <Card withBorder radius="md" style={{ background: "white" }}>
        <Group justify="space-between" mb="xs" px="xs" pb={4}>
          <Title order={5} c="dark.4">
            Product Catalog
          </Title>
          <Group>
            <TextInput
              placeholder="Search products..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ width: 250 }}
            />
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchProducts}
              disabled={loadingTable}
              size="xs"
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {loadingTable ? (
          <Box py="md" ta="center">
            <Loader size="sm" />
            <Text mt="xs" c="dimmed" fz="sm">
              Loading products...
            </Text>
          </Box>
        ) : (
          <Box px="xs" pb="xs">
            <Table
              striped
              highlightOnHover
              withTableBorder
              verticalSpacing="xs"
              horizontalSpacing="sm"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product Name</Table.Th>
                  <Table.Th>Serial No.</Table.Th>
                  <Table.Th>Barcode</Table.Th>
                  <Table.Th>Brand</Table.Th>
                  <Table.Th>Department</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>UOM</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredProducts.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={9} py="lg" ta="center">
                      <Box>
                        <IconSearch size={36} color="gray" />
                        <Text mt={4} c="dimmed" fz="sm">
                          {searchTerm
                            ? "No matching products found"
                            : "No products available"}
                        </Text>
                        {!searchTerm && (
                          <Text c="dimmed" fz="xs" mt={2}>
                            Get started by adding your first product
                          </Text>
                        )}
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredProducts.map((product) => (
                    <Table.Tr key={product.uid}>
                      <Table.Td>
                        <Text fw={600} fz="sm">
                          {product.name}
                        </Text>
                        {product.description && (
                          <Text fz="xs" c="dimmed" lineClamp={1}>
                            {product.description}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue" size="sm">
                          {product.serial_number}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {product?.barcode || "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>{product.brand_name || "-"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{product.department || "-"}</Text>
                      </Table.Td>
                      <Table.Td>
                        {product.category ? (
                          <Badge variant="light" color="green">
                            {product.category}
                          </Badge>
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500} fz="sm">
                          <span className="font-bold text-lg">৳</span>
                          {product.selling_price}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" color="gray" size="sm">
                          {product.base_uom ?? product.purchase_uom ?? "-"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            style={{ borderRadius: 6 }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            style={{ borderRadius: 6 }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Create Product Modal */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="xl"
        padding="xl"
        title={
          <Title order={4} c="gray">
            Add New Product
          </Title>
        }
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Product Name"
                  placeholder="Enter product name"
                  withAsterisk
                  {...form.getInputProps("name")}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Base UOM"
                  placeholder="Select base unit"
                  withAsterisk
                  data={["l", "kg", "pcs", "g", "ml", "m", "cm", "mm"]}
                  {...form.getInputProps("base_uom")}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <MultiSelect
                  label="Branches"
                  placeholder="Select branches"
                  withAsterisk
                  data={branches}
                  {...form.getInputProps("branch_id")}
                  searchable
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Actual Cost"
                  placeholder="Enter actual cost"
                  withAsterisk
                  min={0}
                  {...form.getInputProps("actual_cost")}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Selling Price"
                  placeholder="Enter selling price"
                  withAsterisk
                  min={0}
                  {...form.getInputProps("selling_price")}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter product description"
                  withAsterisk
                  rows={3}
                  {...form.getInputProps("description")}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={close} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.isValid() || submitting}
                loading={submitting}
                leftSection={<IconPlus size={18} />}
              >
                Create Product
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default Products;
