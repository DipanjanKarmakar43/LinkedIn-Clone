"use client";

import React from "react";
import { useRouter } from "next/router";
import NavbarComponent from "@/components/Navbar";
import FooterComponent from "@/components/Footer";

export default function UserLayout({ children }) {
  const router = useRouter();
  const { pathname } = router;
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isMyConnectionsPage = pathname.startsWith("/myConnections");

  return (
    <div>
      <NavbarComponent />
      <main>{children}</main>
      {!isDashboardPage && !isMyConnectionsPage && <FooterComponent />}
    </div>
  );
}
