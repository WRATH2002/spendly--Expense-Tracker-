import React from "react";
import { motion } from "framer-motion";

export default function SettingsSection() {
  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-y-scroll bg-[#000000] p-[15px] text-[#D4D4D4] ">
      <motion.div
        className="w-full h-[500px] bg-slate-400 fixed bottom-0 left-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
      {/* <div className="w-[120px] aspect-square rounded-full bg-slate-600"></div> */}
      {/* <div className="w-full bg-[#1C1C1E] rounded-2xl p-[25px] flex justify-start items-center">
        <div className="w-[60px] aspect-square rounded-full bg-[#2e2e31]"></div>
        <div className="w-[calc(100%-60px)] flex flex-col justify-center items-start pl-[25px]">
          <div className="font-[ib] text-[18px]">Himadri Purkait</div>
          <div className="font-[ir] text-[#797979]">
            purkaithimadricollege@gmal.com
          </div>
        </div>
      </div> */}
    </div>
  );
}
