import {
  Add02Icon,
  Home02Icon,
  Payment01Icon,
  Payment02Icon,
  PieChartIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function BottomNavbar(props) {
  return (
    <div className="w-full h-full flex justify-evenly items-center text-[#D4D4D4] bg-gradient-to-t from-[#000000] to-[#00000030] backdrop-blur-[30px] ">
      <HugeiconsIcon
        icon={Home02Icon}
        size={24}
        strokeWidth={2}
        className={
          "active:text-[#DADADA] " +
          (props?.activeSection == "home"
            ? " text-[#DADADA]"
            : " text-[#797979]")
        }
        onClick={() => {
          if (props?.activeSection !== "home") {
            props.setActiveSection("home");
          }
        }}
      />
      <HugeiconsIcon
        icon={PieChartIcon}
        size={24}
        strokeWidth={2}
        className={
          "active:text-[#DADADA] " +
          (props?.activeSection == "chart"
            ? " text-[#DADADA]"
            : " text-[#797979]")
        }
        onClick={() => {
          if (props?.activeSection !== "chart") {
            props.setActiveSection("chart");
          }
        }}
      />
      <HugeiconsIcon
        icon={Add02Icon}
        size={28}
        strokeWidth={0}
        className={
          "active:text-[#DADADA] " +
          (props?.activeSection == "addNew"
            ? " text-[#DADADA]"
            : " text-[#797979]")
        }
        onClick={() => {
          //   if (props?.activeSection !== "addNew") {
          //     props.setActiveSection("addNew");
          //   }
          props?.setShowAddTransactionModal(true);
        }}
        fill="currentColor"
      />
      <HugeiconsIcon
        icon={Payment01Icon}
        size={24}
        strokeWidth={2}
        className={
          "active:text-[#DADADA] " +
          (props?.activeSection == "split"
            ? " text-[#DADADA]"
            : " text-[#797979]")
        }
        onClick={() => {
          if (props?.activeSection !== "split") {
            props.setActiveSection("split");
          }
        }}
      />
      <HugeiconsIcon
        icon={Settings03Icon}
        size={24}
        strokeWidth={2}
        className={
          "active:text-[#DADADA] " +
          (props?.activeSection == "settings"
            ? " text-[#DADADA]"
            : " text-[#797979]")
        }
        onClick={() => {
          if (props?.activeSection !== "settings") {
            props.setActiveSection("settings");
          }
        }}
      />{" "}
    </div>
  );
}
