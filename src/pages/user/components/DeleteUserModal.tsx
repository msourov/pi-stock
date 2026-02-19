import { Modal, Text, Group, Button } from "@mantine/core";

interface DeleteUserModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  user?: { name?: string; email?: string };
}

export const DeleteUserModal = ({
  opened,
  onClose,
  onConfirm,
  loading,
  user,
}: DeleteUserModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} centered>
      <Text c="red">
        Are you sure you want to delete user{" "}
        <strong className="text-blue-500">{user?.name || "this user"}</strong>?
      </Text>
      <p className="text-gray-500 mb-4">This action cannot be undone</p>

      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
