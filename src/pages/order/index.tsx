// import { useState, useEffect } from "react";
// import {
//   Card,
//   Table,
//   Group,
//   Text,
//   Button,
//   Stack,
//   Title,
//   Badge,
//   ActionIcon,
//   Box,
//   Grid,
//   Select,
//   TextInput,
//   Menu,
//   Modal,
//   NumberInput,
//   Textarea,
//   Loader,
//   Pagination,
// } from "@mantine/core";
// import {
//   IconPlus,
//   IconSearch,
//   IconFilter,
//   IconRefresh,
//   IconEdit,
//   IconTrash,
//   IconEye,
//   IconFileExport,
//   IconShoppingCart,
//   IconTruck,
//   IconCheck,
//   IconX,
//   IconCalendar,
//   IconCurrencyDollar,
//   IconClock,
// } from "@tabler/icons-react";
// import { useDisclosure } from "@mantine/hooks";
// import { notifications } from "@mantine/notifications";

// interface Order {
//   id: string;
//   order_number: string;
//   customer_name: string;
//   customer_email: string;
//   total_amount: number;
//   status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
//   order_date: string;
//   expected_delivery?: string;
//   items_count: number;
//   payment_status: "pending" | "paid" | "failed" | "refunded";
// }

// const Order = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [paymentFilter, setPaymentFilter] = useState<string>("all");
//   const [opened, { open, close }] = useDisclosure(false);
//   const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // Mock data - replace with actual API calls
//   const mockOrders: Order[] = [
//     {
//       id: "1",
//       order_number: "ORD-001",
//       customer_name: "John Smith",
//       customer_email: "john@example.com",
//       total_amount: 299.99,
//       status: "confirmed",
//       order_date: "2024-01-15",
//       expected_delivery: "2024-01-20",
//       items_count: 3,
//       payment_status: "paid"
//     },
//     {
//       id: "2",
//       order_number: "ORD-002",
//       customer_name: "Sarah Johnson",
//       customer_email: "sarah@example.com",
//       total_amount: 156.50,
//       status: "processing",
//       order_date: "2024-01-14",
//       expected_delivery: "2024-01-19",
//       items_count: 2,
//       payment_status: "paid"
//     },
//     {
//       id: "3",
//       order_number: "ORD-003",
//       customer_name: "Mike Wilson",
//       customer_email: "mike@example.com",
//       total_amount: 89.99,
//       status: "shipped",
//       order_date: "2024-01-13",
//       expected_delivery: "2024-01-18",
//       items_count: 1,
//       payment_status: "paid"
//     },
//     {
//       id: "4",
//       order_number: "ORD-004",
//       customer_name: "Emily Brown",
//       customer_email: "emily@example.com",
//       total_amount: 450.00,
//       status: "pending",
//       order_date: "2024-01-15",
//       items_count: 5,
//       payment_status: "pending"
//     },
//     {
//       id: "5",
//       order_number: "ORD-005",
//       customer_name: "David Lee",
//       customer_email: "david@example.com",
//       total_amount: 199.99,
//       status: "delivered",
//       order_date: "2024-01-10",
//       expected_delivery: "2024-01-15",
//       items_count: 2,
//       payment_status: "paid"
//     }
//   ];

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       // Simulate API call
//       setTimeout(() => {
//         setOrders(mockOrders);
//         setFilteredOrders(mockOrders);
//         setLoading(false);
//       }, 1000);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Filter orders based on search and filters
//   useEffect(() => {
//     let filtered = orders;

//     if (searchTerm) {
//       filtered = filtered.filter(order =>
//         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter(order => order.status === statusFilter);
//     }

//     if (paymentFilter !== "all") {
//       filtered = filtered.filter(order => order.payment_status === paymentFilter);
//     }

//     setFilteredOrders(filtered);
//     setCurrentPage(1); // Reset to first page when filtering
//   }, [searchTerm, statusFilter, paymentFilter, orders]);

//   // Pagination
//   const paginatedOrders = filteredOrders.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const totalPages = Math.ceil(filteredOrders.length / pageSize);

//   const getStatusColor = (status: Order["status"]) => {
//     const colors = {
//       pending: "yellow",
//       confirmed: "blue",
//       processing: "orange",
//       shipped: "violet",
//       delivered: "green",
//       cancelled: "red"
//     };
//     return colors[status];
//   };

