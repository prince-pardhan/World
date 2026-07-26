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
  Badge,
  Paper,
} from "@mantine/core";
import {
  IconPlus,
  IconSend,
  IconTrash,
  IconMessage,
  IconSparkles,
  IconMenu2,
  IconX,
  IconCopy,
  IconRobot,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", title: "Naya Chat", messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState("1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

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
            ? input.trim().slice(0, 30) + (input.length > 30 ? "..." : "")
            : chat.title;
        return { ...chat, title, messages: updatedMessages };
      })
    );

    setInput("");
    setIsTyping(true);
    setError("");

    try {
      // Internal Secure Backend API call
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
    <Flex h="100vh" bg="#1e1e1e" style={{ overflow: "hidden" }}>
      {/* Sidebar */}
      <Box
        w={sidebarOpen ? 260 : 0}
        style={{
          background: "#141414",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" h="100%" w={260} p="md">
          <Button
            leftSection={<IconPlus size={16} />}
            variant="outline"
            color="gray"
            onClick={createNewChat}
            mb="md"
            fullWidth
          >
            New Chat
          </Button>

          <ScrollArea style={{ flex: 1 }}>
            <Stack gap={4}>
              {chats.map((chat) => (
                <Paper
                  key={chat.id}
                  p="xs"
                  radius="md"
                  onClick={() => setActiveChatId(chat.id)}
                  style={{
                    cursor: "pointer",
                    background:
                      activeChatId === chat.id
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap={8} style={{ overflow: "hidden" }}>
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
      <Flex direction="column" style={{ flex: 1 }}>
        {/* Header */}
        <Group h={56} px="md" justify="space-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </ActionIcon>
            <Text fw={600} c="#fff">
              OpenAI Assistant
            </Text>
          </Group>

          <Badge variant="light" color="teal" leftSection={<IconRobot size={12} />}>
            GPT-4o-mini
          </Badge>
        </Group>

        {/* Messages */}
        <ScrollArea style={{ flex: 1 }} viewportRef={viewportRef}>
          <Box maw={750} mx="auto" p="md" py={30}>
            {activeChat.messages.length === 0 ? (
              <Flex direction="column" align="center" justify="center" mih={300} gap="sm">
                <Avatar size={50} radius="xl" color="teal">
                  <IconSparkles size={24} />
                </Avatar>
                <Text fw={600} size="lg" c="#fff">
                  Aapka OpenAI Assistant Ready Hai
                </Text>
                <Text size="sm" c="dimmed">
                  Kuch bhi puchho, ye turant reply karega.
                </Text>
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
                      <Avatar radius="xl" color="teal" size={32}>
                        <IconSparkles size={16} />
                      </Avatar>
                    )}
                    <Paper
                      p="sm"
                      radius="lg"
                      maw="80%"
                      style={{
                        background: msg.role === "user" ? "#2b2b2b" : "#1e293b",
                        color: "#fff",
                      }}
                    >
                      <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {msg.content}
                      </Text>
                      {msg.role === "assistant" && (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          mt={4}
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                        >
                          <IconCopy size={12} />
                        </ActionIcon>
                      )}
                    </Paper>
                  </Flex>
                ))}

                {isTyping && (
                  <Text size="sm" c="dimmed">
                    AI type kar raha hai...
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Input Area */}
        <Box p="md">
          <Box maw={750} mx="auto">
            {error && (
              <Text size="xs" c="red" mb={4} ta="center">
                {error}
              </Text>
            )}
            <Paper p={6} radius="xl" style={{ background: "#2b2b2b", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Group gap="xs" wrap="nowrap">
                <Textarea
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  autosize
                  minRows={1}
                  maxRows={5}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                    },
                  }}
                />
                <ActionIcon
                  size={36}
                  radius="xl"
                  color="teal"
                  variant="filled"
                  disabled={!input.trim() || isTyping}
                  onClick={sendMessage}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}