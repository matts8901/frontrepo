"use client";
import { motion } from "framer-motion";
import React, { useState } from "react";
import Link from "next/link";
import { IoIosAdd } from "react-icons/io";
import { GoProjectRoadmap } from "react-icons/go";
import { TbChartDots3 } from "react-icons/tb";
import { useAuthenticated } from "../helpers/useAuthenticated";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";

import Shimmer from "./Shimmer";
import Image from "next/image";
import {
  setIsBuilding,
  setProjectMode,
} from "../redux/reducers/projectOptions";
import { setNotification } from "../redux/reducers/NotificationModalReducer";
import { LuLoaderCircle } from "react-icons/lu";
import { API } from "../config/Config";

const Header = () => {
  const options = [
    { title: "Create new project", icon: IoIosAdd },
    { title: "Projects", icon: GoProjectRoadmap },
  ];

  const { email } = useAuthenticated();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { title, mode, generationSuccess, isResponseCompleted, isbuilding } =
    useSelector((state: RootState) => state.projectOptions);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if we're inside a project page
  const isProjectPage =
    pathname.includes("/projects/") &&
    pathname !== "/projects" &&
    pathname !== "/projects/settings";

  const allowedModes = ["preview", "code", "dashboard"];

  const handleMode = async (id: "preview" | "code" | "dashboard") => {
    try {
      if (allowedModes.includes(id)) {
        dispatch(setProjectMode({ mode: id }));
      } else {
        console.error(`Invalid mode: ${id}`);
      }
    } catch (error) {
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "There is an issue while saving the code!",
        })
      );
      console.log(error);
    }
  };

  const handleDeploy = async () => {
    try {
      const projectId = pathname.split("/")[2]; // Extract project ID from URL

      const response = await fetch(`${API}/build-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          projectId: projectId,
        }),
      });

      if (response.ok) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "success",
            text: "Build in queue you will receive a mail shortly!",
          })
        );
        dispatch(setIsBuilding({ isbuilding: true }));
      } else {
        throw new Error("Build request failed");
      }
    } catch (error) {
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Build Failed!",
        })
      );
      console.error("Deploy error:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 ">
      {/* Desktop Header */}
      <motion.div
        className="hidden md:flex w-full bg-[#0F0F0F]/60 border-b border-white/10 h-12 px-3 justify-between items-center backdrop-blur-xl bg-opacity-70 shadow-lg"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          {!isProjectPage ? (
            <span className="font-[insSerif] text-xl sm:text-2xl">
              <span className="ml-2.5 font-semibold tracking-tight text-white">
                mallow
              </span>
            </span>
          ) : (
            <Image
              src="/logo.png"
              className="h-6 w-6"
              alt="mallow"
              width={14}
              height={14}
            />
          )}

          {isProjectPage && title ? (
            <>
              <span className="font-sans text-lg font-medium px-5">/</span>

              <h3 className="font-sans text-sm font-semibold tracking-tight text-white truncate max-w-full overflow-hidden whitespace-nowrap">
                {title}
              </h3>
            </>
          ) : isProjectPage ? (
            <div className="">
              <Shimmer width={"10%"} height={20} className="rounded-md" />
            </div>
          ) : null}
        </Link>

        <div className="flex flex-row justify-end items-center space-x-7">
          {/* Navigation Options or Project Actions */}
          {isProjectPage ? (
            <div className="hidden items-center space-x-4 md:flex">
              {/* Simple Switcher Component */}
              <div className="relative flex bg-[#252527]/30 border overflow-hidden border-white/10 font-sans font-medium text-xs rounded-md w-fit shadow-lg z-10">
                <div className="justify-center items-center flex">
                  {[
                    { id: "dashboard", icon: "Dashboard", label: "Dashboard" },
                    { id: "preview", icon: "Preview", label: "Preview" },
                    { id: "code", icon: "Code", label: "Code" },
                  ].map((option, index) => (
                    <React.Fragment key={index}>
                      <button
                        onClick={() => {
                          if (generationSuccess === "success") {
                            handleMode(
                              option.id as "preview" | "dashboard" | "code"
                            );
                          }
                        }}
                        className={`relative flex items-center justify-center px-3 py-1 transition-all duration-200 z-10 ${`${
                          mode.toLocaleLowerCase() ===
                          option.id.toLocaleLowerCase()
                            ? "text-black bg-white rounded-md"
                            : "text-white hover:bg-white/20 rounded-md hover:text-white"
                        }
                          `}`}
                      >
                        {option.icon}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                {generationSuccess !== "success" && (
                  <div className="flex absolute z-20 py-2 flex-row w-full justify-center items-center scroll-px-2 bg-black/50">
                    <LuLoaderCircle className="animate-spin" />
                  </div>
                )}
              </div>

              {/* Deploy */}
              <button
                disabled={
                  generationSuccess !== "success" ||
                  !isResponseCompleted ||
                  isbuilding
                }
                onClick={handleDeploy}
                className="text-xs cursor-pointer hover:bg-gray-200 font-sans font-medium bg-white text-black p-1 w-14 rounded-lg justify-center items-center flex"
              >
                {isbuilding ? "Building" : "Deploy"}
              </button>

              <motion.div
                whileHover={{ scale: 1.05, filter: "brightness(1.3)" }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer hover:bg-white hover:text-black rounded-md p-1 flex items-center gap-x-2 backdrop-blur-md transition-all duration-300"
                onClick={() => {
                  router.push("/projects");
                }}
              >
                <GoProjectRoadmap className="text-lg " />
                <span className="font-sans font-medium text-xs">Projects</span>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center gap-x-6">
              {options.map((O, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, filter: "brightness(1.3)" }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer hover:bg-white hover:text-black rounded-md p-1 flex items-center gap-x-2 backdrop-blur-md transition-all duration-300"
                  onClick={() => {
                    if (O.title === "Projects") {
                      router.push("/projects");
                    } else {
                      router.push("/");
                    }
                  }}
                >
                  <O.icon className="text-lg " />
                  <span className="font-sans font-medium text-xs">
                    {O.title}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* User Profile */}
          <motion.button
            onClick={() => {
              router.push("/projects/settings");
            }}
            whileHover={{ scale: 1.05, filter: "brightness(1.3)" }}
            transition={{ duration: 0.2 }}
            className="p-2 justify-center items-center font-sans font-medium text-xs flex cursor-pointer bg-white/10 backdrop-blur-md rounded-lg text-white h-6 w-6 border border-white/5 shadow-lg"
          >
            {email.value !== null &&
            email.value !== undefined &&
            typeof email.value === "string" ? (
              email.value.charAt(0).toUpperCase()
            ) : (
              <div className="bg-[#252527]/50 backdrop-blur-md rounded-lg w-full h-full" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <motion.div
        className="md:hidden w-full bg-[#0F0F0F]/60 border-b border-white/10 z-40 flex justify-between items-center p-2 backdrop-blur-xl bg-opacity-70 shadow-lg"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/" className="flex items-center">
          {isProjectPage && title ? (
            <>
              <Image
                src="/logo.svg"
                className="h-6 w-6"
                alt="mallow"
                width={14}
                height={14}
              />
              <span className="font-sans text-lg font-medium px-2 ">/</span>
              <h3 className="font-sans text-sm sm:text-2xl font-semibold tracking-tight text-white truncate max-w-[150px] overflow-hidden whitespace-nowrap">
                {title}
              </h3>
            </>
          ) : isProjectPage ? (
            <div className="ml-2.5">
              <Shimmer width={"10%"} height={20} className="rounded-md" />
            </div>
          ) : (
            <span className="font-[insSerif] text-2xl sm:text-3xl">
              <span className="ml-2.5 font-semibold tracking-tight text-white">
                mallow
                <span className="ml-1 font-[insSerifiT] font-semibold tracking-tight text-[#A9F000]">
                  name
                </span>
              </span>
            </span>
          )}
        </Link>

        <div className="flex items-center gap-x-3">
          {isProjectPage ? (
            <>
              <div className=" items-center space-x-4 md:flex">
                <div className="relative flex bg-[#252527]/30 border overflow-hidden border-white/10 font-sans font-medium text-xs rounded-md w-fit shadow-lg z-10">
                  <div className="justify-center items-center flex">
                    {[
                      {
                        id: "dashboard",
                        icon: "Dashboard",
                        label: "Dashboard",
                      },
                      { id: "preview", icon: "Preview", label: "Preview" },
                      { id: "code", icon: "Code", label: "Code" },
                    ].map((option, index) => (
                      <React.Fragment key={index}>
                        <button
                          onClick={() => {
                            if (generationSuccess === "success") {
                              handleMode(
                                option.id as "preview" | "dashboard" | "code"
                              );
                            }
                          }}
                          className={`relative flex items-center justify-center px-3 py-1 transition-all duration-200 z-10 ${`${
                            mode.toLocaleLowerCase() ===
                            option.id.toLocaleLowerCase()
                              ? "text-black bg-white rounded-md"
                              : "text-white hover:bg-white/20 rounded-md hover:text-white"
                          }
                          `}`}
                        >
                          {option.icon}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                  {generationSuccess !== "success" && (
                    <div className="flex absolute z-20 py-2 flex-row w-full justify-center items-center scroll-px-2 bg-black/50">
                      <LuLoaderCircle className="animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              {/* Share */}
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                }}
                className="text-sm font-sans font-medium text-white hover:bg-[#252525] px-3 rounded-lg"
              >
                <TbChartDots3 className="text-lg" />
              </button>
            </>
          ) : (
            options.map((O, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, filter: "brightness(1.3)" }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer hover:bg-white/10 rounded-md p-2 backdrop-blur-md transition-all duration-300"
                onClick={() => {
                  if (O.title === "Projects") {
                    router.push("/projects");
                  } else {
                    router.push("/");
                  }
                }}
              >
                <O.icon className="text-lg text-white" />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Mobile dropdown menu for project page */}
      {isProjectPage && dropdownOpen && (
        <div className="md:hidden absolute right-1 top-12 w-30 bg-[#1A1A1A] rounded-md shadow-lg z-40 border border-[#252525]">
          <button
            disabled={generationSuccess !== "success" || !isResponseCompleted}
            onClick={handleDeploy}
            className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-[#252525]"
          >
            Deploy
          </button>
          <button
            onClick={() => {
              router.push("/projects");
            }}
            className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-[#252525]"
          >
            Projects
          </button>

          <button
            onClick={() => {
              router.push("/projects/settings");
            }}
            className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-[#252525]"
          >
            Account
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
