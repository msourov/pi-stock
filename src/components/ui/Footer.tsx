import {
  Box,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Anchor,
  Divider,
  Image,
} from "@mantine/core";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandFacebook,
} from "@tabler/icons-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "white",
        marginTop: "auto",
      }}
    >
      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Company Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Group gap="sm">
                <Image
                  w={32}
                  h={32}
                  src="/assets/stock-icon.png"
                  alt="Pi-Stock logo"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <Text fw={700} size="xl">
                  Pi-Stock
                </Text>
              </Group>
              <Text size="sm" c="gray.3" style={{ lineHeight: 1.6 }}>
                Pi-Stock provides cutting-edge inventory management solutions
                that streamline your business operations and maximize
                efficiency.
              </Text>
              <Group gap="sm">
                <IconBrandLinkedin
                  size={20}
                  color="#cbd5e1"
                  style={{ cursor: "pointer" }}
                />
                <IconBrandTwitter
                  size={20}
                  color="#cbd5e1"
                  style={{ cursor: "pointer" }}
                />
                <IconBrandFacebook
                  size={20}
                  color="#cbd5e1"
                  style={{ cursor: "pointer" }}
                />
              </Group>
            </Stack>
          </Grid.Col>

          {/* Quick Links */}
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="lg">
                Features
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="/products"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  All Products
                </Anchor>
                <Anchor
                  href="/products/categories"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Categories
                </Anchor>
                <Anchor
                  href="/stocks"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Stock Management
                </Anchor>
                <Anchor
                  href="/orders"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Order Tracking
                </Anchor>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Company */}
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="lg">
                Company
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="/about"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  About Us
                </Anchor>
                {/* <Anchor
                  href="/careers"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Careers
                </Anchor> */}
                <Anchor
                  href="/blog"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Blog
                </Anchor>
                <Anchor
                  href="/contact"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Contact
                </Anchor>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Support */}
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="lg">
                Support
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="/help"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Help Center
                </Anchor>
                <Anchor
                  href="/docs"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Documentation
                </Anchor>
                {/* <Anchor
                  href="/api"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  API Reference
                </Anchor> */}
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Legal */}
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="lg">
                Legal
              </Text>
              <Stack gap="xs">
                <Anchor
                  href="/privacy"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Privacy Policy
                </Anchor>
                <Anchor
                  href="/terms"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Terms of Service
                </Anchor>
                <Anchor
                  href="/security"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Security
                </Anchor>
                <Anchor
                  href="/compliance"
                  c="gray.3"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Compliance
                </Anchor>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider my="lg" color="gray.6" />

        {/* Bottom Section */}
        <Grid gutter="md" align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xs">
              <Group gap="md">
                <Group gap="xs">
                  <IconMapPin size={16} color="#94a3b8" />
                  <Text size="sm" c="gray.3">
                    123 Business District, City 10001
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconPhone size={16} color="#94a3b8" />
                  <Text size="sm" c="gray.3">
                    +1 (555) 123-4567
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconMail size={16} color="#94a3b8" />
                  <Text size="sm" c="gray.3">
                    info@pitetris.com
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Copyright */}
        <Box
          mt="lg"
          style={{ borderTop: "1px solid #475569", paddingTop: "16px" }}
        >
          <Group justify="center">
            <Text size="sm" c="gray.4">
              © {currentYear} Pi Tetris. All rights reserved.
            </Text>
            {/* <Group gap="md">
              <Text size="xs" c="gray.4">
                v2.1.0
              </Text>
              <Text size="xs" c="gray.4">
                •
              </Text>
              <Text size="xs" c="gray.4">
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </Group> */}
          </Group>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
