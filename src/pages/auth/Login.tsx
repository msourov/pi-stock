import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Card,
  Container,
  Notification,
  Image,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router";
import { IconX } from "@tabler/icons-react";
import { useAuth } from "../../AuthProvider";

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      user_id: "",
      password: "",
    },
    validate: {
      user_id: (value) => (value ? null : "User ID is required"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const handleSubmit = async (values: {
    user_id: string;
    password: string;
  }) => {
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/role-user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();
      if (res.ok && data.access_token) {
        login(data); // ✅ store user + token globally
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Invalid user ID or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container
      size={420}
      style={{ height: "90vh", display: "flex", alignItems: "center" }}
    >
      <Card shadow="md" p="xl" radius="md" withBorder style={{ width: "100%" }}>
        <Stack gap="md">
          <Center>
            <Image
              w={84}
              h={84}
              src="/assets/stock-icon.png"
              alt="Pi-Stock logo"
            />
          </Center>

          {error && (
            <Notification
              icon={<IconX size={18} />}
              color="red"
              onClose={() => setError("")}
              withCloseButton
            >
              {error}
            </Notification>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                label="User ID"
                placeholder="Enter your User ID"
                required
                {...form.getInputProps("user_id")}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                {...form.getInputProps("password")}
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                mt={10}
                size="md"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
};
