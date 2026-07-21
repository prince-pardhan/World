import Navbar from "./Navbar/Navbar";

import { AppShellNavbar, Stack } from "@mantine/core";
import Image from "next/image";

export default function Home() {
  return (
    <Stack w={"100%"} h={"100vh"} >
      <Navbar />
     
    </Stack>
  );
}
