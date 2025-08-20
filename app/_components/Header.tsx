"use client";

import React from "react";

import Link from "next/link";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setLoginModalOpen } from "../redux/reducers/basicData";

import { useAuthenticated } from "../helpers/useAuthenticated";
import { useRouter } from "next/navigation";

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { email, isAuthenticated } = useAuthenticated();

  const menuVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const hoverEffect = {
    hover: {
      scale: 1.05,
      filter: "brightness(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.6))",
      transition: { duration: 0.3 },
    },
  };

  const handleLogin = async () => {
    try {
      if (!isAuthenticated.value) {
        dispatch(setLoginModalOpen(true));
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.log("Error opening Login Modal", error);
    }
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={menuVariants}
        className="fixed top-0 left-0 right-0  z-10 bg-transparent"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#0A0A0D]/50 backdrop-blur-md  rounded-2xl mt-5 sm:mt-10">
          <div className="flex justify-between items-center h-14">
            <motion.div
              className="space-x-1 sm:space-x-2 flex justify-between items-center"
              whileHover="hover"
              variants={hoverEffect}
            >
              <Link href="/" className="flex items-center justify-center group">
                <span className="font-[insSerif] text-2xl sm:text-3xl">
                  <span className="ml-2.5  font-semibold tracking-tight text-white">
                    mallow
                    <span className="ml-1 font-[insSerifiT]  font-semibold tracking-tight text-[#A9F000]"></span>
                  </span>
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.button
                onClick={handleLogin}
                whileHover="hover"
                variants={hoverEffect}
                className={`bg-white/90 cursor-pointer text-black text-xs font-medium ${email ? "px-2 p-1" : "px-4 py-1"} rounded-lg`}
              >
                {email.value !== null &&
                email.value !== undefined &&
                typeof email.value === "string"
                  ? email.value.charAt(0).toUpperCase()
                  : "Login"}
              </motion.button>
            </div>

            {/* Mobile Navigation */}

            <div className="md:hidden flex items-center space-x-4">
              <motion.button
                onClick={handleLogin}
                className={`bg-white/90 text-black cursor-pointer text-xs font-medium ${email ? "px-2 p-1" : "px-4 py-1"} rounded-lg`}
              >
                {email.value !== null &&
                email.value !== undefined &&
                typeof email.value === "string"
                  ? email.value.charAt(0).toUpperCase()
                  : "Login"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
