// app/_sub-components/Sheet.tsx
"use client";

import { NextPage } from "next";
import React, { useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WebEditor from "./_sub-components/WebEditor";
import Canvas from "./_sub-components/Canvas";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react";

import { usePathname } from "next/navigation";
import { useGenerateFile } from "@/app/_services/useGenerateFile";
import EnhancedPrompt from "./_sub-components/EnhancedPrompt";
import Thoughts from "./_sub-components/Thoughts";
import Dashboard from "./Dashboard";

const Sheet: NextPage = () => {
  const { mode, url, isResponseCompleted, enh_prompt, generationSuccess } =
    useSelector((state: RootState) => state.projectOptions);
  const { data } = useSelector((state: RootState) => state.projectFiles);
  const { fetchProjectFiles } = useGenerateFile();

  const path = usePathname();

  const getProjectId = useCallback(() => {
    const segments = path.split("/");
    const id = segments[2] || "";
    return id;
  }, [path]);

  const projectId = getProjectId();

  const refreshRef = useRef(false);

  useEffect(() => {
    if (refreshRef.current) return;
    refreshRef.current = true;

    if (url) {
      fetchProjectFiles({ url });
    }
  }, [url]);

  return (
    <div className="flex flex-col flex-grow md:max-w-[87vw] md:w-[50vw] z-20  max-md:h-[95vh]  max-md:w-screen overflow-hidden bg-[#121214]">
      {!isResponseCompleted && generationSuccess === null && enh_prompt && (
        <EnhancedPrompt enh_prompt={enh_prompt} projectId={projectId} />
      )}
      <AnimatePresence mode="wait">
        {generationSuccess === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SandpackProvider
              onError={(e) => console.log(e, "sandbox errored")}
              onErrorCapture={(e) => console.log(e, "error capture")}
              autoFocus
              options={{
                initMode: "immediate",
                autoReload: true,
                autorun: true,
                externalResources: [
                  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
                ],
              }}
              suppressHydrationWarning
              suppressContentEditableWarning
              template={"react"}
              files={{ ...data }}
              theme="dark"
            >
              <SandpackLayout className="md:h-[96vh] h-[90vh] w-full">
                <div className="flex flex-col overflow-hidden w-full h-full">
                  {/* Dashboard Mode Content */}
                  <motion.div
                    className="h-full absolute inset-0 "
                    animate={{
                      opacity: mode === "dashboard" ? 1 : 0,
                      display: mode === "dashboard" ? "block" : "none", // Optional: hide completely
                    }}
                    initial={false}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard />
                  </motion.div>
                  {/* Preview Mode Content */}
                  <motion.div
                    className="h-full absolute inset-0 "
                    animate={{
                      opacity: mode === "preview" ? 1 : 0,
                      display: mode === "preview" ? "block" : "none", // Optional: hide completely
                    }}
                    initial={false}
                    transition={{ duration: 0.3 }}
                  >
                    <Canvas />
                  </motion.div>

                  {/* Code Mode Content */}
                  <motion.div
                    className="h-full w-full absolute inset-0"
                    animate={{
                      opacity: mode === "code" ? 1 : 0,
                      display: mode === "code" ? "block" : "none", // Optional: hide completely
                    }}
                    initial={false}
                    transition={{ duration: 0.3 }}
                  >
                    <WebEditor />
                  </motion.div>
                </div>
              </SandpackLayout>
            </SandpackProvider>
          </motion.div>
        )}

        {generationSuccess === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="justify-center items-center flex max-md:h-[90vh] h-full w-full flex-col space-y-3"
          >
            <Thoughts />
          </motion.div>
        )}

        {generationSuccess === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="justify-center items-center flex max-md:h-[90vh] h-full w-full flex-col space-y-3"
          >
            <h3 className="text-sm font-sans font-medium text-white">
              Something went wrong, Please Refresh.
            </h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sheet;
