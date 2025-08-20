import Header from "../../_components/Sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#0A0A0D]">
      <Header />

      <div className="flex-1 overflow-hidden pt-12 md:pt-12 w-full ">
        {children}
      </div>
    </div>
  );
};

export default Layout;
