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
    return [{ id: "1", title: "Naya Chat", messages: [] }];
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

  // Authentication States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");

  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    chats[0] || { id: "1", title: "Naya Chat", messages: [] };

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
      title: "Naya Chat",
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
        : [{ id: Date.now().toString(), title: "Naya Chat", messages: [] }];
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
      userProfile = { name: authForm.name, email: authForm.email };
    } else {
      userProfile = {
        name: authForm.name || authForm.email.split("@")[0],
        email: authForm.email,
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
            ? (currentInput || "Uploaded Image").slice(0, 25) +
            (currentInput.length > 25 ? "..." : "")
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
      setError(err.message || "Kuch galat ho gaya.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Flex h="100vh" bg="#090a0f" style={{ overflow: "hidden", position: "relative" }}>
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <Overlay
          color="#000"
          backgroundOpacity={0.8}
          style={{ zIndex: 99, backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fullscreen Image Preview Modal */}
      <Modal
        opened={!!modalImage}
        onClose={() => setModalImage(null)}
        centered
        size="lg"
        styles={{ content: { background: "#0e1117", color: "#f1f5f9", border: "1px solid #1e293b" } }}
        title="Image Preview"
      >
        {modalImage && (
          <Stack align="center" gap="md">
            <MantineImage src={modalImage} radius="md" alt="Preview Image" />
            <Button
              leftSection={<IconDownload size={16} />}
              color="white"
              variant="light"
              component="a"
              href={modalImage}
              download="ai-chat-image.png"
              target="_blank"
            >
              Download Image
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Auth Modal */}
      <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        centered
        radius="md"
        styles={{
          content: { background: "#0f172a", border: "1px solid rgba(0, 0, 0, 0.2)", color: "#f8fafc" },
          header: { background: "#0f172a", color: "#f8fafc" },
        }}
        title={
          <Group gap="xs">
            <IconMoonStars color="#2dd4bf" size={20} />
            <Text fw={600}>{authMode === "signup" ? "Account " : "Login "}</Text>
          </Group>
        }
      >
        <form onSubmit={handleAuthSubmit}>
          <Stack gap="sm">
            {authError && (
              <Paper p="xs" bg="rgba(239, 68, 68, 0.1)" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <Text size="xs" c="red.4">
                  {authError}
                </Text>
              </Paper>
            )}

            {authMode === "signup" && (
              <TextInput
                label="Aapka Naam"
                placeholder="Name..."
                leftSection={<IconUser size={16} color="white" />}
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                styles={{ input: { background: "#1e293b", color: "#fff", borderColor: "#334155" }, label: { color: "#cbd5e1" } }}
              />
            )}

            <TextInput
              label="Email Address"
              placeholder="Email..."
              type="email"
              leftSection={<IconMail size={16} color="white" />}
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
              styles={{ input: { background: "#1e293b", color: "#ffffff", borderColor: "#334155" }, label: { color: "#cbd5e1" } }}
            />

            <PasswordInput
              label="Password"
              placeholder="Password..."
              leftSection={<IconLock size={16} color="white" />}
              // leftSection={<IconLock size={16} />}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
              styles={{ input: { background: "#1e293b", color: "#fff", borderColor: "#334155" }, label: { color: "#cbd5e1" } }}
            />

            {authMode === "signup" && (
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm password..."
                leftSection={<IconLock size={16} color="white" />}
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                required
                styles={{ input: { background: "#1e293b", color: "#fff", borderColor: "#334155" }, label: { color: "#cbd5e1" } }}
              />
            )}

            <Button type="submit" color="teal" fullWidth mt="xs">
              {authMode === "signup" ? "Sign Up" : "Log In"}
            </Button>

            <Text size="xs" ta="center" c="gray.5" mt="xs">
              {authMode === "signup" ? "" : ""}{" "}
              <Text
                span
                c="teal.4"
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => {
                  setAuthError("");
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
              >
                {authMode === "signup" ? "Login " : "Sign Up "}
              </Text>
            </Text>
          </Stack>
        </form>
      </Modal>

      {/* Sidebar */}
      <Box
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100%",
          width: sidebarOpen ? (isMobile ? "280px" : "260px") : "0px",
          zIndex: 100,
          background: "#0d0f17",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "width 0.25s ease, transform 0.25s ease",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" h="100%" w={isMobile ? 280 : 260} p="md">
          <Group justify="space-between" mb="md">
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              color="teal"
              onClick={createNewChat}
              style={{ flex: 1, borderColor: "rgba(20, 184, 166, 0.3)" }}
            >
              New Chat
            </Button>
            {isMobile && (
              <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(false)}>
                <IconX size={18}  color="#fffdfd" />
              </ActionIcon>
            )}
          </Group>

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
                        ? "rgba(20, 184, 166, 0.12)"
                        : "transparent",
                    border:
                      activeChatId === chat.id
                        ? "1px solid rgba(20, 184, 166, 0.25)"
                        : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap={8} style={{ overflow: "hidden", flex: 1 }}>
                      <IconMessage size={16} color={activeChatId === chat.id ? "#00ffdd" : "#64748b"} />
                      <Text size="sm" c={activeChatId === chat.id ? "#f8fafc" : "#94a3b8"} truncate>
                        {chat.title}
                      </Text>
                    </Group>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="white"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <IconTrash size={12} color="#ffffff" />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Divider my="sm" color="rgba(239, 13, 13, 0.08)" />
          {user ? (
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
                <IconLogout size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <Group gap={8}>
              <Button
                variant="light"
                color="teal"
                size="xs"
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

      {/* Main Chat Content Area */}
      <Flex direction="column" style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        <Group
          h={56}
          px="md"
          justify="space-between"
          style={{
            background: "#090a0f",
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
            <Group gap={6}>
              <IconMoonStars size={16} color="#2dd4bf" />
              <Text fw={600} size="sm" c="#f1f5f9" truncate>
                {activeChat.title}
              </Text>
            </Group>
          </Group>

          <Group gap="xs">
            {user ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar color="teal" radius="xl" size={30} style={{ cursor: "pointer" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown bg="#0f172a" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#f8fafc" }}>
                  <Menu.Label c="gray.5">{user.email}</Menu.Label>
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
                <Button variant="filled" color="teal" size="xs" onClick={() => openAuth("signup")}>
                  Sign Up
                </Button>
              </Group>
            )}
          </Group>
        </Group>

        <ScrollArea style={{ flex: 1 }} viewportRef={viewportRef}>
          <Box maw={750} mx="auto" p={isMobile ? "xs" : "md"} py={20}>
            {activeChat.messages.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                mih={320}
                gap="sm"
                px="sm"
                ta="center"
              >
                <Box
                  style={{
                    position: "relative",
                    width: isMobile ? 64 : 72,
                    height: isMobile ? 64 : 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(15, 23, 42, 0.8))",
                    border: "1px solid rgba(45, 212, 191, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 25px rgba(20, 184, 166, 0.25)",
                  }}
                >
                  <IconRobot size={isMobile ? 32 : 38} color="#2dd4bf" />
                </Box>

                <Text fw={600} size={isMobile ? "md" : "lg"} c="#f8fafc">
                  AI Assistant
                </Text>
              </Flex>
            ) : (
              <Stack gap="md">
                {activeChat.messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    justify={msg.role === "user" ? "flex-end" : "flex-start"}
                    gap={isMobile ? "xs" : "sm"}
                  >
                    {msg.role === "assistant" && (
                      <Avatar
                        radius="xl"
                        color="teal"
                        size={isMobile ? 28 : 32}
                        mt={2}
                      >
                        <IconSparkles size={isMobile ? 14 : 16} color="white" />
                      </Avatar>
                    )}
                    <Paper
                      p={isMobile ? "xs" : "sm"}
                      radius="lg"
                      maw={isMobile ? "88%" : "80%"}
                      style={{
                        background:
                          msg.role === "user" ? "#1e293b" : "#0f172a",
                        color: "#f8fafc",
                        border:
                          msg.role === "user"
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "1px solid rgba(20, 184, 166, 0.15)",
                      }}
                    >
                      {msg.uploadedImageUrl && (
                        <Box mb={msg.content ? "xs" : 0}>
                          <MantineImage
                            src={msg.uploadedImageUrl}
                            alt="Uploaded visual"
                            radius="md"
                            color="white"
                            style={{ cursor: "pointer", maxHeight: "250px", objectFit: "cover" }}
                            onClick={() => setModalImage(msg.uploadedImageUrl || null)}
                          />
                        </Box>
                      )}

                      {msg.content && (
                        <Text
                          size={isMobile ? "xs" : "sm"}
                          style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#e2e8f0" }}
                        >
                          {msg.content}
                        </Text>
                      )}

                      {msg.type === "image" && msg.imageUrl && (
                        <Box mt="xs">
                          <MantineImage
                            src={msg.imageUrl}
                            alt="Generated AI Image"
                            radius="md"
                            style={{ cursor: "pointer", maxHeight: "300px", objectFit: "cover" }}
                            onClick={() => setModalImage(msg.imageUrl || null)}
                          />
                        </Box>
                      )}

                      {msg.role === "assistant" && (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          mt={4}
                          onClick={() =>
                            navigator.clipboard.writeText(msg.content)
                          }
                        >
                          <IconCopy size={12}  color="white"/>
                        </ActionIcon>
                      )}
                    </Paper>
                  </Flex>
                ))}

                {isTyping && (
                  <Text size="xs" c="teal.4" ml={isMobile ? 36 : 44}>
                    {isImageMode ? "AI Image generate kar raha hai..." : "AI response type kar raha hai..."}
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Input Bar */}
        <Box p={isMobile ? "xs" : "md"}>
          <Box maw={750} mx="auto">
            {error && (
              <Text size="xs" c="red.4" mb={4} ta="center">
                {error}
              </Text>
            )}

            {imagePreviewUrl && (
              <Box mb="xs" style={{ position: "relative", width: "fit-content" }}>
                <Paper p={2} radius="md" bg="#0f172a" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <MantineImage src={imagePreviewUrl} h={60} w={60} radius="sm" alt="Upload thumbnail" />
                </Paper>
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="filled"
                  radius="xl"
                  style={{ position: "absolute", top: -6, right: -6 }}
                  onClick={clearSelectedImage}
                >
                  <IconX size={10} color="white" />
                </ActionIcon>
              </Box>
            )}

            {isImageMode && (
              <Group mb={6} justify="flex-start">
                <Badge
                  variant="filled"
                  color="teal"
                  style={{ boxShadow: "0 0 10px rgba(20, 184, 166, 0.3)" }}
                  leftSection={<IconPhoto size={12} />}
                  rightSection={
                    <ActionIcon size="xs" color="teal" radius="xl" variant="transparent" onClick={() => setIsImageMode(false)}>
                      <IconX size={10} color="white" />
                    </ActionIcon>
                  }
                >
                  Image Create Mode Active
                </Badge>
              </Group>
            )}

            <Paper
              p={4}
              radius="xl"
              style={{
                background: "#0f172a",
                border: isImageMode ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isImageMode ? "0 0 12px rgba(20, 184, 166, 0.25)" : "none",
                transition: "all 0.25s ease",
              }}
            >
              <Group gap={6} wrap="nowrap" align="flex-end">
                <FileButton onChange={handleFileChange} accept="image/*">
                  {(props) => (
                    <ActionIcon
                      {...props}
                      size={34}
                      radius="xl"
                      color="gray"
                      variant="subtle"
                      mb={2}
                      ml={2}
                      title="Upload Image"
                    >
                      <IconPaperclip size={18}  color="white"/>
                    </ActionIcon>
                  )}
                </FileButton>

                <ActionIcon
                  size={34}
                  radius="xl"
                  color={isImageMode ? "teal" : "gray"}
                  variant={isImageMode ? "filled" : "subtle"}
                  onClick={() => setIsImageMode(!isImageMode)}
                  mb={2}
                  title="Image Generate Mode"
                >
                  <IconPhoto size={18}  color="white"/>
                </ActionIcon>

                <Textarea
                  placeholder={
                    isImageMode
                      ? "type ..."
                      : "type..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  autosize
                  minRows={1}
                  maxRows={4}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      color: "#f8fafc",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      fontSize: isMobile ? "14px" : "15px",
                    },
                  }}
                />

                <ActionIcon
                  size={34}
                  radius="xl"
                  color="teal"
                  variant="filled"
                  disabled={(!input.trim() && !selectedImage) || isTyping}
                  onClick={sendMessage}
                  mb={2}
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