//   const getPaymentStatusColor = (status: Order["payment_status"]) => {
//     const colors = {
//       pending: "yellow",
//       paid: "green",
//       failed: "red",
//       refunded: "gray"
//     };
//     return colors[status];
//   };

//   const handleViewOrder = (order: Order) => {
//     setSelectedOrder(order);
//     openView();
//   };

//   const handleUpdateStatus = (orderId: string, newStatus: Order["status"]) => {
//     setOrders(prev => prev.map(order =>
//       order.id === orderId ? { ...order, status: newStatus } : order
//     ));
//     notifications.show({
//       title: "Status Updated",
//       message: `Order status updated to ${newStatus}`,
//       color: "green",
//     });
//   };

//   const handleDeleteOrder = (orderId: string) => {
//     if (confirm("Are you sure you want to delete this order?")) {
//       setOrders(prev => prev.filter(order => order.id !== orderId));
//       notifications.show({
//         title: "Order Deleted",
//         message: "Order has been deleted successfully",
//         color: "green",
//       });
//     }
//   };

//   const statCards = [
//     {
//       label: "Total Orders",
//       value: orders.length,
//       color: "#4299e1",
//       icon: <IconShoppingCart size={20} color="#4299e1" />
//     },
//     {
//       label: "Pending Orders",
//       value: orders.filter(o => o.status === "pending").length,
//       color: "#ed8936",
//       icon: <IconClock size={20} color="#ed8936" />
//     },
//     {
//       label: "Revenue",
//       value: `$${orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}`,
//       color: "#48bb78",
//       icon: <IconCurrencyDollar size={20} color="#48bb78" />
//     },
//     {
//       label: "Avg. Order Value",
//       value: `$${orders.length > 0 ? (orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length).toFixed(2) : "0"}`,
//       color: "#9f7aea",
//       icon: <IconTruck size={20} color="#9f7aea" />
//     }
//   ];

//   return (
//     <Stack p="md" gap="lg">
//       {/* Header Section */}
//       <Card
//         withBorder
//         shadow="sm"
//         radius="lg"
//         p="lg"
//         style={{
//           background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
//           border: "1px solid #e2e8f0",
//         }}
//       >
//         <Group justify="space-between" align="flex-end">
//           <div>
//             <Title order={3} fw={600} c="indigo">
//               Order Management
//             </Title>
//             <Text c="dimmed" size="sm" mt={4}>
//               Manage customer orders and track order fulfillment
//             </Text>
//           </div>
//           <Button
//             leftSection={<IconPlus size={18} />}
//             onClick={open}
//             size="md"
//             radius="md"
//             style={{
//               background: "linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)",
//               border: "none"
//             }}
//           >
//             Create Order
//           </Button>
//         </Group>
//       </Card>

//       {/* Stats Cards */}
//       <Grid gutter="lg">
//         {statCards.map((stat) => (
//           <Grid.Col key={stat.label} span={{ base: 12, sm: 6, lg: 3 }}>
//             <Card
//               withBorder
//               padding="lg"
//               radius="md"
//               style={{
//                 borderLeft: `4px solid ${stat.color}`,
//                 background: "white",
//               }}
//             >
//               <Group gap="xs" align="flex-start">
//                 <Box
//                   p={8}
//                   style={{
//                     background: `${stat.color}20`,
//                     borderRadius: 8,
//                   }}
//                 >
//                   {stat.icon}
//                 </Box>
//                 <div style={{ flex: 1 }}>
//                   <Text fz="sm" c="dimmed" fw={500}>
//                     {stat.label}
//                   </Text>
//                   <Text fz="xl" fw={700} c="dark.4">
//                     {stat.value}
//                   </Text>
//                 </div>
//               </Group>
//             </Card>
//           </Grid.Col>
//         ))}
//       </Grid>

//       {/* Filters Section */}
//       <Card withBorder shadow="sm" radius="lg" p="md">
//         <Group justify="space-between" mb="md">
//           <Title order={4} c="dark.4">
//             Order List
//           </Title>
//           <Group>
//             <Button
//               variant="light"
//               leftSection={<IconRefresh size={16} />}
//               onClick={fetchOrders}
//               loading={loading}
//               size="sm"
//             >
//               Refresh
//             </Button>
//             <Button
//               variant="outline"
//               leftSection={<IconFileExport size={16} />}
//               size="sm"
//             >
//               Export
//             </Button>
//           </Group>
//         </Group>

