import NavbarComponent from "@/components/Navbar";
import FooterComponent from "@/components/Footer";
import React from "react";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      {children}
      <FooterComponent />
    </div>
  );
}
