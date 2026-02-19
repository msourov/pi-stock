import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { CheckStock } from "../types";
import { useState } from "react";

interface DeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: CheckStock | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  opened,
  onClose,
  onConfirm,
  item,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <Stack gap="md" p="sm" ta="center">
        <Text fw={600} size="lg">
          Delete Stock Check?
        </Text>
        <Text size="sm" c="dimmed">
          Are you sure you want to delete{" "}
          <strong>{item?.description || "this entry"}</strong>? This cannot be
          undone.
        </Text>
        <Group justify="center" mt="xs">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="red" loading={loading} onClick={handleConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};