//         <Group gap="md" align="flex-end">
//           <TextInput
//             placeholder="Search orders, customers..."
//             leftSection={<IconSearch size={16} />}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ width: 250 }}
//             size="sm"
//           />
//           <Select
//             label="Order Status"
//             placeholder="All statuses"
//             value={statusFilter}
//             onChange={setStatusFilter}
//             data={[
//               { value: "all", label: "All Statuses" },
//               { value: "pending", label: "Pending" },
//               { value: "confirmed", label: "Confirmed" },
//               { value: "processing", label: "Processing" },
//               { value: "shipped", label: "Shipped" },
//               { value: "delivered", label: "Delivered" },
//               { value: "cancelled", label: "Cancelled" },
//             ]}
//             size="sm"
//             style={{ width: 150 }}
//           />
//           <Select
//             label="Payment Status"
//             placeholder="All payments"
//             value={paymentFilter}
//             onChange={setPaymentFilter}
//             data={[
//               { value: "all", label: "All Payments" },
//               { value: "pending", label: "Pending" },
//               { value: "paid", label: "Paid" },
//               { value: "failed", label: "Failed" },
//               { value: "refunded", label: "Refunded" },
//             ]}
//             size="sm"
//             style={{ width: 150 }}
//           />
//           <Button
//             variant="light"
//             leftSection={<IconFilter size={16} />}
//             onClick={() => {
//               setSearchTerm("");
//               setStatusFilter("all");
//               setPaymentFilter("all");
//             }}
//             size="sm"
//           >
//             Clear Filters
//           </Button>
//         </Group>
//       </Card>

