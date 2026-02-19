import {
  Table,
  Badge,
  ActionIcon,
  Text,
  Box,
  Group,
  TextInput,
  Button,
  Card,
  ScrollArea,
  Title,
} from "@mantine/core";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import { useUsers } from "./hooks";
import { useAuth } from "../../AuthProvider";
import { CreateUserModal } from "./components/CreateModal";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { EditUserModal } from "./components/EditUserModal";

const User = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = user.company_id;
  const token = localStorage.getItem("token");
  const { logout } = useAuth();
  const {
    filteredUsers,
    loading,
    searchTerm,
    roleOptions,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedUser,
    submitting,
    setSearchTerm,
    createUser,
    updateUser,
    deleteUser,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
  } = useUsers({ token, companyId, logout });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        {/* Header with search and actions */}
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
                Users Management
              </Title>
              <Text c="dimmed" fz="xs" mt={2}>
                Manage your users
              </Text>
            </div>

            <Button
              leftSection={<IconPlus size={18} />}
              onClick={openCreateModal}
              size="xs"
              radius="sm"
              color="purple"
            >
              Add User
            </Button>
          </Group>
        </Card>

        {/* Search */}
        <TextInput
          placeholder="Search users by name, email, phone, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={16} />}
          my="md"
        />

        {/* Users Table */}
        <ScrollArea>
          <Table verticalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User Info</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Role & Company</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Text c="dimmed">Loading users...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Table.Tr key={user.uid}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{user.name}</Text>
                        <Text size="sm" c="dimmed">
                          ID: {user.user_id}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text>{user.email}</Text>
                        <Text size="sm" c="dimmed">
                          {user.mobile_number}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Badge color="blue" variant="light">
                          {user.role_name}
                        </Badge>
                        <Text size="sm" mt={4}>
                          {user.company_name}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge
                          color={user.active ? "green" : "red"}
                          variant="light"
                          leftSection={
                            user.active ? (
                              <IconCheck size={12} />
                            ) : (
                              <IconX size={12} />
                            )
                          }
                        >
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                        {user.super_admin && (
                          <Badge color="orange" variant="light">
                            Super Admin
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text size="sm">{formatDate(user.create_at)}</Text>
                        <Text size="xs" c="dimmed">
                          by {user.logs.admin}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => openEditModal(user)}
                          disabled={user.super_admin} // Prevent editing super admins
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => openDeleteModal(user)}
                          disabled={user.super_admin} // Prevent deleting super admins
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Box>
                      <IconSearch size={36} color="gray" />
                      <Text c="dimmed" mt="sm">
                        {searchTerm
                          ? "No users found matching your search"
                          : "No users available"}
                      </Text>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      <CreateUserModal
        opened={isCreateModalOpen}
        onClose={closeModals}
        onSubmit={createUser}
        loading={submitting}
        roleOptions={roleOptions}
      />

      <EditUserModal
        opened={isEditModalOpen}
        onClose={closeModals}
        onSubmit={updateUser}
        loading={submitting}
        user={selectedUser}
        roleOptions={roleOptions}
      />

      <DeleteUserModal
        opened={isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={() => selectedUser && deleteUser(selectedUser.uid)}
        loading={submitting}
        user={selectedUser || undefined}
      />
    </>
  );
};

export default User;
