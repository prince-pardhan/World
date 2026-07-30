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
  IconChecklist,
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

// Helper: Convert File to Base64 String
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

  // Chats State with LocalStorage persistence
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Authentication & Subscription States
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

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const currentInput = input.trim();
    let base64Image = "";

    if (selectedImage) {
      try {
        base64Image = await convertFileToBase64(selectedImage);
      } catch (err) {
        setError("Image read karne mein error aaya.");
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
        content: data.reply || (data.imageUrl ? "Aapki image generate ho gayi hai:" : ""),
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
      setError(err.message || "Kuch galat ho gaya.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Flex h="100vh" bg="#05070a" style={{ overflow: "hidden", position: "relative", fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <Overlay
          color="#000"
          backgroundOpacity={0.7}
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
          content: { background: "#0b0f19", color: "#f1f5f9", border: "1px solid rgba(255, 255, 255, 0.1)" },
          header: { background: "#0b0f19", color: "#f1f5f9" },
        }}
        title="Image View"
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
              radius="xl"
            >
              Download High Res
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
          content: { background: "#0b0f19", border: "1px solid rgba(20, 184, 166, 0.2)", color: "#f8fafc" },
          header: { background: "#0b0f19", color: "#f8fafc" },
        }}
        title={
          <Group gap="xs">
            <ThemeIcon color="teal" variant="light" radius="xl">
              <IconSparkles size={18} />
            </ThemeIcon>
            <Text fw={700}>{authMode === "signup" ? "Create Your Account" : "Welcome Back"}</Text>
          </Group>
        }
      >
        <form onSubmit={handleAuthSubmit}>
          <Stack gap="sm">
            {authError && (
              <Paper p="xs" radius="md" bg="rgba(239, 68, 68, 0.1)" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <Text size="xs" c="red.4">
                  {authError}
                </Text>
              </Paper>
            )}

            {authMode === "signup" && (
              <TextInput
                label="Full Name"
                placeholder="Rahul Swami"
                leftSection={<IconUser size={16} color="#0d9488" />}
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                styles={{ input: { background: "#111827", color: "#fff", borderColor: "rgba(255,255,255,0.1)" }, label: { color: "#94a3b8" } }}
              />
            )}

            <TextInput
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              leftSection={<IconMail size={16} color="#0d9488" />}
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
              styles={{ input: { background: "#111827", color: "#ffffff", borderColor: "rgba(255,255,255,0.1)" }, label: { color: "#94a3b8" } }}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              leftSection={<IconLock size={16} color="#0d9488" />}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
              styles={{ input: { background: "#111827", color: "#fff", borderColor: "rgba(255,255,255,0.1)" }, label: { color: "#94a3b8" } }}
            />

            {authMode === "signup" && (
              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                leftSection={<IconLock size={16} color="#0d9488" />}
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                required
                styles={{ input: { background: "#111827", color: "#fff", borderColor: "rgba(255,255,255,0.1)" }, label: { color: "#94a3b8" } }}
              />
            )}

            <Button type="submit" color="teal" fullWidth radius="md" mt="xs">
              {authMode === "signup" ? "Sign Up" : "Log In"}
            </Button>

            <Text size="xs" ta="center" c="gray.5" mt="xs">
              <Text
                span
                c="teal.4"
                style={{ cursor: "pointer", textDecoration: "none" }}
                onClick={() => {
                  setAuthError("");
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
              >
                {authMode === "signup" ? "Pehle se account hai? Login" : "Naya account banayein"}
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
          content: { background: "#0b0f19", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#f8fafc" },
          header: { background: "#0b0f19", color: "#f8fafc" },
        }}
        title={
          <Group gap="xs">
            <IconCrown color="#f59e0b" size={24} />
            <Text fw={700} size="lg">Upgrade Plan</Text>
          </Group>
        }
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Basic Plan */}
            <Card
              shadow="md"
              padding="lg"
              radius="lg"
              style={{
                background: "#111827",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Stack gap="xs">
                <Badge color="teal" variant="light" size="lg" style={{ width: "fit-content" }}>
                  BASIC PLAN
                </Badge>
                <Group align="flex-end" gap={4}>
                  <Text size="30px" fw={800} c="#f8fafc">₹5,000</Text>
                  <Text size="xs" c="gray.4" mb={4}>/ month</Text>
                </Group>
                <Divider my="xs" color="rgba(255, 255, 255, 0.08)" />
                <Stack gap={10}>
                  <Group gap={8}>
                    <ThemeIcon color="teal" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Unlimited Text Messaging</Text>
                  </Group>
                  <Group gap={8}>
                    <ThemeIcon color="teal" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Standard Speed Responses</Text>
                  </Group>
                  <Group gap={8}>
                    <ThemeIcon color="teal" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Chat History Persistence</Text>
                  </Group>
                </Stack>
              </Stack>
              <Button
                color="teal"
                fullWidth
                radius="md"
                mt="lg"
                onClick={() => handleSelectPlan("Basic Plan", "₹5,000")}
              >
                Choose Basic
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card
              shadow="md"
              padding="lg"
              radius="lg"
              style={{
                background: "linear-gradient(160deg, #111827 0%, #0d1527 100%)",
                border: "2px solid #f59e0b",
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
                  PRO PLAN
                </Badge>
                <Group align="flex-end" gap={4}>
                  <Text size="30px" fw={800} c="#f8fafc">₹10,000</Text>
                  <Text size="xs" c="gray.4" mb={4}>/ month</Text>
                </Group>
                <Divider my="xs" color="rgba(255, 255, 255, 0.08)" />
                <Stack gap={10}>
                  <Group gap={8}>
                    <ThemeIcon color="yellow" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Sabhi Basic Features</Text>
                  </Group>
                  <Group gap={8}>
                    <ThemeIcon color="yellow" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">AI Image Generation Mode</Text>
                  </Group>
                  <Group gap={8}>
                    <ThemeIcon color="yellow" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Image Vision & Uploads Analysis</Text>
                  </Group>
                  <Group gap={8}>
                    <ThemeIcon color="yellow" size={18} radius="xl"><IconCheck size={12} /></ThemeIcon>
                    <Text size="xs" c="gray.3">Priority High-Speed Access</Text>
                  </Group>
                </Stack>
              </Stack>
              <Button
                color="yellow"
                c="dark"
                fullWidth
                radius="md"
                mt="lg"
                leftSection={<IconCrown size={16} />}
                onClick={() => handleSelectPlan("Pro Plan", "₹10,000")}
              >
                Choose Pro
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
          content: { background: "#0b0f19", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#f8fafc" },
          header: { background: "#0b0f19", color: "#f8fafc" },
        }}
        title={
          <Group gap="xs">
            <IconCreditCard color="#2dd4bf" size={20} />
            <Text fw={600}>Payment Gateway</Text>
          </Group>
        }
      >
        {selectedPlan && (
          <Stack align="center" gap="md">
            <Paper p="sm" bg="#111827" radius="md" style={{ width: "100%", textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Text size="xs" c="gray.4">Selected Plan:</Text>
              <Text fw={700} size="lg" c="teal.4">{selectedPlan.name}</Text>
              <Text fw={800} size="xl" c="#f8fafc">{selectedPlan.price}</Text>
            </Paper>

            <Text size="xs" c="gray.4" ta="center">
              Scan QR code or use the UPI ID below to pay:
            </Text>

            <Paper p="md" bg="#ffffff" radius="lg" style={{ textAlign: "center" }}>
              <IconQrcode size={150} color="#000000" />
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
              Pay via UPI App Directly
            </Button>

            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => {
                setPaymentModalOpen(false);
                alert("Payment Request Received! Plan activation verification in progress.");
              }}
            >
              I have completed the payment
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Sidebar Navigation */}
      <Box
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100%",
          width: sidebarOpen ? (isMobile ? "280px" : "270px") : "0px",
          zIndex: 100,
          background: "#080c14",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "width 0.25s ease, transform 0.25s ease",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" h="100%" w={isMobile ? 280 : 270} p="md">
          <Group justify="space-between" mb="md">
            <Button
              leftSection={<IconPlus size={16} />}
              variant="gradient"
              gradient={{ from: "teal", to: "blue",  }}
              onClick={createNewChat}
              style={{ flex: 1 }}
              radius="md"
            >
              New Chat
            </Button>
            {isMobile && (
              <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(false)}>
                <IconX size={18} color="#fffdfd" />
              </ActionIcon>
            )}
          </Group>

          <Text size="xs" fw={600} c="gray.6" mb={8} px="xs" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Chat History
          </Text>

          <ScrollArea style={{ flex: 1 }}>
            <Stack gap={6}>
              {chats.map((chat) => (
                <Paper
                  key={chat.id}
                  p="xs"
                  radius="md"
                  onClick={() => handleSelectChat(chat.id)}
                  style={{
                    cursor: "pointer",
                    background:
                      activeChatId === chat.id
                        ? "rgba(20, 184, 166, 0.1)"
                        : "transparent",
                    border:
                      activeChatId === chat.id
                        ? "1px solid rgba(20, 184, 166, 0.25)"
                        : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap={10} style={{ overflow: "hidden", flex: 1 }}>
                      <IconMessage size={16} color={activeChatId === chat.id ? "#2dd4bf" : "#475569"} />
                      <Text size="sm" c={activeChatId === chat.id ? "#f8fafc" : "#94a3b8"} truncate fw={activeChatId === chat.id ? 600 : 400}>
                        {chat.title}
                      </Text>
                    </Group>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <IconTrash size={13} color="#64748b" />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Divider my="sm" color="rgba(255, 255, 255, 0.05)" />
          
          {user ? (
            <Paper p="xs" radius="md" bg="#0f172a" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs">
                  <Avatar color="teal" radius="xl" size="sm">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box style={{ overflow: "hidden" }}>
                    <Text size="xs" fw={600} c="#f8fafc" truncate>
                      {user.name}
                    </Text>
                    <Text size="10px" c="gray.5" truncate>
                      {user.email}
                    </Text>
                  </Box>
                </Group>
                <ActionIcon size="sm" color="gray" variant="subtle" onClick={handleLogout} title="Logout">
                  <IconLogout size={16} color="#ef4444" />
                </ActionIcon>
              </Group>
            </Paper>
          ) : (
            <Group gap={8}>
              <Button
                variant="light"
                color="teal"
                size="xs"
                radius="md"
                style={{ flex: 1 }}
                leftSection={<IconLogin size={14} />}
                onClick={() => openAuth("login")}
              >
                Log In
              </Button>
              <Button
                variant="filled"
                color="teal"
                size="xs"
                radius="md"
                style={{ flex: 1 }}
                leftSection={<IconUserPlus size={14} />}
                onClick={() => openAuth("signup")}
              >
                Sign Up
              </Button>
            </Group>
          )}
        </Flex>
      </Box>

      {/* Main Container */}
      <Flex direction="column" style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {/* Top Navbar Header */}
        <Group
          h={60}
          px="md"
          justify="space-between"
          style={{
            background: "#080c14",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen && !isMobile ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </ActionIcon>
            <Group gap={8}>
              <ThemeIcon variant="gradient" gradient={{ from: "teal", to: "cyan" }} size="sm" radius="md">
                <IconRobot size={14} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="#f1f5f9" truncate>
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
              Pro Plans
            </Button>
            {user ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar color="teal" radius="xl" size={32} style={{ cursor: "pointer", border: "1px solid #2dd4bf" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown bg="#0f172a" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#f8fafc" }}>
                  <Menu.Label c="gray.5">{user.email}</Menu.Label>
                  <Menu.Item style={{ color: "#f8fafc" }}
                    leftSection={<IconCrown size={14} color="#f59e0b" />}
                    onClick={() => setPricingModalOpen(true)}
                  >
                    Upgrade Plan
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap={6}>
                <Button variant="subtle" color="teal" size="xs" onClick={() => openAuth("login")}>
                  Log In
                </Button>
                <Button variant="filled" color="teal" size="xs" radius="md" onClick={() => openAuth("signup")}>
                  Sign Up
                </Button>
              </Group>
            )}
          </Group>
        </Group>

        {/* Message Stream Area */}
        <ScrollArea style={{ flex: 1 }} viewportRef={viewportRef}>
          <Box maw={800} mx="auto" p={isMobile ? "xs" : "md"} py={24}>
            {activeChat.messages.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                mih={380}
                gap="md"
                px="sm"
                ta="center"
              >
                <Box
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "24px",
                    background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(59, 130, 246, 0.1))",
                    border: "1px solid rgba(45, 212, 191, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 30px rgba(20, 184, 166, 0.15)",
                  }}
                >
                  <IconRobot size={36} color="#2dd4bf" />
                </Box>

                <Stack gap={4} align="center">
                  <Text fw={700} size="xl" c="#f8fafc">
                    How can I assist you today?
                  </Text>
                  <Text size="sm" c="gray.5" maw={450}>
                    Ask questions, create images, analyze uploads or write code effortlessly.
                  </Text>
                </Stack>
              </Flex>
            ) : (
              <Stack gap="lg">
                {activeChat.messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    justify={msg.role === "user" ? "flex-end" : "flex-start"}
                    gap="sm"
                  >
                    {msg.role === "assistant" && (
                      <Avatar
                        radius="md"
                        color="teal"
                        variant="filled"
                        size={32}
                      >
                        <IconRobot size={18} />
                      </Avatar>
                    )}

                    <Box style={{ maxWidth: "85%" }}>
                      <Paper
                        p="md"
                        radius="lg"
                        style={{
                          background:
                            msg.role === "user"
                              ? "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
                              : "#0f172a",
                          color: "#f8fafc",
                          border:
                            msg.role === "user"
                              ? "none"
                              : "1px solid rgba(255, 255, 255, 0.08)",
                          boxShadow:
                            msg.role === "user"
                              ? "0 4px 14px rgba(13, 148, 136, 0.25)"
                              : "none",
                        }}
                      >
                        {msg.uploadedImageUrl && (
                          <MantineImage
                            src={msg.uploadedImageUrl}
                            alt="Uploaded visual"
                            radius="md"
                            mb="sm"
                            style={{ maxHeight: 250, objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setModalImage(msg.uploadedImageUrl || null)}
                          />
                        )}

                        {msg.type === "image" && msg.imageUrl ? (
                          <Stack gap="xs">
                            <MantineImage
                              src={msg.imageUrl}
                              alt="AI Output"
                              radius="md"
                              style={{ maxHeight: 350, objectFit: "cover", cursor: "pointer" }}
                              onClick={() => setModalImage(msg.imageUrl || null)}
                            />
                            <Text size="xs" c="gray.4">{msg.content}</Text>
                          </Stack>
                        ) : (
                          <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                            {msg.content}
                          </Text>
                        )}
                      </Paper>

                      {msg.role === "assistant" && (
                        <Group justify="flex-start" gap={4} mt={4}>
                          <Tooltip label={copiedId === msg.id ? "Copied!" : "Copy response"} position="bottom" withArrow>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="gray"
                              onClick={() => handleCopyText(msg.id, msg.content)}
                            >
                              {copiedId === msg.id ? <IconCheck size={14} color="#2dd4bf" /> : <IconCopy size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      )}
                    </Box>

                    {msg.role === "user" && user && (
                      <Avatar color="teal" radius="md" size={32}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </Flex>
                ))}

                {isTyping && (
                  <Flex justify="flex-start" gap="sm" align="center">
                    <Avatar radius="md" color="teal" variant="filled" size={32}>
                      <IconRobot size={18} />
                    </Avatar>
                    <Paper p="sm" radius="lg" bg="#0f172a" style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <Text size="xs" c="teal.4">AI is thinking...</Text>
                    </Paper>
                  </Flex>
                )}
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Input Textarea Dock */}
        <Box p="md" style={{ background: "#080c14", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <Box maw={800} mx="auto">
            {error && (
              <Text size="xs" c="red.4" mb="xs" ta="center">
                {error}
              </Text>
            )}

            {imagePreviewUrl && (
              <Group mb="xs" style={{ position: "relative", width: "fit-content" }}>
                <Paper p={4} radius="md" bg="#1e293b" style={{ border: "1px solid #2dd4bf" }}>
                  <MantineImage src={imagePreviewUrl} h={50} w={50} radius="xs" fit="cover" alt="Upload preview" />
                </Paper>
                <ActionIcon
                  size="xs"
                  color="red"
                  radius="xl"
                  variant="filled"
                  style={{ position: "absolute", top: -6, right: -6 }}
                  onClick={clearSelectedImage}
                >
                  <IconX size={10} />
                </ActionIcon>
              </Group>
            )}

            <Paper
              p="xs"
              radius="lg"
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Textarea
                placeholder={isImageMode ? "Describe the image you want to create..." : "Type your message..."}
                minRows={1}
                maxRows={4}
                autosize
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
                    background: "transparent",
                    border: "none",
                    color: "#f8fafc",
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: "14px",
                  },
                }}
              />

              <Group justify="space-between" mt="xs" px={4}>
                <Group gap={6}>
                  <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
                    {(props) => (
                      <Tooltip label="Upload image" position="top">
                        <ActionIcon {...props} variant="subtle" color="gray" radius="md">
                          <IconPaperclip size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </FileButton>

                  <Tooltip label={isImageMode ? "Switch to Text Mode" : "Switch to Image Generator"} position="top">
                    <ActionIcon
                      variant={isImageMode ? "filled" : "subtle"}
                      color={isImageMode ? "yellow" : "gray"}
                      radius="md"
                      onClick={() => setIsImageMode(!isImageMode)}
                    >
                      <IconPhoto size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <ActionIcon
                  variant="gradient"
                  gradient={{ from: "teal", to: "cyan" }}
                  radius="md"
                  size="md"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !selectedImage) || isTyping}
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}