//       {/* Orders Table */}
//       <Card withBorder shadow="sm" radius="lg">
//         {loading ? (
//           <Box py="xl" ta="center">
//             <Loader size="lg" />
//             <Text mt="md" c="dimmed">
//               Loading orders...
//             </Text>
//           </Box>
//         ) : (
//           <>
//             <Table.ScrollContainer minWidth={800}>
//               <Table verticalSpacing="sm" highlightOnHover>
//                 <Table.Thead>
//                   <Table.Tr>
//                     <Table.Th>Order #</Table.Th>
//                     <Table.Th>Customer</Table.Th>
//                     <Table.Th>Date</Table.Th>
//                     <Table.Th>Items</Table.Th>
//                     <Table.Th>Amount</Table.Th>
//                     <Table.Th>Order Status</Table.Th>
//                     <Table.Th>Payment</Table.Th>
//                     <Table.Th>Actions</Table.Th>
//                   </Table.Tr>
//                 </Table.Thead>
//                 <Table.Tbody>
//                   {paginatedOrders.length === 0 ? (
//                     <Table.Tr>
//                       <Table.Td colSpan={8} py="xl" ta="center">
//                         <Box>
//                           <IconSearch size={48} color="gray" />
//                           <Text mt="sm" c="dimmed" size="lg">
//                             No orders found
//                           </Text>
//                           <Text c="dimmed" size="sm" mt="xs">
//                             {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
//                               ? "Try adjusting your filters"
//                               : "Get started by creating your first order"
//                             }
//                           </Text>
//                         </Box>
//                       </Table.Td>
//                     </Table.Tr>
//                   ) : (
//                     paginatedOrders.map((order) => (
//                       <Table.Tr key={order.id}>
//                         <Table.Td>
//                           <Text fw={600}>{order.order_number}</Text>
//                         </Table.Td>
//                         <Table.Td>
//                           <div>
//                             <Text fw={500}>{order.customer_name}</Text>
//                             <Text size="sm" c="dimmed">{order.customer_email}</Text>
//                           </div>
//                         </Table.Td>
//                         <Table.Td>
//                           <Text size="sm">
//                             {new Date(order.order_date).toLocaleDateString()}
//                           </Text>
//                           {order.expected_delivery && (
//                             <Text size="xs" c="dimmed">
//                               Est: {new Date(order.expected_delivery).toLocaleDateString()}
//                             </Text>
//                           )}
//                         </Table.Td>
//                         <Table.Td>
//                           <Badge variant="light" color="blue">
//                             {order.items_count} items
//                           </Badge>
//                         </Table.Td>
//                         <Table.Td>
//                           <Text fw={600}>${order.total_amount}</Text>
//                         </Table.Td>
//                         <Table.Td>
//                           <Badge color={getStatusColor(order.status)} variant="light">
//                             {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                           </Badge>
//                         </Table.Td>
//                         <Table.Td>
//                           <Badge color={getPaymentStatusColor(order.payment_status)} variant="light">
//                             {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
//                           </Badge>
//                         </Table.Td>
//                         <Table.Td>
//                           <Group gap="xs">
//                             <ActionIcon
//                               variant="subtle"
//                               color="blue"
//                               size="sm"
//                               onClick={() => handleViewOrder(order)}
//                             >
//                               <IconEye size={16} />
//                             </ActionIcon>
//                             <Menu shadow="md" width={200}>
//                               <Menu.Target>
//                                 <ActionIcon variant="subtle" color="orange" size="sm">
//                                   <IconEdit size={16} />
//                                 </ActionIcon>
//                               </Menu.Target>
//                               <Menu.Dropdown>
//                                 <Menu.Label>Update Status</Menu.Label>
//                                 <Menu.Item onClick={() => handleUpdateStatus(order.id, "confirmed")}>
//                                   Mark as Confirmed
//                                 </Menu.Item>
//                                 <Menu.Item onClick={() => handleUpdateStatus(order.id, "processing")}>
//                                   Mark as Processing
//                                 </Menu.Item>
//                                 <Menu.Item onClick={() => handleUpdateStatus(order.id, "shipped")}>
//                                   Mark as Shipped
//                                 </Menu.Item>
//                                 <Menu.Item onClick={() => handleUpdateStatus(order.id, "delivered")}>
//                                   Mark as Delivered
//                                 </Menu.Item>
//                                 <Menu.Divider />
//                                 <Menu.Item
//                                   color="red"
//                                   onClick={() => handleUpdateStatus(order.id, "cancelled")}
//                                 >
//                                   Cancel Order
//                                 </Menu.Item>
//                               </Menu.Dropdown>
//                             </Menu>
//                             <ActionIcon
//                               variant="subtle"
//                               color="red"
//                               size="sm"
//                               onClick={() => handleDeleteOrder(order.id)}
//                             >
//                               <IconTrash size={16} />
//                             </ActionIcon>
//                           </Group>
//                         </Table.Td>
//                       </Table.Tr>
//                     ))
//                   )}
//                 </Table.Tbody>
//               </Table>
//             </Table.ScrollContainer>

//             {/* Pagination */}
//             {filteredOrders.length > 0 && (
//               <Group justify="space-between" p="md">
//                 <Text size="sm" c="dimmed">
//                   Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
//                 </Text>
//                 <Pagination
//                   total={totalPages}
//                   value={currentPage}
//                   onChange={setCurrentPage}
//                   color="blue"
//                   size="sm"
//                 />
//               </Group>
//             )}
//           </>
//         )}
//       </Card>

//       {/* Create Order Modal */}
//       <Modal
//         opened={opened}
//         onClose={close}
//         title="Create New Order"
//         size="lg"
//         overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
//       >
//         <Text c="dimmed" size="sm" mb="md">
//           Add a new customer order to the system
//         </Text>
//         {/* Add order creation form here */}
//         <Group justify="flex-end" mt="xl">
//           <Button variant="outline" onClick={close}>
//             Cancel
//           </Button>
//           <Button>
//             Create Order
//           </Button>
//         </Group>
//       </Modal>

//       {/* View Order Modal */}
//       <Modal
//         opened={viewOpened}
//         onClose={closeView}
//         title={`Order Details - ${selectedOrder?.order_number}`}
//         size="xl"
//         overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
//       >
//         {selectedOrder && (
//           <Stack gap="md">
//             {/* Add order details view here */}
//             <Text>Order details would be displayed here...</Text>
//           </Stack>
//         )}
//       </Modal>
//     </Stack>
//   );
// };

// export default Order;
