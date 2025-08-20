"use client";
import { setNotification } from "@/app/redux/reducers/NotificationModalReducer";

import { useDispatch } from "react-redux";

import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useGenerateFile } from "@/app/_services/useGenerateFile";

const EnhancedPrompt = ({
  enh_prompt,
  projectId,
}: {
  enh_prompt: string;
  projectId: string;
}) => {
  let initialDetails;
  try {
    initialDetails = JSON.parse(enh_prompt);
  } catch (error) {
    // If parsing fails, treat it as a plain text plan
    initialDetails = {
      plan: enh_prompt,
      framework: "other", // Default to non-webcomponents
      summary: "",
      features: [],
      memoryEnhancement: "",
      theme: "",
    };
    console.log(error);
  }

  const dispatch = useDispatch();

  const { email } = useAuthenticated();

  const { genFile } = useGenerateFile();

  if (!enh_prompt) return null;

  const handleStart = async () => {
    try {
      genFile({ email: email.value || "", projectId, input: enh_prompt });
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Something went wrong!",
        })
      );
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full h-full z-30">
      <div className="absolute transform -translate-y-1/2 top-1/2 space-y-3 bg-transparent p-8 rounded-xl border border-white/10 shadow-xl">
        <h3 className="text-lg font-semibold text-white">Proposed Plan</h3>
        <div className="max-md:w-[80vw] md:w-[50vw] pb-10 overflow-y-auto rounded-lg  text-white font-sans font-medium">
          <div className="space-y-4">
            {/* Summary Section */}
            {initialDetails.summary && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">
                  Summary
                </h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {initialDetails.summary}
                </p>
              </div>
            )}

            {/* Features Section */}
            {initialDetails.features && initialDetails.features.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">
                  Features
                </h4>
                <ul className="space-y-1">
                  {initialDetails.features.map(
                    (feature: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-white/80 flex items-start"
                      >
                        <span className="text-white/60 mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Theme Section */}
            {initialDetails.theme && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">
                  Theme
                </h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {initialDetails.theme}
                </p>
              </div>
            )}

            {/* Framework Section */}
            {initialDetails.framework &&
              initialDetails.framework !== "other" && (
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-2">
                    Framework
                  </h4>
                  <p className="text-sm text-white/80 capitalize">
                    {initialDetails.framework}
                  </p>
                </div>
              )}

            {/* Fallback for plain text plan */}
            {!initialDetails.summary &&
              !initialDetails.features?.length &&
              initialDetails.plan && (
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-2">
                    Plan
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                    {initialDetails.plan}
                  </pre>
                </div>
              )}
          </div>
        </div>

        <div className="justify-end flex items-center space-x-5">
          <button
            onClick={handleStart}
            className="cursor-pointer bg-white/90 text-black hover:bg-white rounded-md px-2 py-1 gap-x-1 justify-center items-center flex font-sans font-medium text-xs backdrop-blur-sm shadow-lg transition-all duration-300"
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPrompt;
