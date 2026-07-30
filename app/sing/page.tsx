"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Textarea,
  ActionIcon,
  ScrollArea,
  Group,
  Avatar,
  Button,
  Stack,
  Paper,
  Overlay,
  Image as MantineImage,
  Modal,
  Badge,
  FileButton,
  TextInput,
  PasswordInput,
  Menu,
  Divider,
  SimpleGrid,
  Card,
  ThemeIcon,
  Tooltip,
  Transition,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconPlus,
  IconSend,
  IconTrash,
  IconMessage,
  IconSparkles,
  IconMenu2,
  IconX,
  IconCopy,
  IconPhoto,
  IconPaperclip,
  IconDownload,
  IconMoonStars,
  IconRobot,
  IconUser,
  IconLock,
  IconMail,
  IconLogout,
  IconUserPlus,
  IconLogin,
  IconCrown,
  IconCheck,
  IconQrcode,
  IconCreditCard,
  IconBrandOpenai,
  IconBulb,
  IconCode,
  IconWand,
} from "@tabler/icons-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image";
  imageUrl?: string;
  uploadedImageUrl?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface UserProfile {
  name: string;
  email: string;
  plan?: "free" | "basic" | "pro";
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function ChatGPTApp() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== "undefined") {
      const savedChats = localStorage.getItem("chat_app_chats");
      if (savedChats) {
        try {
          return JSON.parse(savedChats);
        } catch (e) {
          console.error("Failed to parse saved chats from localStorage", e);
        }
      }
    }
    return [{ id: "1", title: "New Conversation", messages: [] }];
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedActiveId = localStorage.getItem("chat_app_active_id");
      if (savedActiveId) return savedActiveId;
    }
    return chats[0]?.id || "1";
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isImageMode, setIsImageMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");

  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    chats[0] || { id: "1", title: "New Conversation", messages: [] };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_app_chats", JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_app_active_id", activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    const savedUser = localStorage.getItem("chat_app_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeChat?.messages, isTyping]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
    setInput("");
    setError("");
    setIsImageMode(false);
    clearSelectedImage();
    if (isMobile) setSidebarOpen(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chats.filter((c) => c.id !== id);
    const fallback =
      updated.length > 0
        ? updated
        : [{ id: Date.now().toString(), title: "New Conversation", messages: [] }];
    setChats(fallback);
    if (activeChatId === id) setActiveChatId(fallback[0].id);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authForm.email || !authForm.password) {
      setAuthError("Kripya sabhi zaroori fields bharein.");
      return;
    }

    let userProfile: UserProfile;

    if (authMode === "signup") {
      if (!authForm.name) {
        setAuthError("Naam likhna zaroori hai.");
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError("Passwords match nahi kar rahe hain.");
        return;
      }
      userProfile = { name: authForm.name, email: authForm.email, plan: "free" };
    } else {
      userProfile = {
        name: authForm.name || authForm.email.split("@")[0],
        email: authForm.email,
        plan: "free",
      };
    }

    setUser(userProfile);
    localStorage.setItem("chat_app_user", JSON.stringify(userProfile));

    setAuthModalOpen(false);
    setAuthForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chat_app_user");
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthModalOpen(true);
  };

  const handleSelectPlan = (planName: string, price: string) => {
    setSelectedPlan({ name: planName, price });
    setPricingModalOpen(false);
    setPaymentModalOpen(true);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const currentInput = input.trim();
    let base64Image = "";

    if (selectedImage) {
      try {
        base64Image = await convertFileToBase64(selectedImage);
      } catch (err) {
        setError("Image process karne mein issue hua.");
        return;
      }
    }

    const currentUploadedUrl = imagePreviewUrl;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
      uploadedImageUrl: currentUploadedUrl || undefined,
    };

    const updatedMessages = [...activeChat.messages, userMessage];

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChatId) return chat;
        const title =
          chat.messages.length === 0
            ? (currentInput || "Uploaded Image").slice(0, 24) +
              (currentInput.length > 24 ? "..." : "")
            : chat.title;
        return { ...chat, title, messages: updatedMessages };
      })
    );

    setInput("");
    clearSelectedImage();
    setIsTyping(true);
    setError("");

    try {
      const sanitizedMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isImageMode,
          hasUploadedImage: !!base64Image,
          uploadedImageBase64: base64Image || null,
          messages: sanitizedMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server response error");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || (data.imageUrl ? "Aapki image create ho gayi hai:" : ""),
        type: data.imageUrl ? "image" : "text",
        imageUrl: data.imageUrl || undefined,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    } catch (err: any) {
      setError(err.message || "Kuch error hua. Dimag shant rakhein aur dobara try karein.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Flex h="100vh" bg="#0B0F17" style={{ overflow: "hidden", position: "relative", fontFamily: "system-ui, sans-serif" }}>
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <Overlay
          color="#000"
          backgroundOpacity={0.75}
          style={{ zIndex: 99, backdropFilter: "blur(8px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fullscreen Image Preview Modal */}
      <Modal
        opened={!!modalImage}
        onClose={() => setModalImage(null)}
        centered
        size="lg"
        radius="lg"
        styles={{
          content: { background: "#111827", border: "1px solid #1F2937", color: "#F9FAFB" },
          header: { background: "#111827", color: "#F9FAFB" },
        }}
        title={<Text fw={600}>Image Preview</Text>}
      >
        {modalImage && (
          <Stack align="center" gap="md">
            <MantineImage src={modalImage} radius="md" alt="Preview Image" style={{ maxHeight: "70vh", objectFit: "contain" }} />
            <Button
              leftSection={<IconDownload size={16} />}
              color="teal"
              variant="light"
              component="a"
              href={modalImage}
              download="ai-generated-image.png"
              target="_blank"
            >
              Download High Quality
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Auth Modal */}
      <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        centered
        radius="lg"
        styles={{
          content: { background: "#111827", border: "1px solid #1F2937", color: "#F9FAFB", padding: "8px" },
          header: { background: "#111827", color: "#F9FAFB" },
        }}
        title={
          <Group gap="xs">
            <ThemeIcon color="teal" variant="light" size="md" radius="xl">
              <IconSparkles size={18} />
            </ThemeIcon>
            <Text fw={700} size="lg">{authMode === "signup" ? "Create Account" : "Welcome Back"}</Text>
          </Group>
        }
      >
        <form onSubmit={handleAuthSubmit}>
          <Stack gap="md">
            {authError && (
              <Paper p="xs" bg="rgba(239, 68, 68, 0.1)" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }} radius="md">
                <Text size="xs" c="red.4" ta="center">
                  {authError}
                </Text>
              </Paper>
            )}

            {authMode === "signup" && (
              <TextInput
                label="Full Name"
                placeholder="Rahul Swami"
                leftSection={<IconUser size={16} color="#9CA3AF" />}
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                styles={{ input: { background: "#1F2937", color: "#FFF", borderColor: "#374151" }, label: { color: "#D1D5DB", marginBottom: 4 } }}
              />
            )}

            <TextInput
              label="Email Address"
              placeholder="rahul@example.com"
              type="email"
              leftSection={<IconMail size={16} color="#9CA3AF" />}
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
              styles={{ input: { background: "#1F2937", color: "#FFF", borderColor: "#374151" }, label: { color: "#D1D5DB", marginBottom: 4 } }}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              leftSection={<IconLock size={16} color="#9CA3AF" />}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
              styles={{ input: { background: "#1F2937", color: "#FFF", borderColor: "#374151" }, label: { color: "#D1D5DB", marginBottom: 4 } }}
            />

            {authMode === "signup" && (
              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                leftSection={<IconLock size={16} color="#9CA3AF" />}
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                required
                styles={{ input: { background: "#1F2937", color: "#FFF", borderColor: "#374151" }, label: { color: "#D1D5DB", marginBottom: 4 } }}
              />
            )}

            <Button type="submit" color="teal" fullWidth radius="md" size="md" mt="xs">
              {authMode === "signup" ? "Get Started" : "Sign In"}
            </Button>

            <Text size="xs" ta="center" c="gray.5">
              {authMode === "signup" ? "Pehle se account hai? " : "Naya account chahiye? "}
              <Text
                span
                c="teal.4"
                fw={600}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAuthError("");
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
              >
                {authMode === "signup" ? "Login karein" : "Sign up karein"}
              </Text>
            </Text>
          </Stack>
        </form>
      </Modal>

      {/* Pricing Modal */}
      <Modal
        opened={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        centered
        size="lg"
        radius="lg"
        styles={{
          content: { background: "#111827", border: "1px solid #1F2937", color: "#F9FAFB" },
          header: { background: "#111827", color: "#F9FAFB" },
        }}
        title={
          <Group gap="xs">
            <IconCrown color="#F59E0B" size={24} />
            <Text fw={700} size="xl">Choose Your Power Plan</Text>
          </Group>
        }
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Basic Plan */}
            <Card
              padding="lg"
              radius="md"
              style={{
                background: "#1F2937",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Stack gap="xs">
                <Badge color="teal" variant="light" size="lg" style={{ width: "fit-content" }}>
                  BASIC
                </Badge>
                <Group align="flex-end" gap={4}>
                  <Text size="28px" fw={800} c="#F9FAFB">₹5,000</Text>
                  <Text size="xs" c="gray.4" mb={4}>/ month</Text>
                </Group>
                <Divider my="xs" color="rgba(255, 255, 255, 0.08)" />
                <Stack gap={8}>
                  {["Unlimited Text Queries", "Fast Response Speeds", "Chat History Save", "Standard Support"].map((feat, i) => (
                    <Group gap={8} key={i}>
                      <ThemeIcon color="teal" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                      <Text size="xs" c="gray.3">{feat}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
              <Button
                color="teal"
                fullWidth
                mt="lg"
                radius="md"
                onClick={() => handleSelectPlan("Basic Plan", "₹5,000")}
              >
                Select Basic
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card
              padding="lg"
              radius="md"
              style={{
                background: "linear-gradient(160deg, #1F2937 0%, #111827 100%)",
                border: "2px solid #F59E0B",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Badge color="yellow" variant="filled" style={{ position: "absolute", top: 12, right: 12 }}>
                POPULAR
              </Badge>
              <Stack gap="xs">
                <Badge color="yellow" variant="light" size="lg" style={{ width: "fit-content" }}>
                  PRO ULTIMATE
                </Badge>
                <Group align="flex-end" gap={4}>
                  <Text size="28px" fw={800} c="#F9FAFB">₹10,000</Text>
                  <Text size="xs" c="gray.4" mb={4}>/ month</Text>
                </Group>
                <Divider my="xs" color="rgba(255, 255, 255, 0.08)" />
                <Stack gap={8}>
                  {[
                    "Everything in Basic",
                    "AI Image Generation Engine",
                    "Vision & Image Analysis",
                    "Priority Turbo GPU Speed",
                    "24/7 Dedicated Support"
                  ].map((feat, i) => (
                    <Group gap={8} key={i}>
                      <ThemeIcon color="yellow" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                      <Text size="xs" c="gray.3">{feat}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
              <Button
                color="yellow"
                c="dark"
                fullWidth
                mt="lg"
                radius="md"
                leftSection={<IconCrown size={16} />}
                onClick={() => handleSelectPlan("Pro Plan", "₹10,000")}
              >
                Upgrade to Pro
              </Button>
            </Card>
          </SimpleGrid>
        </Stack>
      </Modal>

      {/* Online Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        centered
        radius="lg"
        styles={{
          content: { background: "#111827", border: "1px solid #1F2937", color: "#F9FAFB" },
          header: { background: "#111827", color: "#F9FAFB" },
        }}
        title={
          <Group gap="xs">
            <IconCreditCard color="#2DD4BF" size={20} />
            <Text fw={600}>UPI Express Payment</Text>
          </Group>
        }
      >
        {selectedPlan && (
          <Stack align="center" gap="md">
            <Paper p="sm" bg="#1F2937" radius="md" style={{ width: "100%", textAlign: "center" }}>
              <Text size="xs" c="gray.4">Selected Subscription:</Text>
              <Text fw={700} size="lg" c="teal.4">{selectedPlan.name}</Text>
              <Text fw={800} size="xl" c="#F9FAFB">{selectedPlan.price}</Text>
            </Paper>

            <Paper p="md" bg="#FFFFFF" radius="lg" style={{ textAlign: "center" }}>
              <IconQrcode size={150} color="#000" />
              <Text size="xs" fw={700} c="#000" mt={4}>
                UPI ID: 8290400325@fam
              </Text>
            </Paper>

            <Button
              color="teal"
              fullWidth
              radius="md"
              component="a"
              href={`upi://pay?pa=8290400325@fam&pn=ChatGPTApp&am=${selectedPlan.price.replace(/[^0-9]/g, '')}&cu=INR`}
              target="_blank"
            >
              Pay Direct via UPI App
            </Button>

            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => {
                setPaymentModalOpen(false);
                alert("Payment verification request received! Instant activation processing.");
              }}
            >
              I have completed payment
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Modern Sidebar */}
      <Box
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100%",
          width: sidebarOpen ? (isMobile ? "280px" : "260px") : "0px",
          zIndex: 100,
          background: "#0D1117",
          borderRight: "1px solid #1F2937",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" h="100%" w={isMobile ? 280 : 260} p="md">
          {/* Top Brand Header */}
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="teal" variant="light">
                <IconBrandOpenai size={18} />
              </ThemeIcon>
              <Text fw={700} size="sm" c="#F9FAFB" style={{ letterSpacing: "0.5px" }}>
                AI WORKSPACE
              </Text>
            </Group>
            {isMobile && (
              <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(false)}>
                <IconX size={18} color="#9CA3AF" />
              </ActionIcon>
            )}
          </Group>

          <Button
            leftSection={<IconPlus size={16} />}
            variant="filled"
            color="teal"
            fullWidth
            radius="md"
            mb="md"
            onClick={createNewChat}
            style={{ boxShadow: "0 4px 12px rgba(20, 184, 166, 0.15)" }}
          >
            New Chat
          </Button>

          {/* Conversations History */}
          <Text size="11px" fw={700} c="gray.6" mb="xs" style={{ letterSpacing: "0.5px" }}>
            RECENT CHATS
          </Text>

          <ScrollArea style={{ flex: 1 }} scrollbars="y">
            <Stack gap={4}>
              {chats.map((chat) => {
                const isActive = activeChatId === chat.id;
                return (
                  <Paper
                    key={chat.id}
                    p="xs"
                    radius="md"
                    onClick={() => handleSelectChat(chat.id)}
                    style={{
                      cursor: "pointer",
                      background: isActive ? "rgba(20, 184, 166, 0.12)" : "transparent",
                      border: isActive ? "1px solid rgba(20, 184, 166, 0.3)" : "1px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap={10} style={{ overflow: "hidden", flex: 1 }}>
                        <IconMessage size={16} color={isActive ? "#2DD4BF" : "#6B7280"} />
                        <Text size="xs" fw={isActive ? 600 : 400} c={isActive ? "#F9FAFB" : "#9CA3AF"} truncate>
                          {chat.title}
                        </Text>
                      </Group>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={(e) => deleteChat(chat.id, e)}
                        style={{ opacity: isActive ? 1 : 0.4 }}
                      >
                        <IconTrash size={12} color="#EF4444" />
                      </ActionIcon>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </ScrollArea>

          <Divider my="sm" color="#1F2937" />

          {/* Bottom Profile Footer */}
          {user ? (
            <Paper p="xs" bg="#111827" radius="md" style={{ border: "1px solid #1F2937" }}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" style={{ overflow: "hidden" }}>
                  <Avatar color="teal" radius="xl" size="sm">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box style={{ overflow: "hidden" }}>
                    <Text size="xs" fw={600} c="#F9FAFB" truncate>
                      {user.name}
                    </Text>
                    <Badge color="teal" variant="dot" size="xs">
                      {user.plan || "Free"}
                    </Badge>
                  </Box>
                </Group>
                <ActionIcon size="sm" color="gray" variant="subtle" onClick={handleLogout} title="Logout">
                  <IconLogout size={16} color="#9CA3AF" />
                </ActionIcon>
              </Group>
            </Paper>
          ) : (
            <Stack gap={6}>
              <Button
                variant="outline"
                color="teal"
                size="xs"
                radius="md"
                leftSection={<IconLogin size={14} />}
                onClick={() => openAuth("login")}
              >
                Log In
              </Button>
              <Button
                variant="light"
                color="teal"
                size="xs"
                radius="md"
                leftSection={<IconUserPlus size={14} />}
                onClick={() => openAuth("signup")}
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Flex>
      </Box>

      {/* Main Chat Workspace */}
      <Flex direction="column" style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {/* Top Navbar */}
        <Group
          h={60}
          px="md"
          justify="space-between"
          style={{
            background: "#0D1117",
            borderBottom: "1px solid #1F2937",
          }}
        >
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen && !isMobile ? <IconX size={18} color="#9CA3AF" /> : <IconMenu2 size={18} color="#9CA3AF" />}
            </ActionIcon>
            <Group gap={8}>
              <ThemeIcon size="xs" color="teal" variant="light" radius="xl">
                <IconSparkles size={12} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="#F9FAFB" truncate>
                {activeChat.title}
              </Text>
            </Group>
          </Group>

          <Group gap="xs">
            <Button
              variant="light"
              color="yellow"
              size="xs"
              radius="xl"
              leftSection={<IconCrown size={14} />}
              onClick={() => setPricingModalOpen(true)}
            >
              Plans
            </Button>

            {user ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar color="teal" radius="xl" size={32} style={{ cursor: "pointer", border: "1px solid #2DD4BF" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown bg="#111827" style={{ borderColor: "#1F2937", }}>
                  <Menu.Label c="gray.5">{user.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconCrown size={14} color="#F59E0B" />}
                    onClick={() => setPricingModalOpen(true)}
                    style={{ color: "#F9FAFB" }}
                  >
                    Upgrade Plan
                  </Menu.Item>
                  <Menu.Divider color="#1F2937" />
                  <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button variant="filled" color="teal" size="xs" radius="md" onClick={() => openAuth("login")}>
                Sign In
              </Button>
            )}
          </Group>
        </Group>

        {/* Chat Messages Body */}
        <ScrollArea style={{ flex: 1 }} viewportRef={viewportRef}>
          <Box maw={800} mx="auto" p={isMobile ? "xs" : "md"} py={24}>
            {activeChat.messages.length === 0 ? (
              /* Empty State Hero Screen */
              <Flex direction="column" align="center" justify="center" mih={450} gap="lg" px="sm" ta="center">
                <Box
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(17, 24, 39, 0.8))",
                    border: "1px solid rgba(45, 212, 191, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 30px rgba(20, 184, 166, 0.15)",
                  }}
                >
                  <IconRobot size={38} color="#2DD4BF" />
                </Box>

                <Stack gap={4}>
                  <Text fw={700} size="xl" c="#F9FAFB">
                    Aapka Smart AI Partner Ready Hai
                  </Text>
                  <Text size="sm" c="gray.5" maw={480}>
                    Kuch bhi puchein, code likhwayein, ya custom image generate karein. 
                  </Text>
                </Stack>

                {/* Suggestion Quick Chips */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" w="100%" maw={580} mt="sm">
                  {[
                    { icon: IconCode, title: "Code Helper", text: "React component bug fix karke do" },
                    { icon: IconWand, title: "Image Generator", text: "Create a futuristic cyberpunk city image" },
                    { icon: IconBulb, title: "Creative Ideas", text: "New YouTube channel ke 5 catchy names" },
                    { icon: IconMessage, title: "Quick Explanation", text: "Quantum computing easy bhasha mein samjhao" },
                  ].map((card, idx) => (
                    <Paper
                      key={idx}
                      p="sm"
                      bg="#111827"
                      radius="md"
                      onClick={() => setInput(card.text)}
                      style={{
                        border: "1px solid #1F2937",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2DD4BF")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1F2937")}
                    >
                      <Group gap="xs">
                        <ThemeIcon color="teal" variant="light" size="sm">
                          <card.icon size={14} />
                        </ThemeIcon>
                        <Text size="xs" fw={600} c="#F9FAFB">
                          {card.title}
                        </Text>
                      </Group>
                      <Text size="xs" c="gray.5" mt={4} truncate>
                        "{card.text}"
                      </Text>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Flex>
            ) : (
              /* Message Bubbles */
              <Stack gap="lg">
                {activeChat.messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <Flex key={msg.id} justify={isUser ? "flex-end" : "flex-start"} gap="xs">
                      {!isUser && (
                        <Avatar color="teal" radius="xl" size={32} bg="#111827" style={{ border: "1px solid #1F2937" }}>
                          <IconRobot size={18} color="#2DD4BF" />
                        </Avatar>
                      )}

                      <Stack gap={4} style={{ maxWidth: "82%" }}>
                        <Paper
                          p="md"
                          radius="lg"
                          bg={isUser ? "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)" : "#111827"}
                          style={{
                            color: "#F9FAFB",
                            border: isUser ? "none" : "1px solid #1F2937",
                            boxShadow: isUser ? "0 4px 12px rgba(13, 148, 136, 0.2)" : "none",
                          }}
                        >
                          {/* Display User Uploaded Image */}
                          {msg.uploadedImageUrl && (
                            <Box mb="xs">
                              <MantineImage
                                src={msg.uploadedImageUrl}
                                radius="md"
                                alt="User Upload"
                                style={{ maxHeight: 200, objectFit: "cover" }}
                              />
                            </Box>
                          )}

                          {/* Display AI Generated Image */}
                          {msg.imageUrl ? (
                            <Stack gap="xs">
                              <MantineImage
                                src={msg.imageUrl}
                                radius="md"
                                alt="AI Generated"
                                style={{ maxHeight: 350, objectFit: "cover", cursor: "pointer" }}
                                onClick={() => setModalImage(msg.imageUrl || null)}
                              />
                              <Text size="xs" c="gray.4">
                                (Click image for full preview & download)
                              </Text>
                            </Stack>
                          ) : (
                            <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                              {msg.content}
                            </Text>
                          )}
                        </Paper>

                        {/* Copy / Action Buttons */}
                        {!isUser && msg.content && (
                          <Group gap={4} justify="flex-start" ml={4}>
                            <Tooltip label="Copy message">
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="gray"
                                onClick={() => navigator.clipboard.writeText(msg.content)}
                              >
                                <IconCopy size={12} color="#9CA3AF" />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        )}
                      </Stack>

                      {isUser && (
                        <Avatar color="teal" radius="xl" size={32}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : <IconUser size={18} />}
                        </Avatar>
                      )}
                    </Flex>
                  );
                })}

                {/* Loading State Indicator */}
                {isTyping && (
                  <Flex justify="flex-start" gap="xs" align="center">
                    <Avatar color="teal" radius="xl" size={32} bg="#111827" style={{ border: "1px solid #1F2937" }}>
                      <IconRobot size={18} color="#2DD4BF" />
                    </Avatar>
                    <Paper p="xs" px="md" radius="xl" bg="#111827" style={{ border: "1px solid #1F2937" }}>
                      <Group gap={6}>
                        <ThemeIcon size={8} radius="xl" color="teal" />
                        <Text size="xs" c="gray.4" fw={500}>
                          AI likh raha hai...
                        </Text>
                      </Group>
                    </Paper>
                  </Flex>
                )}

                {/* Error Banner */}
                {error && (
                  <Paper p="sm" bg="rgba(239, 68, 68, 0.1)" radius="md" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <Text size="xs" c="red.4" ta="center">
                      {error}
                    </Text>
                  </Paper>
                )}
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Floating Bottom Prompt Bar */}
        <Box p="md" bg="#0B0F17" style={{ borderTop: "1px solid #1F2937" }}>
          <Box maw={800} mx="auto">
            {/* Upload Image Preview Box */}
            {imagePreviewUrl && (
              <Paper p="xs" bg="#111827" radius="md" mb="xs" style={{ border: "1px solid #1F2937" }}>
                <Group justify="space-between">
                  <Group gap="xs">
                    <MantineImage src={imagePreviewUrl} h={40} w={40} radius="xs" style={{ objectFit: "cover" }} />
                    <Text size="xs" c="gray.3" truncate>
                      {selectedImage?.name}
                    </Text>
                  </Group>
                  <ActionIcon size="xs" color="gray" variant="subtle" onClick={clearSelectedImage}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              </Paper>
            )}

            <Paper
              p="xs"
              bg="#111827"
              radius="lg"
              style={{
                border: isImageMode ? "1px solid #F59E0B" : "1px solid #1F2937",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Textarea
                placeholder={isImageMode ? "Kaisa image generate karna hai detail likhein..." : "Kuch bhi poochhein..."}
                minRows={1}
                maxRows={5}
                autosize
                variant="unstyled"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                styles={{
                  input: {
                    color: "#F9FAFB",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    fontSize: "14px",
                  },
                }}
              />

              <Group justify="space-between" mt="xs" pt="xs" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <Group gap="xs">
                  {/* Image Generation Toggle */}
                  <Button
                    size="xs"
                    radius="xl"
                    variant={isImageMode ? "filled" : "light"}
                    color={isImageMode ? "yellow" : "gray"}
                    leftSection={<IconPhoto size={14} />}
                    onClick={() => setIsImageMode(!isImageMode)}
                  >
                    Image Mode
                  </Button>

                  {/* File Upload Button */}
                  <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
                    {(props) => (
                      <ActionIcon {...props} variant="subtle" color="gray" radius="xl" size="md">
                        <IconPaperclip size={18} color="#9CA3AF" />
                      </ActionIcon>
                    )}
                  </FileButton>
                </Group>

                {/* Send Button */}
                <ActionIcon
                  color={isImageMode ? "yellow" : "teal"}
                  variant="filled"
                  radius="xl"
                  size="md"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !selectedImage) || isTyping}
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            </Paper>

            <Text size="10px" c="gray.6" ta="center" mt="xs">
              AI galatiyan kar sakta hai. Import information double-check kar lein.
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}