"use client"; // Required to use hooks like usePathname

import React from "react";
import { usePathname } from "next/navigation"; // Import the hook
import NavbarComponent from "@/components/Navbar";
import FooterComponent from "@/components/Footer";

export default function UserLayout({ children }) {
  // Get the current path
  const pathname = usePathname();

  // Check if the current path starts with '/dashboard'
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isMyConnectionsPage = pathname.startsWith("/myConnections");

  return (
    <div>
      <NavbarComponent />
      <main>{children}</main>

      {/* Conditionally render the FooterComponent */}
      {!isDashboardPage && !isMyConnectionsPage && <FooterComponent />}
    </div>
  );
}
