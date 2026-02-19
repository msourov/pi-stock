import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { CreateUserPayload, UpdateUserPayload, User } from "./type";

interface UseUsersProps {
  token: string | null;
  companyId?: string;
  logout: () => void;
}

export const useUsers = ({ token, companyId, logout }: UseUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role-user/all`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const usersData: User[] = data?.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Failed to fetch users:", res.status);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch role options
  const fetchRoleOptions = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role/user-helper`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const roles =
          data?.data?.map((role: { name: string; uid: string }) => ({
            value: role.uid,
            label: role.name,
          })) || [];
        setRoleOptions(roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Create user
  const createUser = async (userData: CreateUserPayload) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role-user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await res.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "User created successfully!",
          icon: <IconCheck />,
          color: "green",
        });
        setIsCreateModalOpen(false);
        await fetchUsers();
        return true;
      } else if (res.status === 401) {
        logout();
        return false;
      } else {
        notifications.show({
          title: "Error",
          message: result?.detail || "Failed to create user",
          icon: <IconX size={16} />,
          color: "red",
        });
        return false;
      }
    } catch (error) {
      console.error("Create user error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create user. Please try again.",
        icon: <IconX size={16} />,
        color: "red",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Update user
  const updateUser = async (
    userId: string,
    userData: Omit<UpdateUserPayload, "uid">
  ) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role-user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await res.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "User updated successfully!",
          icon: <IconCheck size={16} />,
          color: "green",
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        await fetchUsers();
        return true;
      } else if (res.status === 401) {
        logout();
        return false;
      } else {
        notifications.show({
          title: "Error",
          message: result?.detail || "Failed to update user",
          icon: <IconX size={16} />,
          color: "red",
        });
        return false;
      }
    } catch (error) {
      console.error("Update user error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update user. Please try again.",
        icon: <IconX size={16} />,
        color: "red",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role-user/delete/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      const result = await res.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "User deleted successfully!",
          icon: <IconCheck size={16} />,
          color: "green",
        });
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        await fetchUsers();
        return true;
      } else if (res.status === 401) {
        logout();
        return false;
      } else {
        notifications.show({
          title: "Error",
          message: result?.detail || "Failed to delete user",
          icon: <IconX size={16} />,
          color: "red",
        });
        return false;
      }
    } catch (error) {
      console.error("Delete user error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete user. Please try again.",
        icon: <IconX size={16} />,
        color: "red",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Open modals
  const openCreateModal = () => setIsCreateModalOpen(true);
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.mobile_number.includes(searchTerm) ||
          user.role_name.toLowerCase().includes(term) ||
          user.user_id.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    fetchRoleOptions();
  }, []);

  return {
    users,
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
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
  };
};
