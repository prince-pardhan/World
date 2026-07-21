"use client";

import React, { useState } from "react";
import {
  Card,
  Text,
  Box,
  SimpleGrid,
  Group,
  Avatar,
  Image,
  Badge,
  ActionIcon,
  TextInput,
  Button,
  Tabs,
  Container,
  Title,
  Grid,
  Modal,
  Divider,
  ScrollArea,
} from "@mantine/core";

import {
  IconEye,
  IconHeart,
  IconShare,
  IconTrendingUp,
  IconSearch,
  IconBell,
  IconBookmark,
  IconMail,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
  IconArrowRight,
  IconClock,
  IconUser,
} from "@tabler/icons-react";

// News Article Data Structure
interface Article {
  id: string;
  image: string;
  title: string;
  category: string;
  user: string;
  views: string;
  likes: string;
  time: string;
  excerpt: string;
  content: string[];
}

const NewsPortal = () => {
  const [activeTab, setActiveTab] = useState<string | null>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const featuredPost: Article = {
    id: "featured-1",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg/330px-Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg.png",
    title: "USA Best Tourist Places to Visit in 2026: A Comprehensive Guide",
    category: "USA Special",
    user: "Nexus Travel Bureau",
    views: "4.8M",
    likes: "120K",
    time: "1 hour ago",
    excerpt:
      "From the electric neon streets of Times Square to the awe-inspiring depths of the Grand Canyon, explore top US destinations for 2026.",
    content: [
      "The United States remains one of the world's most diverse travel destinations, offering everything from bustling metropolises to untouched natural wonderlands. Whether you're planning a classic road trip or a cultural deep dive, 2026 brings fresh events and upgraded national park infrastructures across the country.",
      "1. New York City, New York — Times Square, Central Park, and Broadway continue to captivate millions. The city's newly revamped museum district offers immersive tech and art exhibits.",
      "2. Grand Canyon National Park, Arizona — Experiencing sunrise over the South Rim remains a bucket-list spectacle. Early bookings are recommended for 2026 permits.",
      "3. Yellowstone & Grand Teton — Wildlife enthusiasts can spot bison, grizzly bears, and geothermal wonders like Old Faithful in peak summer months.",
      "Planning Tip: Ensure you apply for ESTA or the appropriate US visa well in advance, and consider shoulder-season travel (May or September) for fewer crowds."
    ],
  };

  const posts: Article[] = [
    {
      id: "post-1",
      image: "https://media.timeout.com/images/103674438/750/562/image.jpg",
      title: "26 Most Amazing Tourist Attractions in the U.S. Worth Visiting",
      category: "Tourism",
      user: "World Report Live",
      views: "1.2M",
      likes: "25K",
      time: "2 hours ago",
      excerpt: "A curated tour through America's iconic landmarks, national parks, and vibrant cities.",
      content: [
        "America's sheer size guarantees endless options for travelers. Highlights include Washington D.C.'s Smithsonian museums, San Francisco's Golden Gate Bridge, and the coastal beauty of Highway 1 in California.",
        "For adventure seekers, Utah's 'Mighty 5' national parks (Zion, Bryce Canyon, Arches, Capitol Reef, and Canyonlands) offer world-class hiking trails amidst dramatic red rock formations."
      ]
    },
    {
      id: "post-2",
      image: "https://www.japjitravel.com/blog/wp-content/uploads/2023/09/statue-of-Liberty-is-located-in-Upper-New-York.webp",
      title: "Statue of Liberty & NYC Wonders: Visiting New York in 2026",
      category: "USA Travel",
      user: "Travel News Daily",
      views: "980K",
      likes: "19K",
      time: "4 hours ago",
      excerpt: "How to plan the perfect trip to Lady Liberty, Ellis Island, and Lower Manhattan.",
      content: [
        "Standing tall in New York Harbor, the Statue of Liberty symbolizes freedom and democracy. Book crown access tickets months in advance to catch breathtaking views of Manhattan.",
        "After visiting Liberty Island, take the ferry to Ellis Island to explore the historic Immigration Museum, where millions of family journeys began."
      ]
    },
    {
      id: "post-3",
      image: "https://www.thomascook.in/blog/wp-content/uploads/2017/10/Untitled-designfs-1.png",
      title: "The Great 'Land of Opportunity': 30 Best Places to Visit in USA",
      category: "USA Travel",
      user: "World News 24/7",
      views: "2.4M",
      likes: "51K",
      time: "5 hours ago",
      excerpt: "Everything from Disney World in Orlando to the historic streets of Boston.",
      content: [
        "The USA is home to 50 states full of varied landscapes and culture. Key highlights include Miami's South Beach for night energy, Las Vegas for entertainment, and Hawaii's Oahu island for tropical beauty.",
        "Whether visiting for sightseeing, education, or business opportunities, timing your travel with regional festivals can double the excitement."
      ]
    },
    {
      id: "post-4",
      image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/c5/7c/68/caption.jpg?w=300&h=300&s=1&cx=950&cy=1766&chk=v1_9ee2771da71f55a7ac6a",
      title: "Top Famous Places in United States to Visit this Year",
      category: "Culture",
      user: "Global Culture",
      views: "800K",
      likes: "11K",
      time: "7 hours ago",
      excerpt: "Deep dive into historic sites, music capitals, and food hubs like New Orleans.",
      content: [
        "From Jazz clubs in New Orleans French Quarter to Nashville's Grand Ole Opry, music forms the heart of American cultural travel.",
        "Foodies will love exploring authentic Texas BBQ joints, Chicago deep-dish pizza spots, and coastal New England clam shacks."
      ]
    },
    {
      id: "post-5",
      image: "https://hblimg.mmtcdn.com/content/hubble/img/destgalleryimages/mmt/activities/m_Washington_1_l_667_1000.jpg",
      title: "Washington D.C. Monuments & National Mall Exploration",
      category: "Culture",
      user: "Capitol Dispatch",
      views: "3.1M",
      likes: "80K",
      time: "9 hours ago",
      excerpt: "Free museum access, historic memorials, and cherry blossom season planning.",
      content: [
        "Washington D.C. provides a world-class vacation that won't break the bank, thanks to free entry to all Smithsonian Institution museums and the National Zoo.",
        "Stroll along the Tidal Basin during spring to witness thousands of blooming cherry blossoms framing the Jefferson and Martin Luther King Jr. Memorials."
      ]
    },
    {
      id: "post-6",
      image: "https://www.usnews.com/object/image/00000196-3af9-dcc7-a3de-3aff56a60000/new-main-image-gateway-arch-credit-getty-images.jpg?update-time=1745857845152&size=responsive640",
      title: "Midwest Marvels: Gateway Arch & Route 66 Road Trip",
      category: "USA Travel",
      user: "Travel Guide USA",
      views: "640K",
      likes: "9K",
      time: "12 hours ago",
      excerpt: "Discover the heartland of America, starting at the iconic Gateway Arch in St. Louis.",
      content: [
        "Standing 630 feet tall, the Gateway Arch in St. Louis, Missouri honors America's westward expansion. Tram rides to the top provide panoramic views across the Mississippi River.",
        "Combine your visit with a driving tour along classic Route 66, stopping by nostalgic diners, neon-lit motels, and roadside attractions."
      ]
    },
    {
      id: "post-7",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
      title: "Hawaii Island Hopping: Oahu, Maui & Kauai Uncovered",
      category: "USA Travel",
      user: "Island Life Beats",
      views: "1.5M",
      likes: "42K",
      time: "14 hours ago",
      excerpt: "Explore pristine beaches, volcanic parks, and traditional Polynesian culture.",
      content: [
        "Hawaii offers an unmatched tropical getaway. Experience Waikiki Beach in Oahu, drive the scenic Road to Hana in Maui, and marvel at the steep cliffs of the Na Pali Coast in Kauai."
      ]
    },
    {
      id: "post-8",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop",
      title: "The Golden Gate & Beyond: San Francisco Cultural Tour",
      category: "Culture",
      user: "Bay Area Insider",
      views: "890K",
      likes: "31K",
      time: "1 day ago",
      excerpt: "Cable cars, historic Chinatown, Alcatraz Island, and silicon valley innovations.",
      content: [
        "San Francisco blends rich history with modern innovation. Take a ride on the iconic cable cars, visit the historic Alcatraz Island, and sample fresh seafood at Fisherman's Wharf."
      ]
    }
  ];

  // Filtering Logic based on active tab and search query
  const filteredPosts = posts.filter((post) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "usa" && (post.category === "USA Travel" || post.category === "Tourism")) ||
      (activeTab === "culture" && post.category === "Culture");

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <Box bg="#0d1117" style={{ minHeight: "100vh", color: "#c9d1d9", fontFamily: "sans-serif" }}>
      
      {/* 1. IMAGE PREVIEW MODAL */}
      <Modal
        opened={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        centered
        size="xl"
        padding={0}
        withCloseButton={false}
        styles={{
          content: { backgroundColor: "transparent", boxShadow: "none" },
          body: { display: "flex", justifyContent: "center", alignItems: "center" }
        }}
      >
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Preview"
            radius="md"
            style={{ maxHeight: "85vh", objectFit: "contain", cursor: "pointer" }}
            onClick={() => setSelectedImage(null)}
          />
        )}
      </Modal>

      {/* 2. ARTICLE READER MODAL (READ MORE MODAL) */}
      <Modal
        opened={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        size="lg"
        centered
        radius="lg"
        padding="md"
        styles={{
          header: { backgroundColor: "#161b22", color: "#f0f6fc" },
          content: { backgroundColor: "#161b22", color: "#c9d1d9", border: "1px solid rgba(255,255,255,0.1)" },
          body: { backgroundColor: "#161b22" },
        }}
        title={
          <Group gap="xs">
            <Badge color="red" variant="filled" size="sm">
              {selectedArticle?.category || "News"}
            </Badge>
            <Text size="xs" c="#8b949e">Nexus News Reader</Text>
          </Group>
        }
      >
        {selectedArticle && (
          <ScrollArea h={500} offsetScrollbars>
            <Box pr="sm">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                radius="md"
                h={240}
                fit="cover"
                mb="md"
              />

              <Title order={3} c="#f0f6fc" mb="xs" style={{ lineHeight: 1.3 }}>
                {selectedArticle.title}
              </Title>

              <Group gap="md" mb="md">
                <Group gap={4}>
                  <IconUser size={14} color="#8b949e" />
                  <Text size="xs" c="#8b949e">{selectedArticle.user}</Text>
                </Group>
                <Group gap={4}>
                  <IconClock size={14} color="#8b949e" />
                  <Text size="xs" c="#8b949e">{selectedArticle.time}</Text>
                </Group>
                <Group gap={4}>
                  <IconEye size={14} color="#8b949e" />
                  <Text size="xs" c="#8b949e">{selectedArticle.views}</Text>
                </Group>
              </Group>

              <Divider color="rgba(255,255,255,0.08)" mb="md" />

              {selectedArticle.content.map((p, idx) => (
                <Text key={idx} size="sm" c="#c9d1d9" mb="sm" style={{ lineHeight: 1.6 }}>
                  {p}
                </Text>
              ))}

              <Group justify="flex-end" mt="xl">
                <Button variant="light" color="red" size="xs" onClick={() => setSelectedArticle(null)}>
                  Close Article
                </Button>
              </Group>
            </Box>
          </ScrollArea>
        )}
      </Modal>

      {/* 3. TOP NAVBAR */}
      <Box
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "#161b22",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <Container size="xl" py="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #da3633 0%, #8e181b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  color: "#fff",
                  fontSize: 18,
                }}
              >
                N
              </Box>
              <Text fw={800} size="xl" c="#f0f6fc" style={{ letterSpacing: "0.5px" }}>
                NEXUS<Text component="span" c="#da3633">NEWS</Text>
              </Text>
            </Group>

            <TextInput
              placeholder="Search USA news, travel, guides..."
              leftSection={<IconSearch size={16} color="#8b949e" />}
              radius="xl"
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: 320 }}
              styles={{
                input: {
                  backgroundColor: "#0d1117",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#f0f6fc",
                  "&:focus": { borderColor: "#da3633" },
                },
              }}
            />

            <Group gap="sm">
              <ActionIcon variant="subtle" color="gray" radius="xl">
                <IconBell size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray" radius="xl">
                <IconBookmark size={18} />
              </ActionIcon>
              <Avatar src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png" radius="xl" size="sm" />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* 4. TICKER BAR */}
      <Box style={{ backgroundColor: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.05)" }} py={6}>
        <Container size="xl">
          <Group gap="xs">
            <Badge color="red" size="sm" variant="filled" leftSection={<IconTrendingUp size={12} />}>
              USA TRENDING NOW
            </Badge>
            <Text size="xs" c="#8b949e" style={{ flex: 1 }} lineClamp={1}>
              • USA Travel Guide 2026: Top National Parks to visit • NYC Tourism reaches historic highs • Route 66 roadtrip tips
            </Text>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        
        {/* 5. HERO FEATURED NEWS */}
        <Box mb="2xl">
          <Card
            radius="lg"
            p={0}
            style={{
              position: "relative",
              overflow: "hidden",
              backgroundColor: "#161b22",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Grid align="center">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Box 
                  style={{ position: "relative", height: "100%", minHeight: 340, cursor: "pointer" }}
                  onClick={() => setSelectedImage(featuredPost.image)}
                >
                  <Image src={featuredPost.image} h="100%" fit="cover" alt="Featured" />
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, rgba(22,27,34,0) 0%, rgba(22,27,34,0.95) 100%)",
                    }}
                  />
                  <Badge
                    color="red"
                    size="md"
                    variant="filled"
                    style={{ position: "absolute", top: 16, left: 16, fontWeight: 700 }}
                  >
                    {featuredPost.category}
                  </Badge>
                </Box>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Box p="xl" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Text size="xs" c="#8b949e" mb={4}>{featuredPost.user} • {featuredPost.time}</Text>

                  <Title order={2} c="#f0f6fc" mb="sm" style={{ lineHeight: 1.3 }}>
                    {featuredPost.title}
                  </Title>

                  <Text size="xs" c="#8b949e" mb="lg" lineClamp={3}>
                    {featuredPost.excerpt}
                  </Text>
                  
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <Group gap={4}>
                        <IconEye size={14} color="#8b949e" />
                        <Text size="xs" c="#8b949e">{featuredPost.views}</Text>
                      </Group>
                      <Group gap={4}>
                        <IconHeart size={14} color="#f85149" />
                        <Text size="xs" c="#8b949e">{featuredPost.likes}</Text>
                      </Group>
                    </Group>

                    <Button
                      color="red"
                      size="xs"
                      radius="md"
                      rightSection={<IconArrowRight size={14} />}
                      onClick={() => setSelectedArticle(featuredPost)}
                    >
                      Read Full Story
                    </Button>
                  </Group>
                </Box>
              </Grid.Col>
            </Grid>
          </Card>
        </Box>

        {/* 6. MAIN CONTENT AREA */}
        <Grid mt="xl">
          <Grid.Col span={{ base: 12, lg: 8.5 }}>
            <Group justify="space-between" mb="lg">
              <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="pills"
                color="red"
                styles={{
                  tab: {
                    color: "#8b949e",
                    backgroundColor: "#161b22",
                    border: "1px solid rgba(255,255,255,0.05)",
                    "&[data-active]": { backgroundColor: "#da3633", color: "#fff" },
                  },
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="all">All News</Tabs.Tab>
                  <Tabs.Tab value="usa">USA Travel</Tabs.Tab>
                  <Tabs.Tab value="culture">Culture</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>

            {/* Cards Grid */}
            {filteredPosts.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {filteredPosts.map((item) => (
                  <Card
                    key={item.id}
                    radius="lg"
                    p={0}
                    style={{
                      overflow: "hidden",
                      backgroundColor: "#161b22",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* IMAGE & OVERLAY WITH CLICK LISTENER */}
                    <Box 
                      style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
                      onClick={() => setSelectedImage(item.image)}
                    >
                      <Image src={item.image} alt={item.title} h={180} fit="cover" />

                      <Box
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
                          pointerEvents: "none",
                        }}
                      />

                      <Badge
                        color="red"
                        size="xs"
                        variant="filled"
                        style={{ position: "absolute", top: 10, left: 10, fontWeight: 700 }}
                      >
                        {item.category}
                      </Badge>

                      <ActionIcon
                        variant="blur"
                        color="dark"
                        radius="xl"
                        size="sm"
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          backdropFilter: "blur(4px)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <IconBookmark size={14} color="#e6edf3" />
                      </ActionIcon>
                    </Box>

                    {/* CONTENT */}
                    <Box p="md" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="11px" c="#e6edf3">
                            {item.user}
                          </Text>
                          <Text size="10px" c="#8b949e">
                            {item.time}
                          </Text>
                        </Group>

                        <Text fw={600} size="xs" c="#f0f6fc" lineClamp={2} style={{ lineHeight: 1.4, height: 34 }} mb="xs">
                          {item.title}
                        </Text>

                        <Text size="11px" c="#8b949e" lineClamp={2} mb="md">
                          {item.excerpt}
                        </Text>
                      </Box>

                      {/* READ MORE BUTTON & METRICS */}
                      <Box>
                        <Group justify="space-between" mb="xs" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                          <Group gap="sm">
                            <Group gap={3}>
                              <IconEye size={12} color="#8b949e" />
                              <Text size="10px" c="#8b949e" fw={500}>{item.views}</Text>
                            </Group>
                            <Group gap={3}>
                              <IconHeart size={12} color="#f85149" />
                              <Text size="10px" c="#8b949e" fw={500}>{item.likes}</Text>
                            </Group>
                          </Group>

                          <ActionIcon radius="md" color="gray" variant="subtle" size="xs">
                            <IconShare size={14} color="#8b949e" />
                          </ActionIcon>
                        </Group>

                        {/* READ MORE BUTTON */}
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          fullWidth
                          radius="md"
                          rightSection={<IconArrowRight size={12} />}
                          onClick={() => setSelectedArticle(item)}
                        >
                          Read More
                        </Button>
                      </Box>

                    </Box>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box py="xl" style={{ textAlign: "center" }}>
                <Text size="sm" c="#8b949e">No articles found matching your criteria.</Text>
              </Box>
            )}
          </Grid.Col>

          {/* RIGHT SIDEBAR */}
          <Grid.Col span={{ base: 12, lg: 3.5 }}>
            <Card radius="lg" p="lg" style={{ backgroundColor: "#161b22", border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, #161b22 0%, #1f242d 100%)" }}>
              <Group gap="xs" mb="xs">
                <IconMail size={20} color="#da3633" />
                <Title order={5} c="#f0f6fc">USA Travel Newsletter</Title>
              </Group>
              
              <Text size="xs" c="#8b949e" mb="md">
                Get weekly US tourist guides, flight deals, and itineraries straight to your inbox.
              </Text>

              <TextInput
                placeholder="Your email address"
                radius="md"
                size="xs"
                mb="sm"
                styles={{
                  input: { backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)", color: "#fff" },
                }}
              />

              <Button color="red" size="xs" fullWidth radius="md">
                Subscribe Now
              </Button>
            </Card>
          </Grid.Col>
        </Grid>

      </Container>

      {/* 7. FOOTER */}
      <Box style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#161b22" }} mt="3xl" py="xl">
        <Container size="xl">
          <Group justify="space-between">
            <Text size="xs" c="#8b949e">
              © 2026 NEXUS NEWS MEDIA. All rights reserved.
            </Text>
            
            <Group gap="md">
              <ActionIcon variant="subtle" color="gray" radius="xl"><IconBrandTwitter size={16} /></ActionIcon>
              <ActionIcon variant="subtle" color="gray" radius="xl"><IconBrandYoutube size={16} /></ActionIcon>
              <ActionIcon variant="subtle" color="gray" radius="xl"><IconBrandInstagram size={16} /></ActionIcon>
            </Group>
          </Group>
        </Container>
      </Box>

    </Box>
  );
};

export default NewsPortal;