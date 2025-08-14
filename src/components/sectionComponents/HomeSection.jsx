import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CircleArrowDown01Icon,
  CircleArrowDown02Icon,
  FilterVerticalIcon,
  Search01Icon,
  TradeUpIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { act, useEffect, useState } from "react";

// --------------- Firebase related imports
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import firebase from "../../firebase";

// --------------- React Router DOM related imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  changeMonthIndex,
  formatNumberWithCommasAndTwoDigits,
  formatNumberWithOnlyTwoDigits,
  getCategoryWiseCountWithInfoForTheMonth,
  getExpensesForTheMonth,
  getTopCategoryForTheMonth,
  getTotalExpenseForTheMonth,
} from "../../utils/functions";
import { colorCode, creamyCoolColors, monthName } from "../../utils/constants";
import TransactionBlock from "../TransactionBlock";
import CountUp from "../animations/CountUp";

const getColor = (value) => {
  if (value < 45) return "#7ED957"; // green color -> creamy
  else if (value < 75) return "#FFD766"; // yellow color -> creamy
  else {
    return "#FF6F6F"; // red color -> creamy
  } // green
};

export default function HomeSection(props) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [categoryToMapping, setCategoryToMapping] = useState([]);
  // const color = getColor(
  //   (getTotalExpenseForTheMonth(
  //     props.allTransactions,
  //     activeMonthIndex,
  //     activeYear
  //   ) /
  //     budget) *
  //     100
  // );
  const [activeMonthIndex, setActiveMonthIndex] = useState(
    parseInt(new Date().getMonth())
  );
  const [activeYear, setActiveYear] = useState(
    parseInt(new Date().getFullYear())
  );
  const [showSearch, setShowSearch] = useState(false);
  const [budget, setBudget] = useState(30000);
  const [showAllDistribution, setShowAllDistribution] = useState(false);

  const navigate = useNavigate();

  // ------------ Function to navigate to desire path
  function navigateToPage(path) {
    navigate(`${path}`);
  }

  // --------- Checking if User is logged in and performing task based on that state
  useEffect(() => {
    const authUserLoginState = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAllTransactions();
      } else {
        navigateToPage(`/user/login`);
      }
    });

    return () => authUserLoginState();
  }, [activeMonthIndex]);

  // ---------- Function to get AllTransactions from Firestore Database
  function fetchAllTransactions() {
    const user = firebase.auth().currentUser;

    const transactionsRef = db
      .collection("userSpace")
      .doc(user?.uid)
      ?.collection("AllTransactionsSpace")
      .doc("AllTransactions");

    const categoryMappingRef = db
      .collection("userSpace")
      .doc(user?.uid)
      ?.collection("CategoryToIcon")
      .doc("CategoryToIcon");

    onSnapshot(transactionsRef, (snapshot) => {
      console.log(
        "Fetched %cTransactions%c Info =>",
        "color: #1caee8; font-weight: bold;",
        "color: #ffffff;"
      );
      console.table(snapshot?.data()?.AllTransactions);
      setAllTransactions(snapshot?.data()?.AllTransactions);
    });

    onSnapshot(categoryMappingRef, (snapshot) => {
      console.log(
        "Fetched %cCategory To Icon Mapping%c Info =>",
        "color: #1caee8; font-weight: bold;",
        "color: #ffffff;"
      );
      console.log(snapshot?.data()?.categoryToIconMappingInfo);
      setCategoryToMapping(snapshot?.data()?.categoryToIconMappingInfo);
    });
  }

  useEffect(() => {
    getCategoryWiseCountWithInfoForTheMonth(
      allTransactions,
      activeMonthIndex,
      activeYear
    );
  }, [activeMonthIndex]);
  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-y-scroll bg-[#000000] p-[15px] text-[#D4D4D4] ">
      <div className="w-full flex flex-col justify-center items-center font-[ieb] text-[30px] bg-[#1C1C1E] rounded-3xl p-[25px] mb-[10px]">
        <div className="w-full flex flex-col justify-start items-start">
          <div className="flex justify-between items-center font-[ir] mb-[20px]">
            <div className="text-[#797979] text-[14px] font-[ib] flex justify-start items-center ">
              <div
                className="w-[26px] h-[26px] flex justify-center items-center rounded-lg border-[1.5px] border-[#2c2b2e] mr-[10px] bg-[#28272A] hover:text-[white] cursor-pointer"
                onClick={() => {
                  changeMonthIndex(
                    "previous",
                    activeMonthIndex,
                    activeYear,
                    setActiveMonthIndex,
                    setActiveYear
                  );
                }}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={18}
                  strokeWidth={2.5}
                  className=" mr-[5px]"
                />
              </div>
              <span className="mr-[5px] text-[#D4D4D4] uppercase font-[ib] text-[14px]">
                {monthName[activeMonthIndex]?.full},
              </span>
              {activeYear}
              <div
                className={
                  "w-[26px] h-[26px] justify-center items-center rounded-lg border-[1.5px] border-[#2c2b2e] ml-[10px] bg-[#28272A] hover:text-[white] cursor-pointer" +
                  (activeMonthIndex === parseInt(new Date().getMonth()) &&
                  activeYear === parseInt(new Date().getFullYear())
                    ? " hidden"
                    : " flex")
                }
                onClick={() => {
                  changeMonthIndex(
                    "next",
                    activeMonthIndex,
                    activeYear,
                    setActiveMonthIndex,
                    setActiveYear
                  );
                }}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  strokeWidth={2.5}
                  className={
                    " ml-[5px]" +
                    (activeMonthIndex === parseInt(new Date().getMonth()) &&
                    activeYear === parseInt(new Date().getFullYear())
                      ? " hidden"
                      : " flex")
                  }
                />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-[#D4D4D4] text-[34px] font-[ieb] flex justify-start items-center ">
              <span className="mr-[10px]">₹</span>
              <CountUp
                from={0}
                to={getTotalExpenseForTheMonth(
                  props.allTransactions,
                  activeMonthIndex,
                  activeYear
                )}
                decimals={2}
                separator=","
                direction="up"
                duration={0.2}
                className="count-up-text"
              />

              {/* {getTotalExpenseForTheMonth(
                props.allTransactions,
                activeMonthIndex,
                activeYear
              )} */}
            </div>
            <div className="max-h-[50px] aspect-square rounded-full font-[ieb] ">
              <CircularProgressbar
                value={
                  (getTotalExpenseForTheMonth(
                    props.allTransactions,
                    activeMonthIndex,
                    activeYear
                  ) /
                    budget) *
                  100
                }
                text={
                  Math.round(
                    (getTotalExpenseForTheMonth(
                      props.allTransactions,
                      activeMonthIndex,
                      activeYear
                    ) /
                      budget) *
                      100
                  ) < 100
                    ? `${Math.round(
                        (getTotalExpenseForTheMonth(
                          props.allTransactions,
                          activeMonthIndex,
                          activeYear
                        ) /
                          budget) *
                          100
                      )}%`
                    : "100%"
                }
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: getColor(
                    (getTotalExpenseForTheMonth(
                      props.allTransactions,
                      activeMonthIndex,
                      activeYear
                    ) /
                      budget) *
                      100
                  ),
                  textColor: getColor(
                    (getTotalExpenseForTheMonth(
                      props.allTransactions,
                      activeMonthIndex,
                      activeYear
                    ) /
                      budget) *
                      100
                  ),
                  trailColor: "#28272A",
                  textSize: "20px",
                })}
              />
            </div>
          </div>
          <div className="w-full my-[20px] border-t-[1.5px] border-[#28272A]"></div>
          <div className="w-full flex justify-start items-start">
            <div className="text-[#D4D4D4] text-[34px] flex flex-col justify-start items-start ">
              <div className="text-[14px] text-[#797979] font-[ir]">
                Transactions
              </div>
              <div className="text-[14px] font-[isb] mt-[7px] flex justify-start items-center">
                {
                  getExpensesForTheMonth(
                    props.allTransactions,
                    activeMonthIndex,
                    activeYear
                  ).length
                }{" "}
                <div className="flex justify-start items-center  text-[#7ED957] font-[im] text-[10px] ml-[10px]">
                  <HugeiconsIcon
                    icon={TradeUpIcon}
                    size={16}
                    strokeWidth={1.6}
                    className="mr-[3px]"
                  />
                  23%
                </div>
              </div>
            </div>
            <div className="text-[#D4D4D4] text-[34px] flex flex-col justify-start items-start ml-[30px] ">
              <div className="text-[14px] text-[#797979] font-[ir]">
                Top Category
              </div>
              <div className="text-[14px] font-[isb] mt-[7px]">
                {getTopCategoryForTheMonth(
                  getExpensesForTheMonth(
                    props.allTransactions,
                    activeMonthIndex,
                    activeYear
                  ),
                  activeMonthIndex,
                  activeYear
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mt-[30px]">
            <div className="text-[14px] text-[#797979] font-[ir] mb-[5px]">
              Expense Distribution
            </div>

            {Object.keys(
              getCategoryWiseCountWithInfoForTheMonth(
                allTransactions,
                activeMonthIndex,
                activeYear
              )
            ).length > 2 ? (
              <>
                {Object.entries(
                  getCategoryWiseCountWithInfoForTheMonth(
                    allTransactions,
                    activeMonthIndex,
                    activeYear
                  )
                ).map(([category, info], index) => {
                  return (
                    <>
                      {index < 2 || showAllDistribution ? (
                        <div
                          key={index}
                          className="text-[#D4D4D4] text-[34px] flex justify-start items-center w-full mt-[7px] "
                        >
                          <div
                            className="w-[8px] aspect-square rounded-full mr-[10px]"
                            style={{
                              backgroundColor: `${colorCode[index].primary}`,
                            }}
                          ></div>
                          <div className="text-[14px] font-[isb] w-[130px]">
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </div>
                          <div className="w-[calc(100%-200px)] h-[6px] bg-[#28272A] flex justify-start items-center rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round(
                                  (info.totalAmount /
                                    getTotalExpenseForTheMonth(
                                      props.allTransactions,
                                      activeMonthIndex,
                                      activeYear
                                    )) *
                                    100
                                )}%`,
                                transition: ".3s",
                                backgroundColor: `${colorCode[index].primary}`,
                              }}
                            ></div>
                          </div>
                          <div className="text-[14px] font-[isb] tracking-wide w-[50px] flex justify-end">
                            {Math.round(
                              (info.totalAmount /
                                getTotalExpenseForTheMonth(
                                  props.allTransactions,
                                  activeMonthIndex,
                                  activeYear
                                )) *
                                100
                            )}
                            %
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </>
                  );
                })}
              </>
            ) : (
              <>
                {Object.entries(
                  getCategoryWiseCountWithInfoForTheMonth(
                    allTransactions,
                    activeMonthIndex,
                    activeYear
                  )
                ).map(([category, info], index) => {
                  return (
                    <div
                      key={index}
                      className="text-[#D4D4D4] text-[34px] flex justify-start items-center w-full mt-[7px] "
                    >
                      <div
                        className="w-[10px] aspect-square rounded-full mr-[10px]"
                        style={{
                          backgroundColor: `${colorCode[index].primary}`,
                        }}
                      ></div>
                      <div className="text-[14px] font-[isb] w-[130px]">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                      <div className="w-[calc(100%-200px)] h-[6px] bg-[#28272A] flex justify-start items-center rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round(
                              (info.totalAmount /
                                getTotalExpenseForTheMonth(
                                  props.allTransactions,
                                  activeMonthIndex,
                                  activeYear
                                )) *
                                100
                            )}%`,
                            transition: ".3s",
                            backgroundColor: `${colorCode[index].primary}`,
                          }}
                        ></div>
                      </div>
                      <div className="text-[14px] font-[isb] tracking-wide w-[50px] flex justify-end">
                        {Math.round(
                          (info.totalAmount /
                            getTotalExpenseForTheMonth(
                              props.allTransactions,
                              activeMonthIndex,
                              activeYear
                            )) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* <div className="text-[#D4D4D4] text-[34px] flex justify-start items-center w-full mt-[7px] ">
              <div className="w-[10px] aspect-square rounded-full bg-[#FF6A64] mr-[10px]"></div>
              <div className="text-[16px] font-[isb] w-[130px]">Travel</div>
              <div className="w-[calc(100%-200px)] h-[6px] bg-[#28272A] flex justify-start items-center rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-[#FF6A64] rounded-full"></div>
              </div>
              <div className="text-[16px] font-[isb] tracking-wide w-[50px] flex justify-end">
                23%
              </div>
            </div>
            <div className="text-[#D4D4D4] text-[34px] flex justify-start items-center w-full mt-[7px]">
              <div className="w-[10px] aspect-square rounded-full bg-[#D4D4D4] mr-[10px]"></div>
              <div className="text-[16px] font-[isb] w-[130px]">Food</div>
              <div className="w-[calc(100%-200px)] h-[6px] bg-[#28272A] flex justify-start items-center rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-[#D4D4D4] rounded-full"></div>
              </div>
              <div className="text-[16px] font-[isb] tracking-wide w-[50px] flex justify-end">
                23%
              </div>
            </div> */}
            <div className="text-[#868686] active:text-[#D4D4D4] text-[14px]  flex justify-start items-center w-full mt-[7px]">
              <div
                className="flex justify-center items-center font-[isb] bg-[#28272A] p-[10px] py-[8px] pr-[12px] rounded-[14px] mt-[15px] border-[1.5px] border-[#2c2b2e] drop-shadow-md"
                onClick={(e) => {
                  setShowAllDistribution(!showAllDistribution);
                }}
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  strokeWidth={2.5}
                  className={
                    "mr-[5px]" +
                    (showAllDistribution ? " rotate-180" : " rotate-0")
                  }
                  style={{ transition: " .3s" }}
                />
                {showAllDistribution ? (
                  <>less</>
                ) : (
                  <>
                    +
                    {Object.keys(
                      getCategoryWiseCountWithInfoForTheMonth(
                        allTransactions,
                        activeMonthIndex,
                        activeYear
                      )
                    ).length - 2}{" "}
                    more
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[50px] w-full bg-gradient-to-b from-[#000000] to-transparent z-[1] mb-[-50px] backdrop-blur-[8px] flex justify-end items-center mt-[0px] text-[#797979]">
        <input
          className={
            "outline-none text-[14px] h-[40px] mr-[-35px] rounded-3xl bg-[#1C1C1E] px-[15px] font-[im] transition-all duration-300 ease-in-out " +
            (showSearch
              ? "opacity-100 w-[calc(100%-40px)] "
              : "opacity-0 w-[calc(0px)] ")
          }
          placeholder="Search here ..."
        ></input>
        <div
          className="w-[35px] aspect-square flex justify-center items-center hover:text-[white] z-[1]"
          onClick={() => {
            setShowSearch(!showSearch);
          }}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={2.5}
            className="mr-[5px]"
          />
        </div>
        <div className="w-[35px] aspect-square flex justify-center items-center hover:text-[white] ml-[5px]">
          <HugeiconsIcon
            icon={FilterVerticalIcon}
            size={18}
            strokeWidth={2.5}
            className="mr-[5px]"
          />
        </div>
      </div>
      <div className="w-full flex flex-col justify-start items-start pt-[50px]">
        <div className="text-[#595959] font-[im] text-[14px] mb-[10px]">
          Today
        </div>
        {getExpensesForTheMonth(
          props?.allTransactions,
          activeMonthIndex,
          activeYear
        )?.map((data, index) => {
          return <TransactionBlock data={data} index={index} />;
        })}
      </div>
      <div className=""></div>
    </div>
  );
}

//  <div className="flex flex-col justify-center items-end">
//    {/* ---- Budget Usage ProgressBar */}
//    <div className="w-full flex justify-center items-center mb-[10px]">
//      <div className="w-[calc(100%/2)] h-[6px] rounded-full bg-[#f6f6f6] flex justify-start items-center overflow-hidden shadow-inner">
//        <div className="h-full w-[48%] bg-[#91B150] drop-shadow-md rounded-full transition-all duration-300 ease-in-out"></div>
//      </div>
//    </div>
//    {/* ---- Total Expense in current month */}
//    <div className="flex justify-center items-center">
//      <span className="mr-[10px]">₹</span>30245.20
//    </div>
//    {/* ---- Extra or Less usage indication with usage percentage */}
//    <div className="flex justify-end items-center text-[14px] font-[isb] text-[#D25340]">
//      <HugeiconsIcon
//        icon={CircleArrowDown01Icon}
//        size={14}
//        strokeWidth="2.5"
//        className="mr-[5px]"
//      />
//      20%
//    </div>
//  </div>
