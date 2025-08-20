"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { signOut } from "next-auth/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    signOut({ redirect: true, callbackUrl: "/" });
  };
  return (
    <div className="flex flex-col bg-[#141415] h-[95vh] w-screen md:w-auto overflow-hidden">
      {/* Header */}

      <div className=" px-3 flex  mt-10 ml-3  justify-between items-center">
        <h2 className="font-bold text-left text-2xl sm:text-3xl font-[insSerifIt] text-white">
          Settings
        </h2>
        <button
          onClick={handleLogout}
          className="justify-center items-center flex font-sans py-1 z-5 rounded-lg font-medium text-[#9E9D9F] hover:bg-white hover:text-black text-xs space-x-2 cursor-pointer px-3"
        >
          Log out <IoIosArrowForward />
        </button>
      </div>

      {/* Options */}
      <section className="pt-10 px-5 sm:pt-10 w-full z-5 h-full">
        {children}
      </section>

      <section className="justify-center w-full items-center flex py-3 md:py-3 bottom-0 fixed px-2 md:px-0">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="justify-center items-center flex flex-wrap font-sans font-medium text-[#9E9D9F] text-xs md:text-xs gap-x-1 cursor-pointer px-1 md:px-2 p-1 rounded-md"
        >
          Curious or Have feedback? Mail us at
          <Link
            href="mailto: admin@mallow.com"
            className="text-white cursor-pointer hover:underline"
          >
            admin@mallow.com
          </Link>
        </motion.button>
      </section>
    </div>
  );
};

export default Layout;
