"use client";
import { setReaderMode } from "@/app/redux/reducers/projectOptions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useCallback, useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import StreamedDataDisplay from "./StreamDataDisplay";

const Thoughts = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRead = useCallback(() => {
    dispatch(setReaderMode(true));
  }, [dispatch]);

  const { generating, readerMode } = useSelector(
    (state: RootState) => state.projectOptions
  );

  useEffect(() => {
    const interval = setInterval(() => {
      handleRead();
    }, 2500);

    return () => clearInterval(interval);
  }, [handleRead]);

  return (
    <div className="flex-grow w-full h-full overflow-hidden relative px-3">
      {generating && readerMode ? (
        <StreamedDataDisplay />
      ) : (
        <p className="absolute transform -translate-1/2 left-1/2 flex-col top-[40vh] max-md:top-[35vh] text-2xl font-[insSerifIt] font-medium text-white flex gap-x-2 justify-center items-center w-full">
          Agent is building the project
          <LuLoaderCircle className="text-lg text-white animate-spin mt-5" />
        </p>
      )}
    </div>
  );
};

export default Thoughts;
