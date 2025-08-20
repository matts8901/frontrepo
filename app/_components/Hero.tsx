"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

import Header from "./Header";
import { motion } from "framer-motion";
import AttachmentPreview from "./AttachmentPreview";
import { FaPaperclip } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import {
  addImage,
  addImageURL,
  removeImage,
  removeImageURL,
  setLoginModalOpen,
  setPricingModalOpen,
} from "../redux/reducers/basicData";
import { useAuthenticated } from "../helpers/useAuthenticated";
import { useRouter } from "next/navigation";
import { LuLoaderCircle } from "react-icons/lu";

import { setGenerating } from "../redux/reducers/projectOptions";
import { API } from "../config/Config";
import { setNotification } from "../redux/reducers/NotificationModalReducer";
import { BsArrowUp, BsLightningChargeFill } from "react-icons/bs";
import { useSubscriptionCheck } from "../helpers/useSubscriptionCheck";
import { EmptySheet } from "../redux/reducers/projectFiles";
import { WavyBackground } from "./Waves";

const Hero = () => {
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [attachments, setAttachments] = useState<
    Array<{
      file: File;
      preview: string;
      type: "image";
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<boolean>(false);

  const { isAuthenticated, email } = useAuthenticated();

  const { needsUpgrade, checkSubscriptionStatus } = useSubscriptionCheck({
    isAuthenticated: isAuthenticated.value,
    email: email?.value || "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const mainContentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2, delay: 0.2 } },
  };

  const inputBoxVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2, delay: 0.3 } },
  };

  const typewriterTexts = [
    "Build a To‑Do List with drag‑and‑drop & local‑storage sync…",
    "Build an Expense Tracker with charts & filters…",
    "Build a Recipe Finder + shopping‑list integration…",
    "Build a Weather Dashboard with live API & responsive layout…",
    "Build a Music Player UI with playlist & theme switch…",
    "Build a Portfolio site with animations & CMS feed…",
    "Build a Chat UI mockup with unread badges & message input…",
    "Build a Quiz App with timer, scoring & progress bar…",
    "Build a Meme Generator (text‑over‑image, share/download)…",
    "Build an Interactive Dashboard with charts & widgets…",
    "Build a Photo Gallery with grid, lightbox & upload UI…",
    "Build a Habit Tracker with streaks and reminders…",
  ];

  useEffect(() => {
    const currentText = typewriterTexts[textIndex];

    const typingSpeed = isDeleting ? 50 : 100; // Faster delete speed
    const nextCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;

    const updateText = () => {
      setPlaceholder(currentText.substring(0, nextCharIndex));

      if (!isDeleting && nextCharIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && nextCharIndex === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
      setCharIndex(nextCharIndex);
    };

    const timeout = setTimeout(updateText, typingSpeed);
    return () => {
      clearTimeout(timeout);
    };
  }, [charIndex, isDeleting, textIndex, typewriterTexts]);

  const handleAttachClick = () => {
    if (!isAuthenticated.value) {
      dispatch(setLoginModalOpen(true));
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  function encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!isAuthenticated.value) {
        dispatch(setLoginModalOpen(true));
      } else {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Limit to 2 attachments
        if (attachments.length >= 2) {
          alert("You can only attach up to 2 files");
          return;
        }

        const newFile = files[0];

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png"];
        const isValidType = validImageTypes.includes(newFile.type);

        if (!isValidType) {
          alert("Please upload only images.");
          return;
        }

        // Generate a unique file name
        const uniqueFileName = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Show loading state
        setAttachments((prev) => [
          ...prev,
          {
            file: newFile,
            preview: "",
            type: "image",
            isUploading: true,
            name: uniqueFileName, // Store unique name
          },
        ]);

        // Upload to S3 or server
        const uploadedUrl = await getPresignedUrl(newFile, uniqueFileName);
        if (!uploadedUrl) {
          dispatch(
            setNotification({
              modalOpen: true,
              status: "error",
              text: "Error uploading!",
            })
          );
          return;
        }

        dispatch(addImageURL(uploadedUrl));

        // Convert image to Base64
        const base64Image = await encodeImageToBase64(newFile);
        dispatch(addImage(base64Image));

        // Create preview URL
        const filePreview = URL.createObjectURL(newFile);

        // Update attachment list (remove loading state & add URL)
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === newFile
              ? {
                  ...att,
                  preview: filePreview,
                  isUploading: false,
                  uploadedUrl, // Store URL
                }
              : att
          )
        );
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev];

      // Remove from Redux using index
      dispatch(removeImage(index));
      dispatch(removeImageURL(index));

      // Revoke object URL to free memory
      if (newAttachments[index]?.preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }

      // Remove the attachment from state
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const getPresignedUrl = async (file: File, name: string): Promise<string> => {
    try {
      const response = await fetch(`${API}/get-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: name,
          fileType: file.type,
          email: email.value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { uploadURL, url } = await response.json();
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed! status: ${uploadResponse.status}`);
      }

      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      setAttachments((prev) => {
        const failedAttachmentIndex = prev.length - 1;
        if (failedAttachmentIndex < 0) return prev;

        const newAttachments = [...prev];
        const failedAttachment = newAttachments[failedAttachmentIndex];

        // Remove from Redux
        dispatch(removeImage(failedAttachmentIndex));
        dispatch(removeImageURL(failedAttachmentIndex));

        // Cleanup preview URL
        if (failedAttachment?.preview) {
          URL.revokeObjectURL(failedAttachment.preview);
        }

        // Remove the failed attachment
        newAttachments.splice(failedAttachmentIndex, 1);
        return newAttachments;
      });

      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Failed to upload image. Please try again.",
        })
      );

      throw new Error("Failed to get presigned URL");
    }
  };

  const checkStatus = useCallback(async () => {
    if (isAuthenticated.value && email.value && !checkRef.current) {
      checkRef.current = true;
      await checkSubscriptionStatus();
    }
  }, [checkSubscriptionStatus, email.value, isAuthenticated.value]);

  useEffect(() => {
    // Only check subscription status once when component mounts
    checkStatus();

    // Cleanup function for attachments
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachments, checkStatus, email.value]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    sessionStorage.clear();
    if (loading) return;

    if (input.trim()) {
      sessionStorage.setItem("input", input);
      const characters = "abcdefghijklmnopqrstuvwxyz123456789";
      const generateSegment = (length: number) =>
        Array.from({ length }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");

      const projectId = `${generateSegment(8)}-${generateSegment(8)}-${generateSegment(8)}-${generateSegment(8)}`;

      sessionStorage.setItem("projectId", projectId);

      if (isAuthenticated.value && projectId && email.value && !loading) {
        dispatch(
          setGenerating({
            generating: true,
            generationSuccess: null,
            isResponseCompleted: false,
          })
        );
        dispatch(EmptySheet());

        router.push(`/projects/${projectId}`);
      } else {
        dispatch(setLoginModalOpen(true));
      }
    }
  }, [loading, input, isAuthenticated.value, email.value, dispatch, router]);

  return (
    <main className="min-h-screen bg-[#0A0A0D] grid grid-cols-1 gap-10 md:gap-16 px-6 py-24 overflow-hidden relative justify-center items-center">
      {/* Header */}
      <Header />

      <WavyBackground className="max-w-4xl mx-auto pb-40">
        <div className="h-[50vh] justify-between flex flex-col items-center z-20">
          {/* Hero Section */}
          <section className="w-full max-w-4xl mx-auto mt-10 justify-center items-center ">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={mainContentVariants}
              className="text-center space-y-5"
            >
              <h1 className="text-4xl sm:text-7xl font-[insSerif] text-balance font-bold text-white tracking-tight leading-tight">
                Think, Prompt,
                <span className="bg-gradient-to-r from-[#b4ff00] font-[insSerifIt] to-[#95d500] text-transparent bg-clip-text">
                  {"  "}ship
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-[#b1b1b1] font-medium max-w-xl mx-auto">
                Create <span className="text-[#b4ff00]"> Frontend </span>
                UIs with AI in minutes!
              </p>
            </motion.div>
          </section>

          {/* Input Section */}
          <section
            aria-label="prompt-input"
            className="w-full max-w-2xl mx-auto"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={inputBoxVariants}
              className="w-full space-y-4"
            >
              {needsUpgrade === true && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="justify-center items-center flex text-center p-3 rounded-lg bg-[#141415]/60 backdrop-blur-xl border border-white/10 shadow-lg my-2"
                >
                  <div className="flex items-center gap-3 text-sm font-sans font-medium">
                    <span className="text-white/90">
                      Unlock{" "}
                      <span className="text-[#A9F000] font-semibold">
                        unlimited creativity
                      </span>{" "}
                      with Scale! Get 60x more prompts.
                    </span>
                  </div>
                </motion.div>
              )}
              {/*  TEXT INPUT (FIRST) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[#141415]/70 backdrop-blur-md border border-white/5 rounded-lg p-4 flex flex-col items-start justify-center shadow-lg min-h-[120px] w-full"
              >
                {/* Attachment Preview */}
                <AttachmentPreview
                  attachments={attachments}
                  onRemove={handleRemoveAttachment}
                />

                <textarea
                  maxLength={3000}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-white outline-none text-sm resize-none w-full min-h-[100px] max-h-[250px] overflow-hidden scrollbar-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();

                      if (needsUpgrade) {
                        dispatch(setPricingModalOpen(true));
                      } else {
                        if (input.trim() && !loading) {
                          handleGenerate();
                        }
                      }
                    }
                  }}
                />

                {/* Action Buttons */}
                <div className="justify-between items-center flex w-full">
                  <button
                    disabled={loading || (needsUpgrade as boolean)}
                    onClick={handleAttachClick}
                    className="cursor-pointer text-[#71717A] px-2 p-1 rounded-md text-xs font-sans font-medium gap-x-1 flex justify-center items-center hover:bg-[#2a292c] transition-colors"
                  >
                    <FaPaperclip size={15} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {needsUpgrade === true ? (
                    <button
                      disabled={loading}
                      onClick={() => {
                        dispatch(setPricingModalOpen(true));
                      }}
                      className="justify-center items-center flex font-sans py-1 gap-x-1 font-medium text-black bg-[#b4ff00] rounded-md hover:bg-[#95d500] text-xs border border-[#95d500] cursor-pointer px-2 p-1"
                    >
                      Upgrade to scale
                      <BsLightningChargeFill />
                    </button>
                  ) : needsUpgrade === false ? (
                    <button
                      disabled={loading}
                      onClick={handleGenerate}
                      className="cursor-pointer hover:bg-gray-200 text-[#71717A] bg-white p-2 rounded-md text-xs font-sans font-medium gap-x-1 flex justify-center items-center"
                    >
                      {loading ? (
                        <LuLoaderCircle className="animate-spin" />
                      ) : (
                        <BsArrowUp />
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={loading}
                      className="cursor-pointer hover:bg-gray-200 text-[#71717A] bg-white p-2 rounded-md text-xs font-sans font-medium gap-x-1 flex justify-center items-center"
                    >
                      <LuLoaderCircle className="animate-spin" />
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </WavyBackground>
    </main>
  );
};

export default Hero;
