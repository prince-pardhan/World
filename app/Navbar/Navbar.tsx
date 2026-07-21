"use client";

import React from "react";
import { Flex, Button, Title, Paper, } from "@mantine/core";
import { useRouter } from "next/navigation";
import Link from "next/link";

const HomePage = () => {
  const navigation = useRouter();

  return (
    <Flex
      direction="column"
      align="center"
      p={{ base: 15, md: 30 }}
      gap={30}
      mih="100vh"
      bg="#0d1117"
    >


      <Paper
        bg="#161b22"
        radius="xl"
        shadow="xl"
        p={{ base: 20, md: 30 }}
        w="100%"
        maw={1200}
      >
        <Flex
          wrap="wrap"
          gap="md"
          justify="center"
        >


          <Paper
            mt={40}
            bg="#161b22"
            radius="xl"
            shadow="xl"
            p={{ base: 25, md: 40 }}
            w="100%"
            maw={1200}
            style={{
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >


            <Flex
              direction="column"
              align="center"
              justify="center"
              gap={20}
              py={20}
            >
              <Title
                order={1}
                ta="center"
                fw={900}
                style={{
                  fontSize: "clamp(2rem,5vw,3.5rem)",
                  background: "linear-gradient(90deg,#38bdf8,#3b82f6,#8b5cf6)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Explore The World
              </Title>

              <Title
                order={4}
                ta="center"
                c="gray.3"
                fw={500}
                maw={750}
              >
                Discover the world's most beautiful countries, rich cultures,
                famous tourist attractions, history, economy, education and
                everything you need to know in one place.
              </Title>

              <Flex
                wrap="wrap"
                justify="center"
                gap="md"
                mt={15}
              >
                <Paper
                  p="md"
                  radius="xl"
                  bg="rgba(59,130,246,.15)"
                  style={{
                    border: "1px solid rgba(59,130,246,.35)",
                    minWidth: 180,
                  }}
                >
                  <Title order={3} c="cyan" ta="center">
                    20+
                  </Title>
                  <Title order={6} c="gray.2" ta="center">
                    Countries
                  </Title>
                </Paper>

                <Paper
                  p="md"
                  radius="xl"
                  bg="rgba(34,197,94,.15)"
                  style={{
                    border: "1px solid rgba(34,197,94,.35)",
                    minWidth: 180,
                  }}
                >
                  <Title order={3} c="green" ta="center">
                    100+
                  </Title>
                  <Title order={6} c="gray.2" ta="center">
                    Articles
                  </Title>
                </Paper>

                <Paper
                  p="md"
                  radius="xl"
                  bg="rgba(249,115,22,.15)"
                  style={{
                    border: "1px solid rgba(249,115,22,.35)",
                    minWidth: 180,
                  }}
                >
                  <Title order={3} c="orange" ta="center">
                    Travel
                  </Title>
                  <Title order={6} c="gray.2" ta="center">
                    Destination Guide
                  </Title>
                </Paper>

                <Paper
                  p="md"
                  radius="xl"
                  bg="rgba(168,85,247,.15)"
                  style={{
                    border: "1px solid rgba(168,85,247,.35)",
                    minWidth: 180,
                  }}
                >
                  <Title order={3} c="violet" ta="center">
                    Free
                  </Title>
                  <Title order={6} c="gray.2" ta="center">
                    Explore
                  </Title>
                </Paper>
              </Flex>
            </Flex>
          </Paper>






          <Button component={Link} href="/USA" size="lg" radius="xl" w={{ base: "100%", sm: 220 }}>Us America</Button>




          <Button size="lg" radius="xl" color="red" w={{ base: "100%", sm: 220 }} > Canada</Button>

          <Button size="lg" radius="xl" color="green" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/uk")}>United Kingdom</Button>

          <Button size="lg" radius="xl" color="orange" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/germany")}>🇩🇪 Germany</Button>

          <Button size="lg" radius="xl" color="cyan" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/france")}>🇫🇷 France</Button>

          <Button size="lg" radius="xl" color="violet" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/japan")}>🇯🇵 Japan</Button>

          <Button size="lg" radius="xl" color="pink" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/china")}>🇨🇳 China</Button>

          <Button size="lg" radius="xl" color="teal" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/india")}>🇮🇳 India</Button>

          <Button size="lg" radius="xl" color="yellow" c="black" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/australia")}>🇦🇺 Australia</Button>

          <Button size="lg" radius="xl" color="lime" c="black" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/brazil")}>🇧🇷 Brazil</Button>

          <Button size="lg" radius="xl" color="grape" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/italy")}>🇮🇹 Italy</Button>

          <Button size="lg" radius="xl" color="dark" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/russia")}>🇷🇺 Russia</Button>

          <Button size="lg" radius="xl" color="indigo" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/singapore")}>🇸🇬 Singapore</Button>

          <Button size="lg" radius="xl" color="blue" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/new-zealand")}>🇳🇿 New Zealand</Button>

          <Button size="lg" radius="xl" color="red" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/south-korea")}>🇰🇷 South Korea</Button>

          <Button size="lg" radius="xl" color="green" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/netherlands")}>🇳🇱 Netherlands</Button>

          <Button size="lg" radius="xl" color="orange" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/sweden")}>🇸🇪 Sweden</Button>

          <Button size="lg" radius="xl" color="cyan" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/switzerland")}>🇨🇭 Switzerland</Button>

          <Button size="lg" radius="xl" color="violet" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/norway")}>🇳🇴 Norway</Button>

          <Button size="lg" radius="xl" color="green" w={{ base: "100%", sm: 220 }} onClick={() => navigation.push("/country/uae")}>🇦🇪 UAE</Button>
        </Flex>
        <Flex
          wrap="wrap"
          justify="space-between"
          mt={20}
          gap={20}
        >
          <Paper
            radius="lg"
            p="lg"
            bg="#1f2937"
            style={{ flex: 1, minWidth: 220 }}
          >
            <Title order={4} c="cyan">
              🌎 20 Countries
            </Title>
            <p style={{ color: "#cbd5e1", marginTop: 10 }}>
              Discover the world's top countries with detailed information.
            </p>
          </Paper>

          <Paper
            radius="lg"
            p="lg"
            bg="#1f2937"
            style={{ flex: 1, minWidth: 220 }}
          >
            <Title order={4} c="green">
              📚 Easy Learning
            </Title>
            <p style={{ color: "#cbd5e1", marginTop: 10 }}>
              Learn about history, culture, economy and geography in one place.
            </p>
          </Paper>

          <Paper
            radius="lg"
            p="lg"
            bg="#1f2937"
            style={{ flex: 1, minWidth: 220 }}
          >
            <Title order={4} c="orange">
              ✈️ Travel Guide
            </Title>
            <p style={{ color: "#cbd5e1", marginTop: 10 }}>
              Explore famous tourist attractions and travel destinations.
            </p>
          </Paper>
        </Flex>
      </Paper>

    </Flex>

  );
};

export default HomePage;