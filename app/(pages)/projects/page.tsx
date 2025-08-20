"use client";
import React, { useState } from "react";
import { CgOptions } from "react-icons/cg";
import ProjectOptionsModal from "../_modals/ProjectOptionsModal";
import { LuExternalLink, LuLoader } from "react-icons/lu";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useProjectsData } from "@/app/helpers/useProjectsData";
import moment from "moment";
import Link from "next/link";
import { IoIosAdd } from "react-icons/io";

interface Project {
  generatedName: string;
}
const Page = () => {
  const { email } = useAuthenticated();
  const { projects, loading } = useProjectsData(email.value);

  const filteredProjects =
    projects?.filter((project) => {
      return project.title.toLowerCase();
    }) || [];

  const unpinnedProjects =
    filteredProjects?.filter((project) => !project.isPinned) || [];

  const router = useRouter();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    index: string;
    position: { top: number; left: number };
  }>({ isOpen: false, index: "", position: { top: 0, left: 0 } });

  const handleOptionsClick = (index: string, event: React.MouseEvent) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setModalState({
      isOpen: true,
      index,
      position: { top: rect.bottom + 5, left: rect.left },
    });
  };

  const handleOpenProject = async (project: Project) => {
    window.location.href = `/projects/${project.generatedName}`;
  };

  return (
    <div className="flex flex-col bg-[#0A0A0D] min-h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="px-6 flex justify-start items-center pt-8 pb-6">
        <h2 className="font-bold text-left text-2xl sm:text-3xl font-[insSerif] text-white">
          Projects
        </h2>
      </div>

      {loading !== "success" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 overflow-y-auto justify-center items-center flex"
        >
          <LuLoader className="text-xl text-white/60 animate-spin" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 overflow-y-auto"
        >
          {!projects?.length ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#0F0F0F] rounded-full flex items-center justify-center border border-white/10">
                  <svg
                    className="w-8 h-8 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">
                    No projects yet
                  </h3>
                  <p className="text-sm font-sans text-white/60 max-w-sm">
                    Create your first project to get started building amazing
                    applications
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push("/");
                  }}
                  className="bg-white text-black rounded-lg cursor-pointer px-6 py-2.5 font-sans font-medium text-sm hover:bg-white/90 transition-all duration-200 justify-center items-center flex gap-x-2 shadow-lg"
                >
                  <IoIosAdd className="text-lg" />
                  Create New Project
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              {/* All Projects */}
              {unpinnedProjects.length > 0 && (
                <div className="px-7 pt-10 z-20">
                  <div className="grid md:grid-cols-4 grid-cols-1 gap-8">
                    {unpinnedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="rounded-md justify-center z-20 items-start flex flex-col bg-[#0f0f0f] pt-2 px-3 space-y-3 max-w-3xl overflow-hidden text-ellipsis"
                      >
                        <h3 className="text-sm font-sans font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                          {project.title}
                        </h3>

                        <div className="justify-between w-full items-center flex">
                          {project.deployed_url && (
                            <Link
                              target="_blank"
                              href={`//${project.deployed_url}`}
                              className="text-xs hover:underline font-sans font-medium text-[#838385] flex flex-row justify-between items-center gap-x-2"
                            >
                              Visit
                              <LuExternalLink className="text-xs text-[#838385]" />
                            </Link>
                          )}

                          <h3 className="text-xs font-sans font-medium text-[#838385]">
                            Modified {moment(project.updatedAt).fromNow()}
                          </h3>
                        </div>
                        <div className="justify-between items-center flex w-full border-t border-[#201F22] py-3">
                          <button
                            onClick={() => [handleOpenProject(project)]}
                            className="justify-center items-center flex text-white rounded-md px-2 p-[2px] cursor-pointer hover:bg-[#1A1A1A] font-sans font-medium text-xs "
                          >
                            Open Project
                          </button>
                          <button
                            className="rounded-md p-[2px] cursor-pointer hover:bg-[#1A1A1A] text-white"
                            onClick={(e) =>
                              handleOptionsClick(project.generatedName, e)
                            }
                          >
                            <CgOptions />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <ProjectOptionsModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
          position={modalState.position}
          name={
            projects.find(
              (project) => project.generatedName === modalState.index
            )?.title ?? ""
          }
          isPublic={
            projects.find(
              (project) => project.generatedName === modalState.index
            )?.isPublic ?? false
          }
          projectId={modalState.index}
        />
      </AnimatePresence>
    </div>
  );
};

export default Page;
