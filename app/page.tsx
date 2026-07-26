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
} from "@tabler/icons-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatGPTApp() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", title: "Naya Chat", messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState("1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Desktop screen par sidebar default open rakhein
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Auto Scroll
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeChat?.messages, isTyping]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "Naya Chat",
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setInput("");
    setError("");
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

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...activeChat.messages, userMessage];

    // UI update
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChatId) return chat;
        const title =
          chat.messages.length === 0
            ? input.trim().slice(0, 25) + (input.length > 25 ? "..." : "")
            : chat.title;
        return { ...chat, title, messages: updatedMessages };
      })
    );

    setInput("");
    setIsTyping(true);
    setError("");

    try {
      // Backend API call
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server response error");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
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
    <Flex h="100vh" bg="#1e1e1e" style={{ overflow: "hidden", position: "relative" }}>
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <Overlay
          color="#000"
          backgroundOpacity={0.6}
          style={{ zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Box
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100%",
          width: sidebarOpen ? (isMobile ? "280px" : "260px") : "0px",
          zIndex: 100,
          background: "#141414",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transition: "width 0.25s ease, transform 0.25s ease",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" h="100%" w={isMobile ? 280 : 260} p="md">
          <Group justify="space-between" mb="md">
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              color="gray"
              onClick={createNewChat}
              style={{ flex: 1 }}
            >
              New Chat
            </Button>
            {isMobile && (
              <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(false)}>
                <IconX size={18} />
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
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap={8} style={{ overflow: "hidden", flex: 1 }}>
                      <IconMessage size={16} color="#aaa" />
                      <Text size="sm" c="#eee" truncate>
                        {chat.title}
                      </Text>
                    </Group>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Flex>
      </Box>

      {/* Main Chat Area */}
      <Flex direction="column" style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {/* Top Header */}
        <Group
          h={56}
          px="md"
          justify="space-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen && !isMobile ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </ActionIcon>
            <Text fw={600} size="sm" c="#eee" truncate >
              {activeChat.title}
            </Text>
          </Group>

          <ActionIcon
            variant="light"
            color="teal"
            radius="xl"
            onClick={createNewChat}
            hiddenFrom="xs"
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        {/* Messages Container */}
        <ScrollArea style={{ flex: 1 }} viewportRef={viewportRef}>
          <Box maw={750} mx="auto" p={isMobile ? "xs" : "md"} py={20}>
            {activeChat.messages.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                mih={300}
                gap="sm"
                px="sm"
                ta="center"
              >
                <Avatar size={isMobile ? 40 : 50} radius="xl" color="teal">
                  <IconSparkles size={isMobile ? 20 : 24} />
                </Avatar>
                <Text fw={600} size={isMobile ? "md" : "lg"} c="#fff">
                 Ai
                </Text>
                <Text size="sm" c="dimmed">
                  
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
                        <IconSparkles size={isMobile ? 14 : 16} />
                      </Avatar>
                    )}
                    <Paper
                      p={isMobile ? "xs" : "sm"}
                      radius="lg"
                      maw={isMobile ? "88%" : "80%"}
                      style={{
                        background:
                          msg.role === "user" ? "#2b2b2b" : "#1e293b",
                        color: "#fff",
                      }}
                    >
                      <Text
                        size={isMobile ? "xs" : "sm"}
                        style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                      >
                        {msg.content}
                      </Text>
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
                          <IconCopy size={12} />
                        </ActionIcon>
                      )}
                    </Paper>
                  </Flex>
                ))}

                {isTyping && (
                  <Text size="xs" c="dimmed" ml={isMobile ? 36 : 44}>
                    AI type kar raha hai...
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Input Area */}
        <Box p={isMobile ? "xs" : "md"}>
          <Box maw={750} mx="auto">
            {error && (
              <Text size="xs" c="red" mb={4} ta="center">
                {error}
              </Text>
            )}
            <Paper
              p={4}
              radius="xl"
              style={{
                background: "#2b2b2b",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Group gap="xs" wrap="nowrap" align="flex-end">
                <Textarea
                  placeholder="Ask anything..."
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
                      color: "#fff",
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
                  disabled={!input.trim() || isTyping}
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