import { useState } from "react";
import {
  TextInput,
  Button,
  Table,
  Group,
  Stack,
  Card,
  Badge,
  Text,
  Box,
  Select,
  NumberInput,
  Pagination,
  Modal,
  Title,
  ActionIcon,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconX,
  IconSearch,
  IconFilter,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { Stock } from "./types";
import { useAuth } from "../../AuthProvider";
import { DateInput } from "@mantine/dates";
import { createStock, fetchStocks, updateStockStatus } from "./actions";
import { useStockPage } from "./hooks";
import { notifications } from "@mantine/notifications";

const Stock = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = user.company_id;
  const token = localStorage.getItem("token");
  const isAdmin = user.company_admin;
  const userBranchId = user.branch_id;

  const { logout } = useAuth();

  // Modal states
  const [approveModalOpened, setApproveModalOpened] = useState(false);
  const [receiveModalOpened, setReceiveModalOpened] = useState(false);
  const [saleModalOpened, setSaleModalOpened] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const opened =
    approveModalOpened ||
    receiveModalOpened ||
    saleModalOpened ||
    createModalOpened;

  const {
    stocks,
    filteredStocks,
    loadingTable,
    filterLoading,
    productOptions,
    paginationData,
    pageSize,
    searchTerm,
    selectedProduct,
    selectedBranch,
    selectedStatus,
    startDate,
    endDate,
    searchPO,
    setSearchTerm,
    setSelectedProduct,
    setSelectedBranch,
    setSelectedStatus,
    setStartDate,
    setEndDate,
    setSearchPO,
    handleFilter,
    handleResetFilter,
    handlePageChange,
    handlePageSizeChange,
  } = useStockPage({
    token: token || "",
    companyId,
    logout,
    opened,
    isAdmin,
    userBranchId,
  });

  console.log(stocks, "stocks");

  const [branches] = useState([
    { value: "73745874-e70b-498f-afd1-465464934f5b", label: "Main Branch" },
    { value: "branch-2", label: "Downtown Branch" },
    { value: "branch-3", label: "West Side Branch" },
  ]);

  // Filter branches based on user role
  const filteredBranches = isAdmin
    ? branches
    : branches.filter((branch) => branch.value === userBranchId);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "received", label: "Received" },
    { value: "saled", label: "Sold" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
  ];

  // Create Stock Form
  const createForm = useForm({
    initialValues: {
      products: [
        {
          product_id: "",
          quantity: 1,
          description: "",
          po_need_at: new Date(),
        },
      ],
    },
    validate: {
      products: {
        product_id: (value) => (!value ? "Product is required" : null),
        quantity: (value) =>
          value <= 0 ? "Quantity must be greater than 0" : null,
        description: (value) => (!value ? "Description is required" : null),
        po_need_at: (value) => (!value ? "Need by date is required" : null),
      },
    },
  });

  // Approve form for admin
  const approveForm = useForm({
    initialValues: {
      actual_price: 0,
      selling_price: 0,
      send_quantity: 0,
      po_status: "approved",
    },
    validate: {
      actual_price: (v) =>
        v <= 0 ? "Actual price must be greater than 0" : null,
      selling_price: (v) =>
        v <= 0 ? "Selling price must be greater than 0" : null,
      send_quantity: (v) =>
        v <= 0 ? "Sent quantity must be greater than 0" : null,
    },
  });

  // Receive form for branch user
  const receiveForm = useForm({
    initialValues: {
      receive_quantity: 0,
    },
    validate: {
      receive_quantity: (v) =>
        v <= 0 ? "Receive quantity must be greater than 0" : null,
    },
  });

  // Sale form for branch user
  const saleForm = useForm({
    initialValues: {
      sale_quantity: 0,
    },
    validate: {
      sale_quantity: (v) =>
        v <= 0 ? "Sale quantity must be greater than 0" : null,
    },
  });

  // Add new product row to create form
  const addProductRow = () => {
    createForm.insertListItem("products", {
      product_id: "",
      quantity: 1,
      description: "",
      po_need_at: new Date(),
    });
  };

  // Remove product row from create form
  const removeProductRow = (index: number) => {
    createForm.removeListItem("products", index);
  };

  // Action handlers
  const handleApprove = (stock: Stock) => {
    setSelectedStock(stock);
    approveForm.setValues({
      actual_price: stock.price || 0,
      selling_price: stock.selling_price || 0,
      send_quantity: stock.quantity || 0,
    });
    setApproveModalOpened(true);
  };

  const handleReceive = (stock: Stock) => {
    setSelectedStock(stock);
    receiveForm.setValues({
      receive_quantity: stock.quantity || 0,
    });
    setReceiveModalOpened(true);
  };

  const handleSale = (stock: Stock) => {
    setSelectedStock(stock);
    saleForm.setValues({
      sale_quantity: 0,
    });
    setSaleModalOpened(true);
  };

  const statusColors: Record<string, string> = {
    completed: "green",
    in_progress: "blue",
    approved: "teal",
    pending: "yellow",
    received: "grape",
    saled: "orange",
    rejected: "red",
    closed: "gray",
  };

  const statusLabels: Record<string, string> = {
    completed: "Completed",
    in_progress: "In Progress",
    approved: "Approved",
    pending: "Pending",
    received: "Received",
    saled: "Sold",
    rejected: "Rejected",
    closed: "Closed",
  };

  return (
    <Stack p="xs" gap="sm">
      {/* Header with Title and Create Button */}

      <Group justify="space-between">
        <div>
          <Title order={5} fw={600} c="indigo">
            Stock Management
          </Title>
          <Text c="dimmed" fz="xs" mt={2}>
            Manage your stocks
          </Text>
        </div>

        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => setCreateModalOpened(true)}
          size="xs"
          radius="sm"
          color="purple"
        >
          Create Stock
        </Button>
      </Group>
      {/* Filter Card */}
      <Card radius="md" p="md" style={{ background: "white" }} mb="md">
        <Group gap="sm" align="flex-end">
          <Select
            label="Product"
            placeholder="Select product"
            data={productOptions.map((p) => ({ value: p.uid, label: p.name }))}
            value={selectedProduct}
            onChange={setSelectedProduct}
            size="xs"
            style={{ minWidth: 150 }}
            clearable
          />

          {/* Only show branch filter for admin */}
          {isAdmin && (
            <Select
              label="Branch"
              placeholder="All branches"
              data={filteredBranches}
              value={selectedBranch}
              onChange={setSelectedBranch}
              size="xs"
              style={{ minWidth: 140 }}
              clearable
            />
          )}

          <Select
            label="Status"
            placeholder="Select Status"
            data={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            size="xs"
            style={{ minWidth: 140 }}
            clearable
          />

          <DateInput
            label="Start Date"
            placeholder="Pick start date"
            value={startDate}
            onChange={(value) => setStartDate(value ? new Date(value) : null)}
            size="xs"
          />

          <DateInput
            label="End Date"
            placeholder="Pick end date"
            value={endDate}
            onChange={(value) => setEndDate(value ? new Date(value) : null)}
            size="xs"
          />

          <TextInput
            label="PO Number"
            placeholder="Search PO number"
            value={searchPO}
            onChange={(e) => setSearchPO(e.currentTarget.value)}
            size="xs"
            style={{ minWidth: 150 }}
          />

          <Button
            size="xs"
            onClick={() => handleFilter(1, pageSize)}
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
          >
            Reset
          </Button>

          <Box style={{ flex: 1 }} />
        </Group>
      </Card>

      {/* Search Box for client-side filtering */}
      <TextInput
        placeholder="Search by product name, reference, or PO number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        mb="md"
        leftSection={<IconSearch size={16} />}
        style={{ maxWidth: 400 }}
      />

      {/* Table */}
      <Table
        striped
        highlightOnHover
        withTableBorder
        verticalSpacing="xs"
        horizontalSpacing="sm"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>PO</Table.Th>
            <Table.Th>Product</Table.Th>
            <Table.Th>Quantity</Table.Th>
            <Table.Th>Need By</Table.Th>

            {/* Only show cost columns for admin */}
            {isAdmin && (
              <>
                <Table.Th>Cost</Table.Th>
              </>
            )}
            <Table.Th>Selling Price (SP)</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th ta="center">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <Table.Tr key={stock.uid}>
                <Table.Td>{stock.purchase_order}</Table.Td>
                <Table.Td>{stock.product_name}</Table.Td>
                <Table.Td>{stock.quantity}</Table.Td>
                <Table.Td>
                  {new Date(stock.po_need_at).toLocaleDateString()}
                </Table.Td>

                {isAdmin && (
                  <>
                    <Table.Td>{stock.price.toFixed(2)}</Table.Td>
                  </>
                )}

                <Table.Td>{(stock.selling_price ?? 0).toFixed(2)}</Table.Td>

                <Table.Td>
                  <Badge
                    color={statusColors[stock.po_status] || "gray"}
                    variant="filled"
                  >
                    {statusLabels[stock.po_status] || stock.po_status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="center">
                  {/* Conditional actions based on role and status */}
                  {isAdmin && stock.po_status === "pending" && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleApprove(stock)}
                    >
                      Approve
                    </Button>
                  )}

                  {!isAdmin && stock.po_status === "approved" && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleReceive(stock)}
                    >
                      Receive
                    </Button>
                  )}

                  {!isAdmin && stock.po_status === "received" && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleSale(stock)}
                    >
                      Sale
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={isAdmin ? 9 : 7} py="lg" ta="center">
                <Box>
                  <IconSearch size={36} color="gray" />
                  <Text c="dimmed" fz="sm" mt={4}>
                    {loadingTable
                      ? "Loading stocks..."
                      : searchTerm || selectedProduct
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
      {paginationData.total_page > 1 && (
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            Showing {(paginationData.page - 1) * paginationData.page_size + 1}{" "}
            to{" "}
            {Math.min(
              paginationData.page * paginationData.page_size,
              paginationData.total_results
            )}{" "}
            of {paginationData.total_results} entries
          </Text>

          <Group>
            <Select
              value={pageSize.toString()}
              onChange={(value) =>
                handlePageSizeChange(value ?? pageSize.toString())
              }
              data={["5", "10", "20", "50", "100"]}
              size="xs"
              style={{ width: 80 }}
            />
            <Pagination
              value={paginationData.page}
              onChange={handlePageChange}
              total={paginationData.total_page}
              size="sm"
            />
          </Group>
        </Group>
      )}

      {/* Create Stock Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false);
          createForm.reset();
        }}
        title="Create New Stock"
        size="lg"
      >
        <form
          onSubmit={createForm.onSubmit(async (values) => {
            if (!token) return;
            const payloads = values.products.map((product) => ({
              company_id: companyId,
              branch_id: isAdmin
                ? selectedBranch || userBranchId
                : userBranchId,
              product_id: product.product_id,
              quantity: product.quantity,
              description: product.description,
              po_need_at: new Date(product.po_need_at).toISOString(),
              purchase_order: "",
              price: 0,
              po_status: "pending" as const,
            }));
            try {
              const res = await createStock(token, { stock_history: payloads });
              console.log(res);
              notifications.show({
                title: "Success",
                message: res.message || "Stock created successfully!",
                color: "green",
              });
              setCreateModalOpened(false);
              createForm.reset();

              fetchStocks(token);
              handleFilter();
            } catch (error) {
              console.error(error);
              notifications.show({
                title: "Error",
                message: "Failed to create stock. Please try again.",
                color: "red",
              });
            }
          })}
        >
          <Stack gap="md">
            <Text fz="sm" c="dimmed">
              Add products to create a new stock purchase order
            </Text>

            {createForm.values.products.map((_, index) => (
              <Card key={index} withBorder p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>Product #{index + 1}</Text>
                  {createForm.values.products.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeProductRow(index)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  )}
                </Group>

                <Stack gap="sm">
                  <Select
                    label="Product"
                    placeholder="Select product"
                    data={productOptions.map((p) => ({
                      value: p.uid,
                      label: p.name,
                    }))}
                    {...createForm.getInputProps(
                      `products.${index}.product_id`
                    )}
                    required
                  />

                  <NumberInput
                    label="Quantity"
                    placeholder="Enter quantity"
                    min={1}
                    {...createForm.getInputProps(`products.${index}.quantity`)}
                    required
                  />

                  <Textarea
                    label="Description"
                    placeholder="Enter product description"
                    {...createForm.getInputProps(
                      `products.${index}.description`
                    )}
                    required
                  />

                  <DateInput
                    label="Need By Date"
                    placeholder="Select date"
                    value={createForm.values.products[index].po_need_at}
                    onChange={(date) =>
                      createForm.setFieldValue(
                        `products.${index}.po_need_at`,
                        typeof date === "string"
                          ? new Date(date)
                          : date ?? new Date()
                      )
                    }
                    required
                  />
                </Stack>
              </Card>
            ))}

            <Group justify="space-between">
              <Button
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={addProductRow}
              >
                Add Another Product
              </Button>

              <Group>
                <Button
                  variant="light"
                  onClick={() => {
                    setCreateModalOpened(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={filterLoading}>
                  Create Stock
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modals for actions */}
      <Modal
        opened={approveModalOpened}
        onClose={() => setApproveModalOpened(false)}
        title="Approve Stock"
      >
        <form
          onSubmit={approveForm.onSubmit((values) => {
            if (!selectedStock || !token) return;
            updateStockStatus(token, selectedStock.uid, "approved", values);
          })}
        >
          <NumberInput
            label="Actual Price"
            placeholder="Enter actual price"
            {...approveForm.getInputProps("actual_price")}
            mb="sm"
          />

          <NumberInput
            label="Selling Price"
            placeholder="Enter selling price"
            {...approveForm.getInputProps("selling_price")}
            mb="sm"
          />

          <NumberInput
            label="Sent Quantity"
            placeholder="Enter sent quantity"
            {...approveForm.getInputProps("send_quantity")}
            mb="sm"
          />

          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setApproveModalOpened(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Approve</Button>
          </Group>
        </form>
      </Modal>

      {/* Receive and Sale modals would be similar */}
    </Stack>
  );
};

export default Stock;
