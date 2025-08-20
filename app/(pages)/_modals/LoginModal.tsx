"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { setLoginModalOpen } from "@/app/redux/reducers/basicData";
import { EmailLogin, signInWithProvider } from "@/app/_services/login";
import { LuLoaderCircle } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { unstable_batchedUpdates } from "react-dom";
import OtpInput from "@/app/_components/OtpInput";

import { setNotification } from "@/app/redux/reducers/NotificationModalReducer";
import { signIn } from "next-auth/react";

const LoginModal: React.FC = () => {
  const { loginModalOpen } = useSelector((state: RootState) => state.basicData);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [googleLoad, setGoogleLoad] = useState(false);
  const dispatch = useDispatch();

  const router = useRouter();

  const onClose = () => {
    try {
      unstable_batchedUpdates(() => {
        setStep(1);
        setOtp("");
        setEmail("");
        dispatch(setLoginModalOpen(false));
      });
    } catch (error) {
      console.log(error, "Error closing Login modal");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        dispatch(
          setNotification({
            status: "error",
            text: "Invalid Email",
            modalOpen: true,
          })
        );
        return;
      }

      const result = await EmailLogin({ email });
      if (result.success) {
        setStep(2);
      } else {
        dispatch(
          setNotification({
            status: "error",
            text: result.message,
            modalOpen: true,
          })
        );
      }
    } else if (step === 2) {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      if (result?.ok) {
        const projectId = sessionStorage.getItem("projectId");

        unstable_batchedUpdates(() => {
          setStep(1);
          setOtp("");
          setEmail("");
          dispatch(setLoginModalOpen(false));
        });

        if (projectId) {
          router.push(`/projects/${projectId}`);
        }
      } else {
        dispatch(
          setNotification({
            status: "error",
            text: "Something went wrong!",
            modalOpen: true,
          })
        );
      }
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: "google") => {
    setGoogleLoad(true);

    try {
      await signInWithProvider(provider);
    } catch (err) {
      console.log(err);
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: `Could not start sign-in with ${provider}.`,
        })
      );

      setGoogleLoad(false);
    }
  };

  if (!loginModalOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-[#0A0A0D]/70 backdrop-blur-md border border-white/10 shadow-2xl md:mx-0 mx-3"
      >
        <div className="relative overflow-hidden">
          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between text-balance flex-col space-y-3">
              <h2 className="text-xl font-[insSerif] text-white font-bold">
                Continue to{" "}
                <span className="bg-gradient-to-r from-[#b4ff00] to-[#95d500] text-transparent bg-clip-text">
                  mallow
                </span>
              </h2>
              {step !== 2 && (
                <p className="text-sm font-sans font-medium text-white text-center">
                  Create <span className="text-[#b4ff00]">UIs in minutes</span>{" "}
                  join the community of more than 500+ dev who trusted us!
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {step === 1 ? (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/70"
                  >
                    Email
                  </label>
                  <input
                    disabled={googleLoad || isLoading}
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="text-xs font-sans font-medium mt-1 block w-full rounded-md border-white/10 bg-white/5 p-2 text-white placeholder-white/40 shadow-sm focus:border-none focus:outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              ) : step === 2 ? (
                <div>
                  <OtpInput
                    email={email}
                    handleStep={setStep}
                    otp={otp}
                    handleOtpChange={setOtp}
                    disabled={isLoading || googleLoad}
                  />
                </div>
              ) : (
                <div className="text-xs font-sans font-medium text-white">
                  Oh no! Something went wrong.
                </div>
              )}

              <button
                type="submit"
                disabled={googleLoad || isLoading}
                className="w-full rounded-md bg-white px-4 py-2 font-medium text-black shadow-sm hover:bg-[#95d500] focus:outline-none transition-colors font-sans text-xs justify-center items-center flex"
              >
                {isLoading ? (
                  <LuLoaderCircle className="text-black animate-spin text-sm" />
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {step === 1 && (
              <>
                {/* Divider */}
                <div className="my-4 flex items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Social Login - Google only */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleOAuthLogin("google");
                    }}
                    disabled={googleLoad || isLoading}
                    className="flex w-full items-center justify-center rounded-md bg-white/5 p-2 text-xs font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
                  >
                    {googleLoad ? (
                      <LuLoaderCircle className="animate-spin text-white text-sm" />
                    ) : (
                      <>
                        <svg
                          className="mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;
