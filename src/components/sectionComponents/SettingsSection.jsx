import React, { useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ChartRoseIcon,
  Invoice01Icon,
  Logout01Icon,
  LogoutSquare02Icon,
  MoneyBag01Icon,
  PaintBrush04Icon,
  SavingsIcon,
  UserBlock01Icon,
  UserEdit01Icon,
  Wallet04Icon,
} from "@hugeicons/core-free-icons";
// 1C1C1E -> active
export default function SettingsSection() {
  const [theme, setTheme] = useState(false);
  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-y-scroll bg-[#000000] p-[25px] text-[#D4D4D4] text-[18px] font-[tnm] select-none">
      {/* <div className="font-[tnb] text-[25px]">Settings</div> */}
      <div className="mt-[0px] pl-[15px] mb-[5px] uppercase w-full flex justify-start items-center font-[tnr] text-[16px] text-[#797979]">
        Account Info
      </div>
      <div className="w-full flex justify-start items-start rounded-xl overflow-hidden bg-[#1c1c1ead] h-[70px] p-[15px]">
        <div className="w-[40px] overflow-hidden h-[40px] rounded-full flex justify-start items-center bg-[#1C1C1E]">
          <img
            className="w-full h-full object-cover "
            src="https://images.pexels.com/photos/4203842/pexels-photo-4203842.jpeg"
          ></img>
        </div>
        <div className="ml-[15px] w-[calc(100%-55px)] flex flex-col justify-center items-start mt-[-4px]">
          <div className="uppercase">Himadri Purkait</div>
          <div className="text-[#797979] font-[tnr] mt-[-5px]">
            purkaithimadricollege@gmail.com
          </div>
        </div>
      </div>
      <div className="mt-[40px] pl-[15px] mb-[5px] uppercase w-full flex justify-start items-center font-[tnr] text-[16px] text-[#797979]">
        General
      </div>
      <div className="w-full flex flex-col justify-start items-start rounded-xl overflow-hidden bg-[#1c1c1ead]">
        <div className="w-full px-[15px] flex justify-start items-center h-[50px] active:bg-[#1C1C1E]">
          <HugeiconsIcon
            icon={UserEdit01Icon}
            size={20}
            strokeWidth={1.7}
            className="mr-[10px]"
          />
          Edit Profile{" "}
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#1f1f21] "></div>
        {/* <div className="w-full px-[15px] flex justify-start items-center h-[50px]">
          <HugeiconsIcon
            icon={UserEdit01Icon}
            size={20}
            strokeWidth={1.7}
            className="mr-[10px]"
          />
          Account
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#222224] "></div> */}
        <div
          className="w-full px-[15px] flex justify-between items-center h-[50px] active:bg-[#1C1C1E]"
          onClick={() => {
            setTheme(!theme);
          }}
        >
          <div className="flex justify-start items-center">
            <HugeiconsIcon
              icon={PaintBrush04Icon}
              size={20}
              strokeWidth={1.7}
              className="mr-[10px]"
            />
            Theme
          </div>
          <div
            className={
              "w-[40px] h-[28px] rounded-full flex justify-start items-center" +
              (theme ? " bg-[#7ED957]" : " bg-[#000000]")
            }
            style={{ transition: ".3s" }}
          >
            <div
              className={
                "h-[22px] w-[22px] rounded-full drop-shadow-lg " +
                (theme ? " ml-[15px] bg-[#ffffff]" : " ml-[3px] bg-[#2b2b2e]")
              }
              style={{ transition: ".3s" }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-[40px] pl-[15px] mb-[5px] uppercase w-full flex justify-start items-center font-[tnr] text-[16px] text-[#797979]">
        Related to Expense
      </div>
      <div className="w-full flex flex-col justify-start items-start rounded-xl overflow-hidden bg-[#1c1c1ead]">
        <div className="w-full px-[15px] flex justify-between items-center h-[50px] active:bg-[#1C1C1E]">
          <div className="flex justify-start items-center">
            <HugeiconsIcon
              icon={SavingsIcon}
              size={20}
              strokeWidth={1.7}
              className="mr-[10px]"
            />
            Update Budget
          </div>
          <div className="flex justify-end items-center text-[#797979]">
            <span className="text-[16px] mt-[2px] mr-[4px]">₹</span> 20,000
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={20}
              strokeWidth={1.7}
              className="ml-[5px]"
            />
          </div>
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#1f1f21] "></div>
        <div className="w-full px-[15px] flex justify-between items-center h-[50px] active:bg-[#1C1C1E]">
          <div className="flex justify-start items-center">
            <HugeiconsIcon
              icon={Wallet04Icon}
              size={20}
              strokeWidth={1.7}
              className="mr-[10px]"
            />
            Update Income
          </div>
          <div className="flex justify-end items-center text-[#797979]">
            <span className="text-[16px] mt-[2px] mr-[4px]">₹</span> 50,000
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={20}
              strokeWidth={1.7}
              className="ml-[5px]"
            />
          </div>
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#1f1f21] "></div>
        <div className="w-full px-[15px] flex justify-between items-center h-[50px] active:bg-[#1C1C1E]">
          <div className="flex justify-start items-center">
            <HugeiconsIcon
              icon={MoneyBag01Icon}
              size={20}
              strokeWidth={1.7}
              className="mr-[10px]"
            />
            Total Savings
          </div>
          <div className="flex justify-end items-center text-[#797979]">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={20}
              strokeWidth={1.7}
              className="ml-[5px]"
            />
          </div>
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#1f1f21] "></div>
        <div className="w-full px-[15px] flex justify-between items-center h-[50px] active:bg-[#1C1C1E]">
          <div className="flex justify-start items-center">
            <HugeiconsIcon
              icon={ChartRoseIcon}
              size={20}
              strokeWidth={1.7}
              className="mr-[10px]"
            />
            Report
          </div>
          <div className="flex justify-end items-center text-[#797979]">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={20}
              strokeWidth={1.7}
              className="ml-[5px]"
            />
          </div>
        </div>
      </div>
      <div className="mt-[40px] pl-[15px] mb-[5px] uppercase w-full flex justify-start items-center font-[tnr] text-[16px] text-[#797979]">
        Other
      </div>
      <div className="w-full flex flex-col justify-start items-start rounded-xl overflow-hidden bg-[#1c1c1ead]">
        <div className="w-full px-[15px] flex justify-start items-center h-[50px] active:bg-[#1C1C1E] ">
          <HugeiconsIcon
            icon={UserBlock01Icon}
            size={20}
            strokeWidth={1.7}
            className="mr-[10px]"
          />
          Delete Account
        </div>
        <div className="w-[calc(100%-30px)] ml-[15px] border-t-[1px] border-[#1f1f21] "></div>
        <div className="w-full px-[15px] flex justify-start items-center h-[50px] text-[#FF6F6F] active:text-[#e73939] active:bg-[#1C1C1E]">
          <HugeiconsIcon
            icon={Logout01Icon}
            size={20}
            strokeWidth={1.7}
            className="mr-[10px]"
          />
          Log Out
        </div>
      </div>
    </div>
  );
}
