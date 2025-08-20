"use client";

import { setMobileChatOpen } from "@/app/redux/reducers/basicData";
import { RootState } from "@/app/redux/store";
import { motion } from "framer-motion";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TbLayoutNavbarExpand } from "react-icons/tb";
import Messages from "./Messages";

import Keyboard from "./Keyboard";

const MobileChat = () => {
  const { MobileChatOpen } = useSelector((state: RootState) => state.basicData);
  const dispatch = useDispatch();

  return (
    <motion.div
      className="md:hidden fixed z-50 bottom-0 w-full border-t border-[#201F22] bg-[#141415] rounded-t-2xl shadow-lg"
      animate={{ y: MobileChatOpen ? 0 : "calc(100% - 40px)" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.6,
      }}
    >
      <div className="flex justify-center mb-2 relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(setMobileChatOpen())}
          className="text-white hover:bg-neutral-700 p-2 rounded-full shadow-md z-10"
        >
          <motion.span
            initial={false}
            animate={{ rotate: MobileChatOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center text-xl"
          >
            {MobileChatOpen ? (
              <TbLayoutNavbarExpand />
            ) : (
              <TbLayoutNavbarExpand />
            )}
          </motion.span>
        </motion.button>
      </div>

      {MobileChatOpen && (
        <div className="flex flex-col h-[70vh] w-screen bg-[#141415] border-l border-[#201F22]">
          {/* Head */}

          {/* Palette / Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="h-full" style={{ display: "block" }}>
              <Messages />
            </div>
          </div>

          <div className=" justify-center items-center flex flex-col ">
            <div className="p-3 border-y border-[#201F22] bg-[#1a1a1b] w-full">
              <Keyboard />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MobileChat;
