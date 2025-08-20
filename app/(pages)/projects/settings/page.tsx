"use client";
import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useSettings } from "@/app/helpers/useSettings";
import { GoInfo } from "react-icons/go";
import PricingModal from "@/app/(pages)/_modals/PricingModal";
import { useDispatch } from "react-redux";
import { setPricingModalOpen } from "@/app/redux/reducers/basicData";
import moment from "moment";
import { BsLightningChargeFill } from "react-icons/bs";

const Page = () => {
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);

  const dispatch = useDispatch();
  const { email } = useAuthenticated();
  const { data: settings, isLoading: settingsLoading } = useSettings();

  return (
    <div className="flex flex-col space-y-4">
      <PricingModal />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex"
        >
          <div className="text-white space-y-4 w-full flex flex-col z-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {/* Email */}
              <section className="justify-center items-start flex flex-col space-y-7 w-full pb-7">
                <h2
                  className={`font-bold text-lg font-sans text-white flex justify-center items-center gap-x-2 ${settingsLoading ? "animate-pulse" : ""}`}
                >
                  {settingsLoading ? (
                    <div className="h-6 w-48 bg-[#272628] rounded animate-pulse"></div>
                  ) : (
                    <div
                      className={`justify-center flex items-center row gap-y-2 md:gap-x-2 ${settings?.plan === "scale" ? "flex-col md:flex-row" : "flex-row space-x-2"}`}
                    >
                      <p className="text-ellipsis inline-block whitespace-nowrap text-balance">
                        {email.value ?? email.value}{" "}
                      </p>

                      <span
                        className={`px-2 gap-x-1 border rounded-md font-sans font-medium justify-center items-center flex text-[10px] ${settings?.plan === "scale" ? "text-black bg-[#A9F000] backdrop-blur-md border-[#A9F000]/30 shadow-[0_0_8px_rgba(169,240,0,0.3)]" : "text-black bg-white border-[#9E9D9F]"}`}
                      >
                        {settings?.plan === "scale" ? "Scale" : "Free"}
                        {settings?.plan === "scale" && (
                          <BsLightningChargeFill />
                        )}
                      </span>
                      {settings?.plan === "scale" &&
                        settings?.daysLeftInSubscription > 0 && (
                          <span className="text-xs text-[#9E9D9F]">
                            ({settings.daysLeftInSubscription} days left)
                          </span>
                        )}
                    </div>
                  )}
                </h2>
                <div className="justify-between items-center flex space-x-8 w-full">
                  <div className="relative">
                    <div
                      className={`text-sm font-sans font-medium text-white flex justify-center items-center gap-x-2 ${settingsLoading ? "animate-pulse" : ""}`}
                    >
                      {settingsLoading ? (
                        <div className="h-4 w-32 bg-[#272628] rounded animate-pulse"></div>
                      ) : (
                        <>
                          Projects - {settings?.projectCount ?? 0}
                          <div
                            className="cursor-pointer"
                            onMouseEnter={() => setShowProjectsTooltip(true)}
                            onMouseLeave={() => setShowProjectsTooltip(false)}
                          >
                            <GoInfo />
                            <AnimatePresence>
                              {showProjectsTooltip && (
                                <motion.div
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="absolute left-full ml-2 p-2 bottom-[1px] z-10 bg-[#28272a] rounded-md text-xs text-white whitespace-nowrap"
                                >
                                  Number of active projects
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="w-full bg-[#272628]/40 backdrop-blur-md h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div
                      className={`bg-[#A9F000]/80 backdrop-blur-md h-full rounded-full transition-all duration-300 shadow-lg ${settingsLoading ? " w-1/2 bg-gradient-to-r from-[#A9F000]/60 via-[#A9F000]/80 to-[#ecfdf5]/30 bg-[length:200%_100%] animate-[shimmer_1s_infinite]" : ""}`}
                      style={{
                        width: !settingsLoading
                          ? `${((settings?.promptsUsed ?? 0) / (settings?.maxPrompts ?? 5)) * 100}%`
                          : undefined,
                        animation: settingsLoading
                          ? "shimmer 1s infinite"
                          : undefined,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center w-full">
                    <div
                      className={`text-xs font-sans font-medium text-[#8C8C8C] ${settingsLoading ? "animate-pulse" : ""}`}
                    >
                      {settingsLoading ? (
                        <div className="h-3 w-24 bg-[#272628] rounded animate-pulse"></div>
                      ) : (
                        <>
                          {settings?.promptsUsed ?? 0}/
                          {settings?.maxPrompts ?? 5} prompts used
                        </>
                      )}
                    </div>
                    {settings?.nextPromptReset && !settingsLoading && (
                      <p className="text-xs font-sans font-medium text-[#8C8C8C]">
                        Limit reset monthly at 12:00 AM UTC
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {!settingsLoading && (settings?.remainingPrompts ?? 0) <= 0 && (
                <p className="text-sm font-sans font-medium text-white my-3 text-balance">
                  You consumed all the prompts! Get more to continue
                  creating.{" "}
                </p>
              )}
              {!settingsLoading && settings?.plan === "free" ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    dispatch(setPricingModalOpen(true));
                  }}
                  className="justify-center items-center flex font-sans py-1.5 gap-x-1 font-medium text-black bg-[#A9F000] backdrop-blur-md rounded-md hover:bg-[#F4FF3C] text-xs border border-[#A9F000]/30 shadow-lg cursor-pointer px-3 transition-all duration-300"
                >
                  Upgrade to Scale
                </motion.button>
              ) : (
                !settingsLoading && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      dispatch(setPricingModalOpen(true));
                    }}
                    className="justify-center items-center flex font-sans py-1 gap-x-1 font-medium text-gray-200 rounded-md text-xs border border-[#272628] cursor-pointer px-2 p-1"
                  >
                    Renews at{" "}
                    {moment(settings?.subscriptionEndDate).format("DD/MM/YY")}
                  </motion.button>
                )
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Page;
