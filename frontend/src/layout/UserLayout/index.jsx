import React from "react";
import NavbarComponent from "@/components/Navbar";
import FooterComponent from "@/components/Footer";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      <main>{children}</main>
      <FooterComponent />
    </div>
  );
}
