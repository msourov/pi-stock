import React, { useState, useEffect } from "react";
import {
  Title,
  Table,
  Button,
  Group,
  TextInput,
  Select,
  Modal,
  Badge,
  ActionIcon,
  Text,
  Card,
  Grid,
  Box,
  useMantineTheme,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconEdit,
  IconSearch,
  IconMapPin,
  IconBuilding,
  IconCheck,
  IconX,
  IconFilter,
  IconTrash,
} from "@tabler/icons-react";
import { Branch, CreateBranchPayload, UpdateBranchPayload } from "./type";
import { useAuth } from "../../AuthProvider";
import { notifications } from "@mantine/notifications";
import BranchForm from "./components/BranchForm";
import AppLoader from "../../components/ui/Loader";

const Branch: React.FC = () => {
  const theme = useMantineTheme();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [zoneFilter, setZoneFilter] = useState<string | null>("all");
  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [deleteUid, setDeleteUid] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { logout } = useAuth();

  const fetchBranches = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/branch/all`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        setBranches(result.data);
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to fetch branches",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Create branch
  const handleCreate = async (values: CreateBranchPayload) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/branch/create`,
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
      if (result.success) {
        closeCreateModal();
        fetchBranches();
        notifications.show({
          title: "Success",
          message: result?.message || "Branch created successfully!",
          icon: <IconCheck />,
          color: "teal",
        });
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to fetch branches",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error creating branch:", error);
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

  // Update branch
  const handleUpdate = async (values: UpdateBranchPayload) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/branch/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(values),
        }
      );
      const result = await res.json();
      if (result.success) {
        closeEditModal();
        fetchBranches();
        notifications.show({
          title: "Success",
          message: result?.message || "Branch updated successfully!",
          icon: <IconCheck />,
          color: "teal",
        });
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to update branch",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error updating branch:", error);
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

  //Delete branch
  const handleDelete = async () => {
    if (!deleteUid) return;

    setDeleting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/branch/delete/${deleteUid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const result = await res.json();

      if (result.success) {
        closeDeleteModal();
        fetchBranches(); // refresh list
        notifications.show({
          title: "Deleted",
          message: result?.message || "Branch deleted successfully!",
          icon: <IconCheck />,
          color: "teal",
        });
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to delete branch",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      notifications.show({
        title: "Something went wrong!",
        message: "Please check your connection",
        icon: <IconX />,
        color: "red",
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.active) ||
      (statusFilter === "inactive" && !branch.active);
    const matchesZone = zoneFilter === "all" || branch.zone_name === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  // Get unique zones for filter
  const zones = Array.from(new Set(branches.map((branch) => branch.zone_name)));

  // Stats cards data
  const statCards = [
    {
      label: "Total Branches",
      value: branches.length,
      color: theme.colors.blue[6],
      icon: <IconBuilding size={20} color={theme.colors.blue[6]} />,
    },
    {
      label: "Active Branches",
      value: branches.filter((b) => b.active).length,
      color: theme.colors.green[6],
      icon: <IconCheck size={20} color={theme.colors.green[6]} />,
    },
    {
      label: "Locations",
      value: new Set(branches.map((b) => b.location)).size,
      color: theme.colors.orange[6],
      icon: <IconMapPin size={20} color={theme.colors.orange[6]} />,
    },
    {
      label: "Zones",
      value: new Set(branches.map((b) => b.zone_name)).size,
      color: theme.colors.grape[6],
      icon: <IconBuilding size={20} color={theme.colors.grape[6]} />,
    },
  ];

  const openEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    openEditModal();
  };

  const openDelete = (uid: string) => {
    openDeleteModal();
    setDeleteUid(uid);
  };
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
        <Group justify="space-between">
          <div>
            <Title order={5} fw={600} c="indigo">
              Branch Management
            </Title>
            <Text c="dimmed" fz="xs" mt={2}>
              Manage your company branches and locations
            </Text>
          </div>

          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
            size="xs"
            radius="sm"
            color="purple"
          >
            Add New Branch
          </Button>
        </Group>
      </Card>

      {/* Filters Section */}
      <Card radius="md" p={0} pb={4} style={{ background: "white" }}>
        <Group align="flex-end">
          <TextInput
            placeholder="Search branches, locations, codes..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            size="xs"
          />
          <Select
            label="Status"
            placeholder="All statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            size="xs"
            style={{ width: 150 }}
          />
          <Select
            label="Zone"
            placeholder="All zones"
            value={zoneFilter}
            onChange={setZoneFilter}
            data={[
              { value: "all", label: "All Zones" },
              ...zones.map((zone) => ({ value: zone, label: zone })),
            ]}
            size="xs"
            style={{ width: 200 }}
          />
          <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setZoneFilter("all");
            }}
            size="xs"
          >
            Clear Filters
          </Button>
        </Group>
      </Card>

      {/* Stats Cards */}
      <Grid gutter="sm">
        {statCards.map((stat) => (
          <Grid.Col
            key={stat.label}
            span={{
              base: 12,
              xs: 6,
              lg: 3,
            }}
          >
            <Card
              withBorder
              p="sm"
              radius="sm"
              style={{
                borderLeft: `4px solid ${stat.color}`,
                background: "white",
              }}
            >
              <Group gap="xs" align="flex-start">
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

      {/* Branches Table */}
      <Card withBorder shadow="sm" radius="lg">
        {loading ? (
          <Box py="xl" ta="center">
            <AppLoader />
            <Text mt="md" c="dimmed">
              Loading branches...
            </Text>
          </Box>
        ) : (
          <>
            <Table.ScrollContainer minWidth={1000}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Branch Name</Table.Th>
                    <Table.Th>Code</Table.Th>
                    <Table.Th>Team</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Zone</Table.Th>
                    <Table.Th>Sub Zone</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredBranches.map((branch) => (
                    <Table.Tr key={branch.uid}>
                      <Table.Td>
                        <Text fw={500}>{branch.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="blue" variant="light">
                          {branch.code}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{branch.team}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconMapPin size={14} color={theme.colors.gray[6]} />
                          <Text
                            size="sm"
                            style={{ maxWidth: 200 }}
                            lineClamp={1}
                          >
                            {branch.location}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{branch.zone_name}</Table.Td>
                      <Table.Td>{branch.sub_zone_name}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={branch.active ? "green" : "red"}
                          variant="light"
                        >
                          {branch.active ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <ActionIcon
                          color="blue"
                          onClick={() => openEdit(branch)}
                          size="sm"
                          variant="subtle"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="blue"
                          onClick={() => openDelete(branch?.uid)}
                          size="sm"
                          c="red"
                          variant="subtle"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {filteredBranches.length === 0 && (
              <Box py="xl" ta="center">
                <Text c="dimmed">No branches found</Text>
              </Box>
            )}
          </>
        )}
      </Card>

      {/* Create Branch Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create New Branch"
        size="lg"
      >
        <BranchForm
          onSubmit={handleCreate}
          submitting={submitting}
          onCancel={closeCreateModal}
        />
      </Modal>

      {/* Edit Branch Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Branch"
        size="lg"
      >
        {selectedBranch && (
          <BranchForm
            branch={selectedBranch}
            onSubmit={handleUpdate}
            submitting={submitting}
            onCancel={closeEditModal}
            isEdit
          />
        )}
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={closeDeleteModal}
        centered
        size="sm"
        transitionProps={{
          transition: "fade",
          duration: 200,
          timingFunction: "linear",
        }}
        withCloseButton={false}
      >
        <Box ta="center" p="md">
          <Text fw={600} size="lg" c="dark">
            Delete Branch?
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Are you sure you want to delete this branch? This action cannot be
            undone.
          </Text>

          <Group justify="center" mt="lg">
            <Button
              variant="default"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </Stack>
  );
};

export default Branch;
