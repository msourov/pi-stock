import { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Table,
  Group,
  Stack,
  Title,
  Loader,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Text,
  Box,
  Select,
  Tooltip,
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
  IconPackage,
  IconTrendingUp,
  IconClock,
  IconDatabase,
  IconDownload,
  IconFilter,
} from "@tabler/icons-react";
import type { CreateStockPayload, Stock } from "./type";
import { useAuth } from "../../AuthProvider";
import { notifications } from "@mantine/notifications";
import CreateStockModal from "./components/CreateStockModal";

const Stock = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [productOptions, setProductOptions] = useState<
    { uid: string; name: string }[]
  >([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const { logout } = useAuth();

  const [branches] = useState([
    { value: "73745874-e70b-498f-afd1-465464934f5b", label: "Main Branch" },
    { value: "branch-2", label: "Downtown Branch" },
    { value: "branch-3", label: "West Side Branch" },
  ]);
  const user = JSON.parse(localStorage.getItem("user") || "");
  const companyId = user.company_id;
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

  const fetchStocksByProduct = async (productId: string, branchId?: string) => {
    setFilterLoading(true);
    try {
      let url = `${
        import.meta.env.VITE_API_BASE_URL
      }/stock/stock-by-product/${productId}?page=1&page_size=100`;

      if (branchId) {
        url += `&branch_id=${branchId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFilteredStocks(data?.data || []);
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Filter fetch failed:", res.status);
        setFilteredStocks([]);
      }
    } catch (error) {
      console.error("Error filtering stocks:", error);
      setFilteredStocks([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilter = () => {
    if (selectedProduct) {
      fetchStocksByProduct(selectedProduct, selectedBranch ?? undefined);
    } else {
      // If no product selected, show all stocks
      setFilteredStocks(stocks);
    }
  };

  const handleResetFilter = () => {
    setSelectedProduct(null);
    setSelectedBranch(null);
    setFilteredStocks(stocks);
  };

  const handleDownloadExcel = async () => {
    const queryParams = new URLSearchParams();
    if (companyId !== undefined && companyId !== null) {
      queryParams.append("company_id", String(companyId));
    }
    if (selectedProduct) {
      queryParams.append("product_id", selectedProduct);
    }
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/stock/all-full/export-excel?${queryParams}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `stock-report-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        notifications.show({
          title: "Success",
          message: "Excel report downloaded successfully",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to download Excel report",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to download Excel report",
        color: "red",
      });
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
  }, [searchTerm, stocks, selectedProduct]);

  const handleSubmit = async (values: CreateStockPayload) => {
    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stock/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(values),
        }
      );
      const result = await res.json();

      console.log(result, "result");

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result?.message || "Category created successfully!",
          icon: <IconCheck />,
          color: "teal",
        });

        form.reset();
        close();
        fetchStocks();
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to create category",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (err) {
      console.error("Create category error:", err);
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

  const statCards = [
    {
      label: "Total Products",
      value: new Set(stocks.map((s) => s.product_id)).size,
      color: "#4299e1",
      icon: <IconPackage size={20} color="#4299e1" />,
    },
    {
      label: "Total Stock Value",
      value:
        "$" +
        stocks
          .reduce((sum, s) => sum + s.price * s.quantity, 0)
          .toLocaleString(),
      color: "#48bb78",
      icon: <IconTrendingUp size={20} color="#48bb78" />,
    },
    {
      label: "Pending Movements",
      value: stocks.filter((s) => s.movement_status === "pending").length,
      color: "#ed8936",
      icon: <IconClock size={20} color="#ed8936" />,
    },
    {
      label: "Total Records",
      value: stocks.length,
      color: "#9f7aea",
      icon: <IconDatabase size={20} color="#9f7aea" />,
    },
  ];

  return (
    <Stack p="xs" gap="sm">
      {/* Header */}
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
        <Group justify="space-between">
          <div>
            <Title order={5} fw={600} c="indigo">
              Stock Management
            </Title>
            <Text c="dimmed" fz="xs" mt={2}>
              Manage your inventory and stock movements
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={open}
            size="xs"
            radius="sm"
            color="purple"
          >
            Add Stock
          </Button>
        </Group>
      </Card>
      {/* Stats */}
      <Grid gutter="sm">
        {statCards.map((stat) => (
          <Grid.Col key={stat.label} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card
              withBorder
              p="sm"
              radius="sm"
              style={{
                borderLeft: `3px solid ${stat.color}`,
                background: "white",
              }}
            >
              <Group gap={6} align="flex-start">
                <Box
                  p={6}
                  style={{
                    background: `${stat.color}20`,
                    borderRadius: 6,
                  }}
                >
                  {stat.icon}
                </Box>
                <div>
                  <Text fz="xs" c="dimmed" fw={500}>
                    {stat.label}
                  </Text>
                  <Text fz="lg" fw={700}>
                    {stat.value}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Filters */}
      <Card withBorder radius="md" p="sm" style={{ background: "white" }}>
        <Group gap="sm" align="flex-end">
          <Select
            label="Product"
            placeholder="Select product"
            data={productOptions.map((p) => ({ value: p.uid, label: p.name }))}
            value={selectedProduct}
            onChange={(value) => setSelectedProduct(value || "")}
            size="xs"
            style={{ minWidth: 150 }}
            clearable
          />
          <Select
            label="Branch"
            placeholder="All branches"
            data={branches}
            value={selectedBranch}
            onChange={(value) => setSelectedBranch(value || "")}
            size="xs"
            style={{ minWidth: 140 }}
            clearable
          />
          <Button
            size="xs"
            onClick={handleFilter}
            loading={filterLoading}
            leftSection={<IconFilter size={14} />}
          >
            Filter
          </Button>
          <Button
            size="xs"
            variant="light"
            onClick={handleResetFilter}
            leftSection={<IconX size={14} />}
            disabled={!selectedProduct && !selectedBranch}
          >
            Reset
          </Button>
          <Box style={{ flex: 1 }} />
          <Tooltip
            label="Please select a product."
            disabled={!!selectedProduct}
            withArrow
          >
            <div>
              <Button
                size="xs"
                variant="outline"
                onClick={handleDownloadExcel}
                leftSection={<IconDownload size={14} />}
                disabled={!selectedProduct}
              >
                Export Excel
              </Button>
            </div>
          </Tooltip>
          {/* <Button
            size="xs"
            variant="outline"
            onClick={handleDownloadExcel}
            leftSection={<IconDownload size={14} />}
          >
            Export Excel
          </Button> */}
        </Group>
      </Card>

      {/* Table */}
      <Card withBorder radius="md" style={{ background: "white" }}>
        <Group justify="space-between" mb="xs" px="xs" pb={4}>
          <Title order={5} c="dark.4">
            Stock Records {selectedProduct && "(Filtered)"}
          </Title>
          <Group>
            <TextInput
              placeholder="Search references, types..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="xs"
              style={{ width: 250 }}
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

        {loadingTable || filterLoading ? (
          <Box py="md" ta="center">
            <Loader size="sm" />
            <Text mt="xs" c="dimmed" fz="sm">
              {filterLoading ? "Filtering stocks..." : "Loading stock data..."}
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
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Reference</Table.Th>
                  <Table.Th ta="center">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {filteredStocks.length ? (
                  filteredStocks.map((s) => (
                    <Table.Tr key={s.uid}>
                      <Table.Td>
                        <Text fw={600} fz="sm">
                          {s.product_name}
                        </Text>
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
                      <Table.Td fw={500}>${s.price}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={getTypeColor(s.movement_type)}
                          variant="filled"
                        >
                          {s.movement_type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{s.reference || "-"}</Table.Td>
                      <Table.Td ta="center">
                        <Group gap={4} justify="center">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            radius="sm"
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            radius="sm"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6} py="lg" ta="center">
                      <Box>
                        <IconSearch size={36} color="gray" />
                        <Text c="dimmed" fz="sm" mt={4}>
                          {selectedProduct
                            ? "No stock records found for selected filter"
                            : searchTerm
                            ? "No matching records found"
                            : "No stock data available"}
                        </Text>
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Create Stock Modal */}
      <CreateStockModal
        opened={opened}
        close={close}
        branches={branches}
        form={form}
        productOptions={productOptions}
        handleSubmit={handleSubmit}
      />
    </Stack>
  );
};

export default Stock;
