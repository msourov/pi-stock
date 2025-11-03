import { useEffect, useState } from "react";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Table,
  Group,
  Stack,
  Title,
  Loader,
  Textarea,
  Notification,
  Modal,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Text,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconCheck,
  IconX,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react";
import type { CreateStockPayload, Stock } from "./type";
import { useAuth } from "../../AuthProvider";

const Stock = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [productOptions, setProductOptions] =
    useState<{ uid: string; name: string }[]>();
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { logout } = useAuth();

  const [branches] = useState([
    { value: "73745874-e70b-498f-afd1-465464934f5b", label: "Main Branch" },
    { value: "branch-2", label: "Downtown Branch" },
    { value: "branch-3", label: "West Side Branch" },
  ]);
  const companyId = "61651c07-0fe1-4cb7-9d03-b918a613a5c9";
  const token = localStorage.getItem("token");
  const form = useForm<CreateStockPayload>({
    initialValues: {
      company_id: companyId,
      branch_id: "",
      product_id: "",
      movement_type: "opening",
      quantity: 0,
      reference: "",
      description: "",
    },
    validate: {
      branch_id: (v) => (!v ? "Branch is required" : null),
      product_id: (v) => (!v ? "Product ID is required" : null),
      quantity: (v) => (v <= 0 ? "Quantity must be greater than 0" : null),
    },
  });

  const fetchStocks = async () => {
    setLoadingTable(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stock/all-full`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStocks(data?.data);
        setFilteredStocks(data?.data);
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Fetch failed with status:", res.status);
        setStocks([]);
        setFilteredStocks([]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks([]);
      setFilteredStocks([]);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchProductionOptions = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/product/product-helper-sam`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProductOptions(data?.data);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProductionOptions();
  }, [opened]);

  console.log(productOptions);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = stocks.filter(
        (stock) =>
          stock.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.movement_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          stock.movement_status
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchTerm, stocks]);

  const handleSubmit = async (values: CreateStockPayload) => {
    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stock/create`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(values),
        }
      );

      if (res.ok) {
        setNotif({ type: "success", message: "Stock created successfully!" });
        form.reset();
        close();
        fetchStocks();
      } else if (res.status === 401) {
        logout();
      } else {
        const err = await res.text();
        setNotif({ type: "error", message: err || "Failed to create stock" });
      }
    } catch {
      setNotif({ type: "error", message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "approved":
  //       return "green";
  //     case "pending":
  //       return "yellow";
  //     case "rejected":
  //       return "red";
  //     default:
  //       return "gray";
  //   }
  // };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "opening":
        return "blue";
      case "in":
        return "green";
      case "out":
        return "orange";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Stack p="md" gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={4} fw={500} c="blue">
            Stock Management
          </Title>
          <Text c="dimmed" size="sm">
            Manage your inventory and stock movements
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={open}
          size="sm"
          radius="md"
        >
          Add Stock
        </Button>
      </Group>

      {notif && (
        <Notification
          icon={notif.type === "success" ? <IconCheck /> : <IconX />}
          color={notif.type === "success" ? "teal" : "red"}
          onClose={() => setNotif(null)}
          title={notif.type === "success" ? "Success" : "Error"}
          withBorder
        >
          {notif.message}
        </Notification>
      )}

      {/* Stats Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fz="sm" c="dimmed" fw={500}>
              Total Products
            </Text>
            <Text fz="xl" fw={700}>
              {new Set(stocks.map((s) => s.product_id)).size}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fz="sm" c="dimmed" fw={500}>
              Total Stock Value
            </Text>
            <Text fz="xl" fw={700}>
              {formatCurrency(
                stocks.reduce(
                  (sum, stock) => sum + stock.price * stock.quantity,
                  0
                )
              )}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fz="sm" c="dimmed" fw={500}>
              Pending Movements
            </Text>
            <Text fz="xl" fw={700}>
              {stocks.filter((s) => s.movement_status === "pending").length}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fz="sm" c="dimmed" fw={500}>
              Total Records
            </Text>
            <Text fz="xl" fw={700}>
              {stocks.length}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Table Section */}
      <Card withBorder shadow="sm" radius="md">
        <Group justify="end" mb="md">
          <Group>
            <TextInput
              placeholder="Search references, types..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchStocks}
              loading={loadingTable}
              size="sm"
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {loadingTable ? (
          <Box py="xl" ta="center">
            <Loader size="lg" />
            <Text mt="md">Loading stock data...</Text>
          </Box>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Type</Table.Th>
                {/* <Table.Th>Status</Table.Th> */}
                <Table.Th>Reference</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStocks.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} py="xl" ta="center">
                    <Box>
                      <IconSearch size={48} color="gray" />
                      <Text mt="sm" c="dimmed">
                        {searchTerm
                          ? "No matching records found"
                          : "No stock data available"}
                      </Text>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredStocks.map((s) => (
                  <Table.Tr key={s.uid}>
                    <Table.Td>
                      <Text fw={500}>{s.product_name}</Text>
                      {s.description && (
                        <Text fz="xs" c="dimmed" lineClamp={1}>
                          {s.description}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={s.quantity > 0 ? "blue" : "red"}
                      >
                        {s.quantity}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatCurrency(s.price)}</Table.Td>
                    <Table.Td>
                      <Badge color={getTypeColor(s.movement_type)}>
                        {s.movement_type}
                      </Badge>
                    </Table.Td>
                    {/* <Table.Td>
                      <Badge
                        color={getStatusColor(s.movement_status || "pending")}
                      >
                        {s.movement_status || "pending"}
                      </Badge>
                    </Table.Td> */}
                    <Table.Td>
                      <Text size="sm">{s.reference || "-"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue" size="sm">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" size="sm">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Create Stock Modal */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="xl"
        padding="xl"
        title={
          <Title order={4} c="gray">
            Add New Stock
          </Title>
        }
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={12}>
              <Select
                label="Branch"
                placeholder="Select branch"
                data={branches}
                {...form.getInputProps("branch_id")}
                withAsterisk
              />
            </Grid.Col>

            {/* Product ID */}
            <Grid.Col span={12}>
              <Select
                label="Product"
                placeholder="Select a product"
                data={
                  productOptions?.map((p: { uid: string; name: string }) => ({
                    value: p.uid,
                    label: p.name,
                  })) || []
                }
                {...form.getInputProps("product_id")}
                withAsterisk
                searchable
                clearable
                nothingFoundMessage="No products found"
              />
            </Grid.Col>

            {/* Movement Type */}
            <Grid.Col span={12}>
              <Select
                label="Movement Type"
                data={[
                  { value: "opening", label: "Opening Stock" },
                  { value: "in", label: "Stock In" },
                  { value: "out", label: "Stock Out" },
                ]}
                {...form.getInputProps("movement_type")}
                withAsterisk
              />
            </Grid.Col>

            {/* Quantity */}
            <Grid.Col span={12}>
              <NumberInput
                label="Quantity"
                min={0}
                {...form.getInputProps("quantity")}
                withAsterisk
              />
            </Grid.Col>

            {/* Reference - optional */}
            <Grid.Col span={12}>
              <TextInput
                label="Reference"
                placeholder="Enter reference"
                {...form.getInputProps("reference")}
              />
            </Grid.Col>

            {/* Description - optional */}
            <Grid.Col span={12}>
              <Textarea
                label="Description"
                placeholder="Enter description"
                rows={3}
                {...form.getInputProps("description")}
              />
            </Grid.Col>
          </Grid>

          <Group ta="right" mt="md">
            <Button type="submit">Create Stock</Button>
          </Group>
        </form>
      </Modal>
    </Stack>
  );
};

export default Stock;
