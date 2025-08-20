import { RootState } from "@/app/redux/store";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

function StreamDataDisplay() {
  const { markdown } = useSelector((state: RootState) => state.projectFiles);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(true);

  // Color palette for random word coloring
  const colors = [
    "text-white",
    "text-red-400",
    "text-yellow-400",
    "text-blue-400",
  ];

  // Function to get random color
  const getRandomColor = useCallback(() => {
    return colors[Math.floor(Math.random() * colors.length)];
  }, [colors]);

  // Process markdown text with random colors
  const coloredMarkdown = useMemo(() => {
    if (!markdown) return null;

    const words = markdown.split(/(\s+)/); // Split by whitespace but keep the whitespace
    return words.map((word, index) => {
      if (word.trim() === "") {
        return word; // Return whitespace as-is
      }
      return (
        <span key={index} className={getRandomColor()}>
          {word}
        </span>
      );
    });
  }, [markdown, getRandomColor]);

  // Fast auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && isAutoScrolling.current) {
      // Immediate scroll for faster response
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll when new content streams in - faster response
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 10); // Reduced delay for faster scrolling

    return () => clearTimeout(timeoutId);
  }, [markdown, scrollToBottom]);

  // Handle manual scrolling - pause auto-scroll if user scrolls up
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      isAutoScrolling.current = isAtBottom;
    }
  }, []);

  return (
    <div className="justify-center items-center flex h-full relative">
      {/* Flow Container with blur effects */}
      <div className="w-1/2 h-1/2 relative overflow-hidden rounded-lg border border-gray-700/30 bg-black/20 backdrop-blur-sm">
        {/* Top blur overlay */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#121214] via-[#121214]/80 to-transparent backdrop-blur-md z-10 pointer-events-none" />

        {/* Main content area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full bg-transparent px-6 py-8 overflow-y-auto scrollbar-hide"
          style={{
            overscrollBehavior: "contain",
          }}
        >
          <div className="min-h-full flex flex-col justify-end">
            <div className="whitespace-pre-wrap font-sans font-medium text-sm leading-relaxed break-words">
              {coloredMarkdown}
            </div>
          </div>
        </div>

        {/* Bottom blur overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#121214] via-[#121214]/80 to-transparent backdrop-blur-md z-10 pointer-events-none" />
      </div>
    </div>
  );
}

export default StreamDataDisplay;
