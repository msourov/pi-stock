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
  NumberInput,
  Pagination,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconX,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconRefresh,
  IconPackage,
  IconDownload,
  IconFilter,
  IconCash,
  IconCheck,
  IconArrowDown,
  IconArrowUp,
  IconCalendar,
  IconArrowDownCircle,
  IconArrowUpCircle,
} from "@tabler/icons-react";
import type { CreateStockPayload, ProductStatType, Stock } from "./type";
import { useAuth } from "../../AuthProvider";
import { notifications } from "@mantine/notifications";
import CreateStockModal from "./components/CreateStockModal";
import { DateInput } from "@mantine/dates";

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
  const [productStat, setProductStat] = useState<ProductStatType[] | null>([]);
  const [selectedMT, setSelectedMT] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [isSelling, setIsSelling] = useState(false);
  const { logout } = useAuth();

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    page_size: 10,
    total_results: 0,
    total_page: 0,
  });

  const handleAdd = () => {
    setIsSelling(false);
    open();
  };

  const handleSell = () => {
    setIsSelling(true);
    open();
  };

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

  useEffect(() => {
    if (isSelling) {
      form.setFieldValue("movement_type", "sale");
    }
  }, [isSelling]);

  const fetchStocks = async (page: number = 1, size: number = pageSize) => {
    setLoadingTable(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/stock/all-full?page=${page}&page_size=${size}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const stocksData = data?.data || [];
        setStocks(stocksData);
        setFilteredStocks(stocksData);
        setPaginationData({
          page: data?.page || 1,
          page_size: data?.page_size || size,
          total_results: data?.total_results || stocksData.length,
          total_page: data?.total_page,
        });
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Fetch failed with status:", res.status);
        setStocks([]);
        setFilteredStocks([]);
        setPaginationData((prev) => ({
          ...prev,
          total_results: 0,
          total_page: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks([]);
      setFilteredStocks([]);
      setPaginationData((prev) => ({
        ...prev,
        total_results: 0,
        total_page: 0,
      }));
    } finally {
      setLoadingTable(false);
    }
  };

  const getProductStat = async () => {
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/stock/stock-by-product/${
        selectedProduct || ""
      }`;
      if (selectedBranch) {
        url += `&branch_id=${selectedBranch}`;
      }
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProductStat(data?.data);
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Fetch failed with status:", res.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProductStat();
  }, [selectedProduct]);

  const s: ProductStatType | undefined = productStat?.[0];

  const stats = [
    {
      label: "Total Stock",
      value: s?.total_stock ?? 0,
      color: "#228be6",
      icon: <IconPackage size={16} color="#228be6" />,
    },
    {
      label: "Total Received",
      value: s?.total_receive_stock ?? 0,
      color: "#40c057",
      icon: <IconArrowDown size={16} color="#40c057" />,
    },
    {
      label: "Total Sent",
      value: s?.total_send_stock ?? 0,
      color: "#fa5252",
      icon: <IconArrowUp size={16} color="#fa5252" />,
    },
    {
      label: "Today’s Total Stock",
      value: s?.today_total_stock ?? 0,
      color: "#7950f2",
      icon: <IconCalendar size={16} color="#7950f2" />,
    },
    {
      label: "Today Received",
      value: s?.today_total_received ?? 0,
      color: "#0ca678",
      icon: <IconArrowDownCircle size={16} color="#0ca678" />,
    },
    {
      label: "Today Sent",
      value: s?.today_total_sent ?? 0,
      color: "#e03131",
      icon: <IconArrowUpCircle size={16} color="#e03131" />,
    },
  ];

  const filterProductStock = async (
    productId: string,
    branchId?: string,
    movementType?: string,
    page: number = 1,
    size: number = pageSize
  ) => {
    setFilterLoading(true);
    try {
      let url = `${
        import.meta.env.VITE_API_BASE_URL
      }/stock/all-full?page=${page}&page_size=${size}&product_id=${productId}`;

      if (branchId) {
        url += `&branch_id=${branchId}`;
      }

      if (movementType) {
        url += `&movement_type=${movementType}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const filteredData = data?.data || [];
        setFilteredStocks(filteredData);
        setPaginationData({
          page: data?.page || 1,
          page_size: data?.page_size || size,
          total_results: data?.total_results || filteredData.length,
          total_page: data?.total_page,
        });
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Filter fetch failed:", res.status);
        setFilteredStocks([]);
        setPaginationData((prev) => ({
          ...prev,
          total_results: 0,
          total_page: 0,
        }));
      }
    } catch (error) {
      console.error("Error filtering stocks:", error);
      setFilteredStocks([]);
      setPaginationData((prev) => ({
        ...prev,
        total_results: 0,
        total_page: 0,
      }));
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilter = (page: number = 1, size: number = pageSize) => {
    if (selectedProduct) {
      filterProductStock(
        selectedProduct,
        selectedBranch ?? undefined,
        selectedMT ?? undefined,
        page,
        size
      );
    } else {
      // If no product selected, show all stocks
      // setFilteredStocks(stocks);
      fetchStocks(page, size);
    }
  };

  const handleResetFilter = () => {
    setSelectedProduct(null);
    setSelectedBranch(null);
    setSelectedMT(null);
    setProductStat(null);
    setFilteredStocks(stocks);
    fetchStocks(1, pageSize);
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    handleFilter(page, pageSize);
  };

  const handlePageSizeChange = (value: string | number) => {
    let newValue = Number(value);

    // Enforce minimum value of 5
    if (isNaN(newValue) || newValue < 5) newValue = 5;
    if (newValue > 100) newValue = 100;
    const newSize = Number(value);
    setPageSize(newSize);
    handleFilter(1, newSize);
  };

  useEffect(() => {
    fetchStocks(1, pageSize);
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
          message: result?.detail || "Failed to create category",
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
          <div className="space-x-2">
            <Button
              leftSection={<IconCash size={18} />}
              onClick={handleSell}
              size="xs"
              radius="sm"
              color="teal"
            >
              Sell Product
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAdd}
              size="xs"
              radius="sm"
              color="purple"
            >
              Add Stock
            </Button>
          </div>
        </Group>
      </Card>

      {/* Filters */}
      <Card radius="md" p={0} pb={4} style={{ background: "white" }}>
        <Group gap="sm" align="flex-end">
          <Select
            label="Product"
            placeholder="Select product"
            data={productOptions.map((p) => ({ value: p.uid, label: p.name }))}
            value={selectedProduct}
            onChange={(value) => {
              const newValue = value || "";
              setSelectedProduct(newValue);

              if (!newValue) {
                setProductStat(null);
                setFilteredStocks(stocks);
              }
            }}
            size="xs"
            style={{ minWidth: 150 }}
            clearable
          />
          <Select
            label="Branch"
            placeholder="All branches"
            data={branches}
            value={selectedBranch}
            disabled={!selectedProduct}
            onChange={(value) => setSelectedBranch(value || "")}
            size="xs"
            style={{ minWidth: 140 }}
            clearable
          />
          <Select
            label="Movement Type"
            placeholder="Select Movement Type"
            data={[
              { value: "opening", label: "Opening Stock" },
              { value: "purchase", label: "Purchase" },
              { value: "sale", label: "Sale" },
            ]}
            value={selectedMT}
            disabled={!selectedProduct}
            onChange={(value) => setSelectedMT(value || "")}
            size="xs"
            style={{ minWidth: 140 }}
            clearable
          />
          {/* Start Date */}
          <DateInput
            label="Start Date"
            placeholder="Pick start date"
            value={startDate}
            onChange={setStartDate}
            size="xs"
          />

          {/* End Date */}
          <DateInput
            label="End Date"
            placeholder="Pick end date"
            value={endDate}
            onChange={setEndDate}
            size="xs"
          />
          <Button
            size="xs"
            onClick={() => handleFilter(1, pageSize)}
            loading={filterLoading}
            leftSection={<IconFilter size={14} />}
            disabled={!selectedProduct}
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
                disabled={!selectedProduct || !(startDate && endDate)}
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

      {/* Stats */}
      <Grid gutter="sm">
        {stats.map((stat) => (
          <Grid.Col
            key={stat.label}
            span={{
              base: 12,
              xs: 6,
              sm: 4,
              md: 4,
              lg: 3,
              xl: 2,
            }}
          >
            <Card
              withBorder
              p="sm"
              radius="sm"
              style={{
                borderLeft: `3px solid ${stat.color}`,
                background: "white",
                height: "100%",
              }}
            >
              <Group gap={6} align="flex-start" wrap="nowrap">
                <Box
                  p={6}
                  style={{
                    background: `${stat.color}20`,
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {" "}
                  <Text fz="xs" c="dimmed" fw={500} lineClamp={1}>
                    {stat.label}
                  </Text>
                  <Text fz="lg" fw={700} lineClamp={1}>
                    {stat.value}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
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
              onClick={() => fetchStocks(1, pageSize)}
              loading={loadingTable}
              size="xs"
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
                  <Table.Th>Cost</Table.Th>
                  <Table.Th>Selling Price(SP)</Table.Th>
                  <Table.Th>Total Cost</Table.Th>
                  <Table.Th>Total SP</Table.Th>
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
                      <Table.Td fw={500}>
                        <span className="font-bold text-lg mr-1">৳</span>
                        {s.product_actual_cost}
                      </Table.Td>
                      <Table.Td fw={500}>
                        <span className="font-bold text-lg mr-1">৳</span>
                        {s.product_selling_price}
                      </Table.Td>
                      <Table.Td fw={500}>
                        <span className="font-bold text-lg mr-1">৳</span>
                        {s.quantity * parseInt(s.product_actual_cost)}
                      </Table.Td>
                      <Table.Td fw={500}>
                        <span className="font-bold text-lg mr-1">৳</span>
                        {s.quantity * parseInt(s.product_selling_price)}
                      </Table.Td>
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

            {/* Pagination */}
            {filteredStocks.length > 0 && (
              <div className="px-4 pt-4 pb-2 float-right">
                <Group gap="sm" align="center">
                  <Text fz="xs" c="dimmed">
                    Rows per page:
                  </Text>
                  <NumberInput
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    min={5}
                    max={100}
                    size="xs"
                    style={{ width: 60 }}
                  />
                  <Text fz="xs" c="dimmed">
                    {(paginationData.page - 1) * paginationData.page_size + 1}-
                    {Math.min(
                      paginationData.page * paginationData.page_size,
                      paginationData.total_results
                    )}{" "}
                    of {paginationData.total_results}
                  </Text>
                  <Pagination
                    total={
                      paginationData.total_page > 0
                        ? paginationData.total_page
                        : 1
                    }
                    value={paginationData.page}
                    onChange={handlePageChange}
                    color="blue"
                    size="sm"
                    disabled={loadingTable || filterLoading}
                  />
                </Group>
              </div>
            )}
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
        isSelling={isSelling}
      />
    </Stack>
  );
};

export default Stock;
