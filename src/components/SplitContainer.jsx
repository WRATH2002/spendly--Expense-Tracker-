import { select } from "framer-motion/client";
import React, { useEffect, useState } from "react";
// --------------- Firebase related imports
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import firebase from "../firebase";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics02Icon,
  ArrowMoveDownRightIcon,
  Cancel01Icon,
  Cancel02Icon,
  MoveLeftIcon,
} from "@hugeicons/core-free-icons";
import { MoveRightIcon } from "lucide-react";

const colorScheme = [
  { background: "#F8E7D0", text: "#8B5E3C", border: "#E6C9A8" }, // Soft Cream Beige
  { background: "#D9F6E4", text: "#2C6E49", border: "#B7E5C6" }, // Pastel Mint Green
  { background: "#DDEAFF", text: "#2F3D73", border: "#B9D2FF" }, // Calm Sky Blue
  { background: "#F7D8F9", text: "#7A3A7A", border: "#E9B7EB" }, // Light Orchid Pink
  { background: "#D8F8F6", text: "#2C5F63", border: "#B5E8E5" }, // Soft Aqua Cyan
];

export default function SplitContainer() {
  const [transactionName, setTransactionName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [personWiseTotal, setPersonWiseTotal] = useState({});
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  function generateCurrentDateTime() {
    const current = new Date();
    const date = `${current.getDate()}-${
      current.getMonth() + 1
    }-${current.getFullYear()}`;
    const time = `${current.getHours()}:${current.getMinutes()}`;
    return date + " " + time;
  }

  function personWiseTotalCalculator() {
    let totals = {};

    // Step 1: Calculate total spent by each person
    allTransactions?.forEach((transaction) => {
      const payee = transaction.payeeName;
      const amount = parseFloat(transaction.transactionAmount);
      totals[payee] = (totals[payee] || 0) + amount;
    });

    // Step 2: Calculate overall total and per person share
    const people = Object.keys(totals);
    const overallTotal = Object.values(totals).reduce(
      (sum, val) => sum + val,
      0
    );
    const perPersonShare = overallTotal / people.length;

    // Step 3: Create detailed result for each person
    let result = {};

    people?.forEach((person) => {
      const spent = totals[person];
      const alterAmount = parseFloat((spent - perPersonShare).toFixed(2)); // + means get, - means pay
      const toPay = alterAmount < 0;

      result[person] = {
        totalSpent: spent,
        total: overallTotal,
        alterAmount,
        toPay,
        balances: [], // will fill next
      };
    });

    // Step 4: Properly balance payments from both perspectives (only debtors’ side)
    const debtors = people
      .filter((p) => result[p].alterAmount < 0)
      .map((p) => ({ name: p, amount: Math.abs(result[p].alterAmount) }));

    const creditors = people
      .filter((p) => result[p].alterAmount > 0)
      .map((p) => ({ name: p, amount: result[p].alterAmount }));

    for (let d of debtors) {
      for (let c of creditors) {
        if (d.amount <= 0) break;
        if (c.amount <= 0) continue;

        const payment = Math.min(d.amount, c.amount);

        // ✅ Record only in debtor’s balances (who they need to pay)
        result[d.name].balances.push({
          person: c.name,
          amount: parseFloat(payment.toFixed(2)),
        });

        // Adjust remaining balances
        d.amount -= payment;
        c.amount -= payment;
      }
    }

    // Step 5: Finalize
    setPersonWiseTotal(result);
    console.log("Detailed Person Wise Total:", result);
  }

  // ------------ Function to add transaction to firestore database
  function addTransactionInfo() {
    console.log("adding split transaction", generateCurrentDateTime());
    const user = firebase.auth().currentUser;

    db.collection("userSpace")
      .doc(user?.uid)
      .collection("AllTransactionsSpace")
      .doc("SplitTransactions")
      .update({
        SplitTransactions: arrayUnion({
          transactionName: transactionName,
          // transactionID: transactionID,
          transactionDate: generateCurrentDateTime(),
          // transactionMode: transactionMode,
          transactionType: "split",
          payeeName: selectedMember,
          // transactionBillURL: transactionBillURL,
          transactionAmount: transactionAmount,
          // transactionCategory: transactionCategory,
          // splittedMemberCount: splittedMemberCount,
          // splittedMemberIDS: splittedMemberIDS,
        }),
      });
    // .then(() => {
    //   console.log(
    //     `%cSuccess : %cTransaction added successfuly%c!\n%cTransaction ID : %c${transactionID}`,
    //     "color: #21da0f; font-weight: bold;",
    //     "color: #21da0f; ",
    //     "color: #21da0f;",
    //     "color: #21da0f; font-weight: bold;",
    //     "color: #21da0f;"
    //   );
    // })
    // .catch((error) => {
    //   console.log(
    //     `%cError : %cTransaction has not been added%c\n%cTransaction ID : %c${transactionID}`,
    //     "color: red;",
    //     "color: red; font-weight: bold;",
    //     "color: red;",
    //     "color: red; font-weight: bold;",
    //     "color: red;"
    //   );
    // });
  }

  // ---------- Function to get AllTransactions from Firestore Database
  function fetchAllTransactions() {
    const user = firebase.auth().currentUser;

    const transactionsRef = db
      .collection("userSpace")
      .doc(user?.uid)
      ?.collection("AllTransactionsSpace")
      .doc("SplitTransactions");

    // const categoryMappingRef = db
    //   .collection("userSpace")
    //   .doc(user?.uid)
    //   ?.collection("CategoryToIcon")
    //   .doc("CategoryToIcon");

    onSnapshot(transactionsRef, (snapshot) => {
      console.log(
        "Fetched %cTransactions%c Info =>",
        "color: #1caee8; font-weight: bold;",
        "color: #ffffff;"
      );
      console.table(snapshot?.data()?.SplitTransactions);
      console.table(snapshot?.data());

      setAllTransactions(snapshot?.data()?.SplitTransactions);
    });

    // onSnapshot(categoryMappingRef, (snapshot) => {
    //   console.log(
    //     "Fetched %cCategory To Icon Mapping%c Info =>",
    //     "color: #1caee8; font-weight: bold;",
    //     "color: #ffffff;"
    //   );
    //   console.log(snapshot?.data()?.categoryToIconMappingInfo);
    //   setCategoryToMapping(snapshot?.data()?.categoryToIconMappingInfo);
    // });
  }

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    personWiseTotalCalculator();
  }, [allTransactions]);

  function priceCommaFormatter(num) {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <div className="text-[white] w-full h-full p-[20px] flex flex-col justify-start items-start">
      <div className="w-full flex justify-evenly w-full h-[50px]">
        {[
          "Himadri Purkait",
          "Jishu Sengupta",
          "Ishika Ghosh",
          "Anita Mukhejee",
          "Swapnodip Singha Roy",
        ].map((data, index) => {
          return (
            <div
              className={
                "w-[50px] h-[50px] rounded-full flex justify-center items-center uppercase font-extrabold cursor-pointer bg-[#212121] text-[#d5d5d5]" +
                (data == selectedMember
                  ? " opacity-100"
                  : selectedMember.length == 0
                  ? " opacity-100"
                  : " opacity-30")
              }
              onClick={() => {
                setSelectedMember(data);
              }}
              style={
                {
                  // backgroundColor: `${colorScheme[index]?.background}`,
                  // color: `${colorScheme[index]?.text}`,
                  // border: `1.5px solid ${colorScheme[index]?.border}`,
                }
              }
            >
              {data.split(" ")[0].charAt(0)}
              {data.split(" ").pop().charAt(0)}
            </div>
          );
        })}
        <div
          className={
            "w-[50px] h-[50px] rounded-full flex justify-center items-center uppercase font-extrabold cursor-pointer bg-[#212121] text-[#d5d5d5]"
          }
          onClick={() => {
            setShowMoreDetails(true);
          }}
        >
          <HugeiconsIcon
            icon={Analytics02Icon}
            size={18}
            // fill="currentColor"
            strokeWidth={2}
            className=""
          />
        </div>
      </div>
      <div
        className={
          "w-full flex flex-col justify-start items-start mt-[30px]" +
          (selectedMember.length == 0 ? " hidden" : " visible")
        }
      >
        <div className="flex flex-col justify-center items-start">
          <div className="text-[12px] text-[#7a7a7a]">Payer</div>
          <div
            className="font-medium uppercase text-[#d5d5d5] "
            style={
              {
                // color: `${colorScheme[2]?.text}`,
              }
            }
          >
            {selectedMember}
          </div>
        </div>
        <div className="mt-[20px] w-full flex justify-between items-center">
          <input
            className="w-[calc((100%-15px)/2)] text-[#d5d5d5] outline-none placeholder:text-[#575757] bg-[#131313] h-[40px] rounded-lg border-[1.5px] border-[#161616] px-[12px] text-[14px]"
            placeholder="Trn. Name"
            value={transactionName}
            onChange={(e) => {
              setTransactionName(e.target.value);
            }}
          ></input>
          <input
            className="w-[calc((100%-15px)/2)] text-[#d5d5d5] outline-none placeholder:text-[#575757] bg-[#131313] h-[40px] rounded-lg border-[1.5px] border-[#161616] px-[12px] text-[14px]"
            placeholder="Trn. Amount"
            type="tel"
            value={transactionAmount}
            onChange={(e) => {
              setTransactionAmount(e.target.value);
            }}
          ></input>
        </div>
        <button
          className={
            "w-full flex justify-center items-center h-[40px] mt-[20px]  rounded-lg outline-none" +
            (transactionAmount.length > 0 && transactionName.length > 0
              ? " cursor-pointer bg-[#00a2ff] text-[#ffffff]"
              : " cursor-not-allowed bg-[#00a2ff40] text-[#9c9c9c]")
          }
          onClick={() => {
            if (transactionAmount.length > 0 && transactionName.length > 0) {
              addTransactionInfo();
            }
          }}
        >
          Submit
        </button>
        {/* <div className="flex justify-end items-center">
          <span className="mr-[-30px] w-[30px] flex justify-center items-center text-[#838383]">
            ₹
          </span>
          <input
            className="outline-none placeholder:text-[#575757] bg-[#2b2b2ba8] w-[170px] h-[40px] rounded-lg border-[1.5px] border-[#2b2b2b75] px-[12px] pl-[30px] "
            placeholder="Enter amount"
            type="tel"
          ></input>
        </div> */}
      </div>

      <div className="border-b-[1.5px] border-[#2b2b2b75] w-[calc(100%+40px)] ml-[-20px] my-[20px] mb-[10px] h-[0px] flex justify-between items-center"></div>
      <div className="w-full flex flex-col justify-start items-start ">
        {allTransactions?.map((data, index) => {
          return (
            <div
              key={index}
              className="w-full flex justify-between items-center min-h-[60px] mb-[0px]"
            >
              <div className="flex justify-start items-center w-[calc(100%-100px)]">
                <div className="w-[40px] aspect-square rounded-full bg-[#212121] text-[#d5d5d5] flex justify-center items-center font-extrabold uppercase text-[14px]">
                  {data?.payeeName.split(" ")[0].charAt(0)}
                  {data?.payeeName.split(" ").pop().charAt(0)}
                </div>
                <div className="w-[calc(100%-40px)] flex flex-col justify-center items-start px-[15px]">
                  <div className="w-full text-[#d5d5d5] overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                    {data?.transactionName}
                  </div>
                  <div className="text-[#6e6e6e] text-[12px] font-semibold">
                    {data?.payeeName}
                  </div>
                </div>
              </div>
              <div className=" w-[100px] flex flex-col justify-center items-end">
                <div className="font-bold text-[#d5d5d5]">
                  ₹ {data?.transactionAmount}
                </div>
                <div className="text-[#6e6e6e] text-[12px]">
                  {data?.transactionDate}
                </div>
              </div>
            </div>
          );
        })}
        <div
          className={
            "w-full h-[100svh] bg-[#63636313] backdrop-blur-md left-0 top-0 fixed" +
            (showMoreDetails ? " flex" : " hidden")
          }
          onClick={() => {
            setShowMoreDetails(false);
          }}
        ></div>
        <div
          className={
            "w-full h-[600px] overflow-y-scroll  fixed left-0 bottom-0 rounded-t-3xl bg-[black] flex-col justify-start items-start pt-[20px]" +
            (showMoreDetails ? " flex" : " hidden")
          }
        >
          {/* <div className="w-full flex justify-center items-center mt-[-80px] ">
            <div className="border-[2px] w-[40px] rounded-full aspect-square border-[#1e1e1e] flex justify-center items-center">
              <HugeiconsIcon
                icon={Cancel02Icon}
                size={18}
                fill="currentColor"
                strokeWidth={0.1}
                className=""
              />
            </div>
          </div> */}
          <div className="w-full flex flex-col justify-center items-center mt-[20px]">
            <span className="text-[14px] text-[#7e7e7e]">Total Trip Spent</span>
            <span className="text-[#d5d5d5] font-bold text-[26px]">
              ₹ {priceCommaFormatter(personWiseTotal["Anita Mukhejee"]?.total)}
            </span>
            <span className="text-[#6e6e6e] text-[12px]">
              per head : ₹{" "}
              {priceCommaFormatter(
                Math.round(personWiseTotal["Anita Mukhejee"]?.total / 5)
              )}
            </span>
          </div>
          <div className="w-full min-h-[60px] bg-gradient-to-b from-black to-transparent z-30 mt-[10px]"></div>
          <div className="flex flex-col justify-start items-start w-full mt-[-60px] overflow-y-scroll pb-[200px] pt-[60px]">
            {Object.entries(personWiseTotal).map(([person, details], index) => (
              <>
                <div
                  key={index}
                  className="w-full flex justify-between items-center min-h-[60px] mb-[20px] p-[20px]"
                >
                  <div className="flex justify-start items-center w-[calc(100%-100px)]">
                    {/* bg-[#212121] text-[#d5d5d5] */}
                    <div
                      className={`w-[40px] aspect-square rounded-full  flex justify-center items-center font-extrabold uppercase text-[14px] bg-[#212121] text-[#d5d5d5]`}
                    >
                      {person?.split(" ")[0].charAt(0)}
                      {person?.split(" ").pop().charAt(0)}
                    </div>
                    <div className="w-[calc(100%-40px)] flex flex-col justify-center items-start px-[15px]">
                      <div className="text-[#d5d5d5] font-bold text-[14px] ">
                        {person}'s
                      </div>
                      <div className="w-full text-[#6e6e6e] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap flex justify-start items-center">
                        <HugeiconsIcon
                          icon={ArrowMoveDownRightIcon}
                          size={12}
                          strokeWidth={2}
                          className="mt-[-5px] mr-[5px]"
                        />{" "}
                        ₹ {priceCommaFormatter(details?.totalSpent?.toFixed(2))}
                      </div>
                    </div>
                  </div>

                  <div className="w-[100px] flex flex-col justify-center items-end">
                    <div
                      className={` flex justify-center items-center px-[5px] rounded-md text-[10px] py-[2px] text-[#6e6e6e] ${
                        details?.toPay
                          ? " bg-[#ff6a0028] text-[#ff6a00]"
                          : " bg-[#00ff0d28] text-[#00ff0d]"
                      }`}
                    >
                      {details?.toPay ? "will pay" : "will get"}
                    </div>
                    <div
                      className={`font-bold text-[14px] text-[#d5d5d5]
                       
                        `}
                    >
                      ₹{" "}
                      {priceCommaFormatter(
                        Math.abs(details?.alterAmount).toFixed(2)
                      )}
                    </div>
                  </div>
                </div>
                {details?.balances?.length > 0 && (
                  <div className="w-full mt-[-40px] mb-[10px] flex flex-col justify-center items-end text-[#6e6e6e] p-[20px]">
                    {details?.balances?.map((balance, bIndex) => {
                      return (
                        <div
                          key={bIndex}
                          className="flex justify-end items-center"
                        >
                          <span className="text-[12px]">
                            ₹ {priceCommaFormatter(balance?.amount)}
                          </span>{" "}
                          <span className="text-[#454545]">•</span>
                          <span className="text-[12px]">{balance?.person}</span>
                          <HugeiconsIcon
                            icon={MoveLeftIcon}
                            size={16}
                            strokeWidth={2}
                            className="ml-[5px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
