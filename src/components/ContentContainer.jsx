import React, { useEffect, useRef, useState } from "react";
import SpendingChart from "./SpendingChart";
import { motion, useAnimation, useMotionValue } from "framer-motion";

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
import { storage } from "../firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

// --------------- React Router DOM related imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";

// --------------- Components related imports / others
import SideNavbar from "./SideNavbar";
import AllTransactionView from "./AllTransactionView";
import HomeSection from "./sectionComponents/HomeSection";
import BottomNavbar from "./sectionComponents/BottomNavbar";
import {
  Add01Icon,
  Add02Icon,
  AiBrain01Icon,
  ArrowUp01Icon,
  Delete01Icon,
  ImageUploadIcon,
  InformationCircleIcon,
  MultiplicationSignIcon,
  Search01Icon,
  Tick02Icon,
  UploadCircle01Icon,
} from "@hugeicons/core-free-icons";
import { ChevronDown, Plus, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InputFieldUI,
  InputFieldUIForImageUpload,
  TextAreaFieldUI,
} from "./InputFields";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { categories } from "../utils/categoryToIconSVGMapping";
import { returnSearchedCategory } from "../utils/functions";
import ChartSection from "./sectionComponents/ChartSection";
import SettingsSection from "./sectionComponents/SettingsSection";
import { temp } from "../utils/constants";
import NewInputFields from "./NewInputFields";

const getColor = (value) => {
  // if (value < 40) return "#D25340"; // red
  // if (value < 70) return "#F2C94C"; // yellow
  return "#95C765"; // green
};

export default function ContentContainer(props) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [categoryToMapping, setCategoryToMapping] = useState([]);
  const [activeSection, setActiveSection] = useState("home");

  const [tags, setTags] = useState([]);
  const [tagsName, setTagsName] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [assigneesUserID, setAssigneesUserID] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("High");
  const [dueDate, setDueDate] = useState("");
  const [trnName, setTrnName] = useState("");
  const [trnDate, setTrnDate] = useState(
    new Date().getDate() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      new Date().getFullYear()
  );
  const [trnId, setTrnId] = useState("");
  const [trnMode, setTrnMode] = useState("Cash");
  const [trnType, setTrnType] = useState("Single");
  const [trnCategory, setTrnCategory] = useState("");
  const [searchCat, setSearchCat] = useState("");

  const [trnIncludeInBudget, setTrnIncludeInBudget] = useState(false);
  const [trnAmount, setTrnAmount] = useState("");
  const [trnReciept, setTrnReciept] = useState("");
  const [trnRecieptInfo, setTrnRecieptInfo] = useState("");
  const [activeInputField, setActiveInputField] = useState("taskTitle");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [colorTheme, setColorTheme] = useState(0);
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    photoURL: "",
    theme: false,
    userID: "",
    budgte: 0,
    income: 0,
  });

  const navigate = useNavigate();

  // ------------ Function to navigate to desire path
  function navigateToPage(path) {
    navigate(`${path}`);
  }

  // ---- Function to fetch account details
  function fetchAccountDetails() {
    const user = firebase.auth().currentUser;

    const transactionsRef = db.collection("userSpace").doc(user?.uid);

    onSnapshot(transactionsRef, (snapshot) => {
      console.log(
        "Fetched %Account's%c Info =>",
        "color: #1caee8; font-weight: bold;",
        "color: #ffffff;"
      );
      console.table(snapshot?.data()?.AllTransactions);
      setAccountInfo({
        name: snapshot?.data()?.name,
        email: snapshot?.data()?.email,
        password: snapshot?.data()?.password,
        phoneNo: snapshot?.data()?.phoneNo,
        photoURL: snapshot?.data()?.photoURL,
        theme: snapshot?.data()?.theme,
        userID: snapshot?.data()?.userID,
        budgte: snapshot?.data()?.budgte,
        income: snapshot?.data()?.income,
      });
    });
  }

  // --------- Checking if User is logged in and performing task based on that state
  useEffect(() => {
    const authUserLoginState = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAccountDetails();
        fetchAllTransactions();
      } else {
        navigateToPage(`/user/login`);
      }
    });

    return () => authUserLoginState();
  }, []);

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

  // ---------- Function to handle Add Transaction Modal -> Motion Animation

  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  const y = useMotionValue(800); // Initial off-screen position
  const controls = useAnimation();

  useEffect(() => {
    if (showAddTransactionModal) {
      controls.start({
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    } else {
      controls.start({
        y: 800,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    }
  }, [showAddTransactionModal]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 100) {
      setShowAddTransactionModal((prev) => false);
    } else {
      controls.start({
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    }
  };

  // ---------- Function to handle Show Image Modal -> Motion Animation

  const [showImage, setShowImage] = useState(false);

  const y2 = useMotionValue(800); // start off-screen
  const controls2 = useAnimation();

  useEffect(() => {
    if (showImage) {
      controls2.start({
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    } else {
      controls2.start({
        y: 800,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    }
  }, [showImage]);

  const handleDragEnd2 = (_, info) => {
    if (info.offset.y > 100) {
      setShowImage(false);
    } else {
      controls2.start({
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
          duration: 0.2,
        },
      });
    }
  };

  // ---------- Function to handle Image Upload

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(event.target.files[0]);
    if (file && file.type.startsWith("image/")) {
      const sizeInKB = file.size / 1024;
      const sizeFormatted =
        sizeInKB >= 1024
          ? `${(sizeInKB / 1024).toFixed(2)} MB`
          : `${sizeInKB.toFixed(2)} KB`;
      setTrnRecieptInfo({
        fileName: file.name,
        fileSize: sizeFormatted,
      });
      // console.log(`Selected file name: ${file.name}`);
      // console.log(`File size: ${sizeFormatted}`);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //

  const [image, setImage] = useState();
  const [imageUploadPortion, setImageUploadPortion] = useState(0);
  const color = getColor(imageUploadPortion);

  useEffect(() => {
    if (image) {
      uploadImage();
    }
  }, [image]);

  const uploadImageGetUrl = async (fileRef) => {
    var geturl = await uploadBytes(fileRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        console.log("Uploade Image URL");
        console.log(url);
        setImageUploadPortion((prev) => 100);

        setTrnReciept(url);
      });
    });
    return geturl;
  };

  const uploadImage = async () => {
    setImageUploadPortion((prev) => 25);
    const user = firebase.auth().currentUser;
    let date = new Date();
    let today =
      date.getDate() +
      (parseInt(date.getMonth()) + 1) +
      date.getFullYear() +
      date.getMinutes() +
      date.getSeconds();
    const fileRef = ref(
      storage,
      // `newSplitwiseImageBlobSpace/${today}/${image.name}`
      `testUpload`
    );
    const myPromise = uploadImageGetUrl(fileRef);
    if (myPromise) {
      console.log("Uploading");
    } else {
      console.log("Not Uploaded");
    }
  };

  // ------------ Function to add transaction to firestore database
  function addTransactionInfo() {
    const user = firebase.auth().currentUser;

    db.collection("userSpace")
      .doc(user?.uid)
      .collection("AllTransactionsSpace")
      .doc("AllTransactions")
      .update({
        AllTransactions: arrayUnion({
          transactionName: trnName,
          transactionID: trnId,
          transactionDate: trnDate,
          transactionMode: trnMode,
          transactionType: trnType,
          transactionBillURL: trnReciept,
          transactionAmount: parseFloat(parseFloat(trnAmount).toFixed(2)),
          transactionCategory: trnCategory,
          includeInBudget: trnIncludeInBudget,
          // splittedMemberCount: splittedMemberCount,
          // splittedMemberIDS: splittedMemberIDS,
        }),
      })
      .then(() => {
        console.log(
          `%cSuccess : %cTransaction added successfuly%c!\n%cTransaction ID : %c${transactionID}`,
          "color: #21da0f; font-weight: bold;",
          "color: #21da0f; ",
          "color: #21da0f;",
          "color: #21da0f; font-weight: bold;",
          "color: #21da0f;"
        );
      })
      .catch((error) => {
        console.log(
          `%cError : %cTransaction has not been added%c\n%cTransaction ID : %c${transactionID}`,
          "color: red;",
          "color: red; font-weight: bold;",
          "color: red;",
          "color: red; font-weight: bold;",
          "color: red;"
        );
      });
  }

  // ---------- Function to check readiness
  function checkReadiness() {
    if (
      trnName.length > 0 &&
      trnDate.length > 0 &&
      trnAmount.length > 0 &&
      trnMode.length > 0 &&
      trnType.length > 0 &&
      trnCategory.length > 0
    ) {
      return true;
    }
  }

  return (
    <div className="w-full h-[100svh] flex flex-col justify-start items-start bg-[#000000]">
      {activeSection === "home" ? (
        <div className="w-full min-h-full max-h-full flex flex-col justify-start items-start">
          <HomeSection allTransactions={allTransactions} />
        </div>
      ) : activeSection === "chart" ? (
        <div className="w-full min-h-full max-h-full flex flex-col justify-start items-start">
          <ChartSection allTransactions={allTransactions} />
        </div>
      ) : activeSection === "settings" ? (
        <>
          <SettingsSection accountInfo={accountInfo} />
        </>
      ) : (
        <></>
      )}

      <div className="w-full h-[60px] fixed bottom-0 left-0 z-[1] flex justify-start items-start">
        <BottomNavbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          showAddTransactionModal={setShowAddTransactionModal}
          setShowAddTransactionModal={setShowAddTransactionModal}
        />
      </div>

      <div
        className={
          "w-full h-[100svh] fixed top-0 left-0 bg-[#00000035] backdrop-blur-[6px]" +
          (showAddTransactionModal
            ? " opacity-100 z-[10]"
            : " opacity-0 -z-[10]")
        }
        style={{ transition: ".2s" }}
      ></div>
      <motion.div
        style={{ y }}
        animate={controls}
        initial={{ y: 800 }}
        // style={{ touchAction: "none" }}
        // onDragEnd={handleDragEnd}
        className="fixed left-0 right-0 bottom-0 h-[600px] bg-[#1C1C1E] text-[#D4D4D4] rounded-t-3xl shadow-lg z-50 p-[25px] pt-[5px] text-[15px] font-[em] overflow-y-scroll "
      >
        {/* ---- GRIP AREA ---- */}

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          style={{ y, touchAction: "none", zIndex: 60 }}
          onDragEnd={handleDragEnd}
          className="z-[60] w-full flex justify-center items-center h-[20px] cursor-grab active:cursor-grabbing   relative "
        ></motion.div>
        <div
          className="w-full flex justify-center items-center h-[20px] mt-[-20px] relative "
          style={{ zIndex: 50 }}
        >
          <div className="w-[80px] h-[6px] bg-[#5a595c] rounded-full "></div>
        </div>
        <div className="w-full mt-[30px]"></div>
        <div className="uppercase pl-[15px] text-[12px] mb-[10px] text-[#797979]">
          Transaction Info
        </div>
        <div className="flex flex-col justify-start items-start w-full bg-[#131314] px-[0px] rounded-xl ">
          <div className="w-full h-[50px] flex justify-start items-center px-[15px] ">
            <NewInputFields // ---- For Transaction Name Input
              theme={props?.theme}
              inputTitle={"Transaction Name"}
              data={trnName}
              setData={setTrnName}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tName"}
              placeholderText={"eg. Design Home Page Wireframe"}
              placeholderContentLabel={"Transaction Name"}
              rejectChar={false}
              charsToReject={[]}
              marginTop={"0px"}
              paddinLeft={"0px"}
              isEditable={true}
              isAutoFocus={true}
              addButton={false}
              isRequired={true}
              type={"text"}
            />
          </div>
          <div className="w-full border-t-[1.5px] border-[#1C1C1E]"></div>
          <div className="w-full h-[50px] flex justify-between items-center px-[15px] py-[0px]">
            <div className="w-[50%] h-full flex justify-start items-center ">
              <NewInputFields // ---- For Transaction Date Input
                theme={props?.theme}
                inputTitle={"Transaction Date"}
                data={trnDate}
                setData={setTrnDate}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tDate"}
                placeholderText={"eg. 23/02/2025"}
                placeholderContentLabel={"Date"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddinLeft={"0px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"text"}
              />
            </div>
            <div className="h-full border-l-[1.5px] border-[#1C1C1E] "></div>
            <div className="w-[50%] h-full flex justify-start items-center ">
              <div className="flex justify-start items-center w-[30px] mr-[-30px] pl-[15px] ">
                ₹
              </div>
              <NewInputFields // ---- For Transaction Amount Input
                theme={props?.theme}
                inputTitle={"Transaction Amount"}
                data={trnAmount}
                setData={setTrnAmount}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tAmount"}
                placeholderText={"eg. 234.94"}
                placeholderContentLabel={"Amount"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddingLeft={"35px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"number"}
              />
            </div>
          </div>
          <div className="w-full border-t-[1.5px] border-[#1C1C1E]"></div>
          <div className="w-full h-[50px] flex justify-start items-center px-[15px] ">
            <NewInputFields // ---- For Transaction Amount Input
              theme={props?.theme}
              inputTitle={"Transaction ID"}
              data={trnId}
              setData={setTrnId}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tID"}
              placeholderText={"eg. 16294GIT23I4T7T2C3C753"}
              placeholderContentLabel={"Transaction ID"}
              rejectChar={false}
              charsToReject={[]}
              marginTop={"0px"}
              paddingLeft={"0px"}
              isEditable={true}
              isAutoFocus={false}
              addButton={false}
              isRequired={false}
              type={"text"}
            />
          </div>
        </div>

        <div className="uppercase pl-[15px] text-[12px] mt-[20px] mb-[10px] text-[#797979]">
          Transaction Info
        </div>
        <div className="flex flex-col justify-start items-start w-full bg-[#131314] px-[0px] rounded-xl ">
          <div className="w-full h-[50px] flex justify-between items-center px-[15px] py-[0px]">
            <div className="w-[50%] h-full flex justify-start items-center ">
              <NewInputFields // ---- For Transaction Category Input
                theme={props?.theme}
                inputTitle={"Transaction Category"}
                data={trnCategory}
                setData={setTrnCategory}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tCategory"}
                placeholderText={"eg. Food"}
                placeholderContentLabel={"Category"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddinLeft={"0px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"text"}
              />
            </div>
            <div className="h-full border-l-[1.5px] border-[#1C1C1E] "></div>
            <div className="w-[50%] h-full flex justify-start items-center ">
              {/* <NewInputFields // ---- For Transaction Inwar Input
                theme={props?.theme}
                inputTitle={"Transaction Amount"}
                data={trnAmount}
                setData={setTrnAmount}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tAmount"}
                placeholderText={"eg. 234.94"}
                placeholderContentLabel={"Amount"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddingLeft={"0px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"number"}
              /> */}
            </div>
          </div>
          <div className="w-full border-t-[1.5px] border-[#1C1C1E]"></div>
          <div className="w-full h-[50px] flex justify-between items-center px-[15px] py-[0px]">
            <div className="w-[50%] h-full flex justify-start items-center ">
              <NewInputFields // ---- For Transaction Date Input
                theme={props?.theme}
                inputTitle={"Transaction Mode"}
                data={trnMode}
                setData={setTrnMode}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tMode"}
                placeholderText={"eg. Online UPI"}
                placeholderContentLabel={"eg. UPI, Cash, Card"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddinLeft={"0px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"text"}
              />
            </div>
            <div className="h-full border-l-[1.5px] border-[#1C1C1E] "></div>
            <div className="w-[50%] h-full flex justify-start items-center ">
              <NewInputFields // ---- For Transaction Amount Input
                theme={props?.theme}
                inputTitle={"Transaction Type"}
                data={trnType}
                setData={setTrnType}
                activeInputField={activeInputField}
                setActiveInputField={setActiveInputField}
                fieldValue={"tType"}
                placeholderText={"eg. Single, Split"}
                placeholderContentLabel={"eg. Single, Split"}
                rejectChar={false}
                charsToReject={[]}
                marginTop={"0px"}
                paddingLeft={"15px"}
                isEditable={true}
                isAutoFocus={false}
                addButton={false}
                isRequired={true}
                type={"text"}
              />
            </div>
          </div>
          <div className="w-full border-t-[1.5px] border-[#1C1C1E]"></div>
          <div className="w-full h-[50px] flex justify-between items-center px-[15px] ">
            <div>Include in Budget</div>
            <div
              className={
                "w-[40px] h-[28px] rounded-full flex justify-start items-center" +
                (trnIncludeInBudget ? " bg-[#7ED957]" : " bg-[#000000]")
              }
              onClick={() => {
                setTrnIncludeInBudget(!trnIncludeInBudget);
              }}
              style={{ transition: ".3s" }}
            >
              <div
                className={
                  "h-[22px] w-[22px] rounded-full drop-shadow-lg " +
                  (trnIncludeInBudget
                    ? " ml-[15px] bg-[#ffffff]"
                    : " ml-[3px] bg-[#2b2b2e]")
                }
                style={{ transition: ".3s" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="uppercase pl-[15px] text-[12px] mt-[20px] mb-[10px] text-[#797979]">
          Transaction Bill/Receipt
        </div>

        <div className="w-full flex justify-start items-center mt-[0px]">
          <div
            className="max-h-[50px] aspect-square min-h-[20px] mr-[-35px] flex justify-center items-center  z-[51] "
            onClick={(e) => {
              e.stopPropagation();
              console.log("Clicked on Image Upload");
              setShowImage((prev) => !prev);
            }}
          >
            <div className="max-h-[20px] min-h-[20px] aspect-square ml-[15px] mr-[-35px] bg-[]">
              <CircularProgressbar
                value={imageUploadPortion}
                // text={`${80}%`}
                strokeWidth={16}
                styles={buildStyles({
                  pathColor: color,
                  textColor: color,
                  trailColor: "#28272A",
                  textSize: "20px",
                })}
              />
            </div>
            <div
              className={
                "max-h-[20px] min-h-[20px] aspect-square ml-[15px] rounded-full flex justify-center items-center bg-[#95C765]" +
                (imageUploadPortion === 100 ? " opacity-100" : " opacity-0")
              }
              style={{
                transition: imageUploadPortion === 100 ? ".2s" : "0s",
                transitionDelay: imageUploadPortion === 100 ? "0.2s" : "0s",
              }}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={14}
                strokeWidth={6.4}
                className="text-[#1C1C1E]"
              />
            </div>
          </div>
          <InputFieldUIForImageUpload
            theme={props?.theme}
            inputTitle={"Transaction Reciept"}
            var={trnRecieptInfo || ""}
            setVar={setTrnRecieptInfo}
            activeInputField={activeInputField}
            setActiveInputField={setActiveInputField}
            fieldValue={"tReciept"}
            placeholderText={"No reciept uploaded"}
            marginTop={"0px"}
            isEditable={false}
            isAutoFocus={false}
            addButton={false}
            isRequired={false}
            type={"text"}
          />

          <div
            className="h-[36px] rounded-[5px] w-[70px] ml-[-77px] mr-[7px] flex justify-end items-center  font-[isb] text-[14px] pr-[10px] "
            // onClick={handleDivClick}
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              size={20}
              strokeWidth={2}
              className={
                "mr-[10px] text-[#797979] hover:text-[#D4D4D4]" +
                (imageUploadPortion === 100 && trnReciept.length > 0
                  ? " flex"
                  : " hidden")
              }
              onClick={() => {
                setTrnReciept("");
                setTrnRecieptInfo("");
                setImageUploadPortion(0);
                setImagePreview(null);
              }}
            />
            <HugeiconsIcon
              icon={ImageUploadIcon}
              size={20}
              strokeWidth={2}
              className=" text-[#797979] hover:text-[#D4D4D4]"
              onClick={handleDivClick}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        <div className={`mt-[40px] w-full flex justify-center items-center `}>
          <button
            // onClick={onClick}
            onClick={(e) => {
              if (checkReadiness()) {
                addTransactionInfo();
                setShowAddTransactionModal(false);
                setTrnName("");
                setTrnDate(
                  new Date().getDate() +
                    "/" +
                    (new Date().getMonth() + 1) +
                    "/" +
                    new Date().getFullYear()
                );
                setTrnId("");
                setTrnMode("Cash");
                setTrnType("Single");
                setTrnCategory("");
                setTrnAmount("");
                setTrnReciept("");
                setTrnRecieptInfo("");
                setImage(null);
                setImagePreview(null);
                setImageUploadPortion(0);
                setActiveInputField("taskTitle");
                setTrnIncludeInBudget(false);
              }
            }}
            className={
              `
          group relative overflow-hidden
          bg-gradient-to-br from-[#0e3ec3] via-[#0156d6] to-[#014bbb]
          rounded-[15px] h-[45px] px-[10px]
          flex items-center justify-center
         
         
        ` +
              (checkReadiness()
                ? " opacity-100 cursor-pointer"
                : " opacity-25 cursor-not-allowed")
            }
          >
            <div className="absolute inset-0 rounded-[10px] shadow-inner shadow-blue-900/20" />

            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div
              className="
          relative z-10
          w-[15px] ml-[5px] aspect-square
          rounded-[10px]
          flex items-center justify-center
        "
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={16}
                fill="currentColor"
                className="text-[#e8e8e8] drop-shadow-sm"
                strokeWidth={4}
              />
            </div>

            <div className="relative z-10  text-center ml-[10px] mr-[5px]">
              <span
                className="
            text-white font-[isb] text-[16px] 
            drop-shadow-sm
          "
              >
                Add Transaction
              </span>
            </div>
          </button>
        </div>
        {/* 
        <InputFieldUI
          theme={props?.theme}
          inputTitle={"Transaction Name"}
          var={trnName}
          setVar={setTrnName}
          activeInputField={activeInputField}
          setActiveInputField={setActiveInputField}
          fieldValue={"tName"}
          placeholderText={"eg. Design Home Page Wireframe"}
          marginTop={"30px"}
          isEditable={true}
          isAutoFocus={false}
          addButton={false}
          isRequired={true}
          type={"text"}
        />

        <div className="w-full flex justify-between items-center mt-[20px]">
          <div className="w-[calc((100%-20px)/2)] flex justify-start items-center">
            <InputFieldUI
              theme={props?.theme}
              inputTitle={"Transaction Date"}
              var={trnDate}
              setVar={setTrnDate}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tDate"}
              placeholderText={""}
              marginTop={"0px"}
              isEditable={false}
              isAutoFocus={false}
              addButton={false}
              isRequired={true}
              addTaskModal={props?.addTaskModal}
              setAddTaskModal={props?.setAddTaskModal}
              type={"text"}
            />
          </div>
          <div className="w-[calc((100%-20px)/2)] flex justify-start items-center">
            <InputFieldUI
              theme={props?.theme}
              inputTitle={"Transaction Amount"}
              var={trnAmount}
              setVar={setTrnAmount}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tAmount"}
              placeholderText={"eg.  3497.67"}
              marginTop={"0px"}
              isEditable={true}
              isAutoFocus={false}
              addButton={false}
              isRequired={true}
              type={"number"}
            />
          </div>
        </div>
        <InputFieldUI
          theme={props?.theme}
          inputTitle={"Transaction ID"}
          var={trnId}
          setVar={setTrnId}
          activeInputField={activeInputField}
          setActiveInputField={setActiveInputField}
          fieldValue={"tId"}
          placeholderText={"eg. 2482HGU448YOB248U42HHJKL"}
          marginTop={"20px"}
          isEditable={true}
          isAutoFocus={false}
          addButton={false}
          isRequired={false}
          type={"text"}
        />
        <div className="w-full flex justify-between items-center mt-[20px]">
          <div className="w-[calc((100%-20px)/2)] flex justify-start items-center">
            <InputFieldUI
              theme={props?.theme}
              inputTitle={"Transaction Mode"}
              var={trnMode}
              setVar={setTrnMode}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tMode"}
              placeholderText={""}
              marginTop={"0px"}
              isEditable={false}
              isAutoFocus={false}
              addButton={false}
              isRequired={true}
              addTaskModal={props?.addTaskModal}
              setAddTaskModal={props?.setAddTaskModal}
              type={"text"}
            />
          </div>
          <div className="w-[calc((100%-20px)/2)] flex justify-start items-center">
            <InputFieldUI
              theme={props?.theme}
              inputTitle={"Transaction Type"}
              var={trnType}
              setVar={setTrnType}
              activeInputField={activeInputField}
              setActiveInputField={setActiveInputField}
              fieldValue={"tType"}
              placeholderText={"eg. Enter due date"}
              marginTop={"0px"}
              isEditable={false}
              isAutoFocus={false}
              addButton={false}
              isRequired={true}
              type={"text"}
            />
          </div>
        </div>
        <div className="w-[70%] mt-[20px] max-h-[50px] flex flex-col justify-end items-start ">
          <div
            className={
              "w-full flex flex-col bg-[#151515] border-[1.5px]  border-[#232323] drop-shadow-lg z-[60] mb-[10px] rounded-[10px] " +
              (showCategoryModal
                ? " h-[300px] opacity-100"
                : " h-[0px] opacity-0")
            }
            style={{ transition: ".3s" }}
          >
            <div className="border-b-[1.5px] border-[#232323] flex justify-start items-center">
              <input
                className="min-h-[40px] outline-none px-[15px] rounded-[10px] bg-transparent text-[14px] font-[isb] text-[#D4D4D4]"
                value={searchCat}
                onChange={(e) => {
                  setSearchCat(e.target.value);
                }}
                placeholder="Search here ..."
              ></input>
              <div
                className="w-[40px] h-[40px] flex justify-center items-center ml-[-40px] text-[#797979] hover:text-[#D4D4D4]"
                onClick={(e) => {
                  setSearchCat("");
                }}
              >
                <HugeiconsIcon
                  icon={MultiplicationSignIcon}
                  size={20}
                  strokeWidth={2.3}
                  className=""
                />
              </div>
            </div>
            <div className="w-full p-[15px] py-[5px] text-[14px] font-[isb] h-[calc(100%-40px)] flex flex-col justify-start items-start overflow-y-scroll ">
              {returnSearchedCategory(categories, searchCat)?.map(
                (category, index) => (
                  <div
                    key={index}
                    className="w-full flex justify-start items-center min-h-[30px] text-[#797979] hover:text-[#b1b1b1]"
                    onClick={(e) => {
                      setSearchCat("");
                      setShowCategoryModal(false);
                      setTrnCategory(category.name);
                    }}
                  >
                    {category.name}
                  </div>
                )
              )}
            </div>
          </div>
          <div className={" flex flex-col justify-start items-start w-full"}>
            <label
              className={
                "text-[12px] h-[2px] flex justify-center items-center px-[6px] mb-[-1.5px] ml-[10px] z-50 font-[im]" +
                (activeInputField === "tCategory"
                  ? " text-[#747474] bg-[#1C1C1E]"
                  : " text-[#595959] bg-[#1C1C1E]")
              }
              style={{ transition: ".1s" }}
            >
              Transaction Category
              <span className={" ml-[4px] flex"}>*</span>
            </label>
            <div className="w-full flex justify-start items-center min-h-[50px] max-h-[50px] overflow-visible">
              <input
                className={
                  "w-[calc(100%-0px)] bg-transparent min-h-[50px] outline-none rounded-[10px] border-[1.5px] text-[14px] mt-[0px] font-[isb] px-[15px] text-ellipsis pr-[45px] " +
                  (activeInputField === "tCategory"
                    ? "  placeholder:text-[#828282] border-[#3c3b3e] "
                    : "  placeholder:text-[#828282] border-[#28272A] ")
                }
                type="text"
                style={{ transition: ".1s" }}
                autoFocus={false}
                readOnly={true}
                onFocus={(e) => {
                  setActiveInputField("tCategory");
                }}
                onBlur={(e) => {
                  setActiveInputField("");
                }}
                value={trnCategory}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                  }
                }}
                // onChange={(e) => {
                //   setTrnCategory(e.target.value);
                // }}
                placeholder={"eg. Shopping"}
              ></input>
              <div
                className="w-[50px] h-[50px] flex justify-center items-center ml-[-50px] text-[#797979] hover:text-[#D4D4D4] z-[61] relative"
                onClick={(e) => {
                  console.log("Clicked on Category Icon");
                  setShowCategoryModal(!showCategoryModal);
                }}
              >
                <HugeiconsIcon
                  icon={ArrowUp01Icon}
                  size={20}
                  strokeWidth={2}
                  className={
                    " " + (showCategoryModal ? " -rotate-180" : " rotate-0")
                  }
                  style={{ transition: ".3s" }}
                />
              </div>
            </div>
          </div>
        </div>
       
        <div className="w-full flex justify-start items-center mt-[20px]">
          <div
            className="max-h-[50px] aspect-square min-h-[20px] mr-[-35px] flex justify-center items-center  z-[51] "
            onClick={(e) => {
              e.stopPropagation();
              console.log("Clicked on Image Upload");
              setShowImage((prev) => !prev);
            }}
          >
            <div className="max-h-[20px] min-h-[20px] aspect-square ml-[15px] mr-[-35px] bg-[]">
              <CircularProgressbar
                value={imageUploadPortion}
                // text={`${80}%`}
                strokeWidth={16}
                styles={buildStyles({
                  pathColor: color,
                  textColor: color,
                  trailColor: "#28272A",
                  textSize: "20px",
                })}
              />
            </div>
            <div
              className={
                "max-h-[20px] min-h-[20px] aspect-square ml-[15px] rounded-full flex justify-center items-center bg-[#95C765]" +
                (imageUploadPortion === 100 ? " opacity-100" : " opacity-0")
              }
              style={{
                transition: imageUploadPortion === 100 ? ".2s" : "0s",
                transitionDelay: imageUploadPortion === 100 ? "0.2s" : "0s",
              }}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={14}
                strokeWidth={6.4}
                className="text-[#1C1C1E]"
              />
            </div>
          </div>
          <InputFieldUIForImageUpload
            theme={props?.theme}
            inputTitle={"Transaction Reciept"}
            var={trnRecieptInfo || ""}
            setVar={setTrnRecieptInfo}
            activeInputField={activeInputField}
            setActiveInputField={setActiveInputField}
            fieldValue={"tReciept"}
            placeholderText={"No reciept uploaded"}
            marginTop={"0px"}
            isEditable={false}
            isAutoFocus={false}
            addButton={false}
            isRequired={false}
            type={"text"}
          />

          <div
            className="h-[36px] rounded-[5px] w-[70px] ml-[-77px] mr-[7px] flex justify-end items-center  font-[isb] text-[14px] pr-[10px] "
            // onClick={handleDivClick}
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              size={20}
              strokeWidth={2}
              className={
                "mr-[10px] text-[#797979] hover:text-[#D4D4D4]" +
                (imageUploadPortion === 100 && trnReciept.length > 0
                  ? " flex"
                  : " hidden")
              }
              onClick={() => {
                setTrnReciept("");
                setTrnRecieptInfo("");
                setImageUploadPortion(0);
                setImagePreview(null);
              }}
            />
            <HugeiconsIcon
              icon={ImageUploadIcon}
              size={20}
              strokeWidth={2}
              className=" text-[#797979] hover:text-[#D4D4D4]"
              onClick={handleDivClick}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>
        <div className={`mt-[40px] w-full flex justify-center items-center `}>
          <button
            // onClick={onClick}
            onClick={(e) => {
              if (checkReadiness()) {
                addTransactionInfo();
                setShowAddTransactionModal(false);
                setTrnName("");
                setTrnDate(
                  new Date().getDate() +
                    "/" +
                    (new Date().getMonth() + 1) +
                    "/" +
                    new Date().getFullYear()
                );
                setTrnId("");
                setTrnMode("Cash");
                setTrnType("Single");
                setTrnCategory("");
                setTrnAmount("");
                setTrnReciept("");
                setTrnRecieptInfo("");
                setImage(null);
                setImagePreview(null);
                setImageUploadPortion(0);
                setActiveInputField("taskTitle");
              }
            }}
            className={
              `
          group relative overflow-hidden
          bg-gradient-to-br from-[#0e3ec3] via-[#0156d6] to-[#014bbb]
          rounded-[15px] h-[45px] px-[10px]
          flex items-center justify-center
         
         
        ` +
              (checkReadiness()
                ? " opacity-100 cursor-pointer"
                : " opacity-25 cursor-not-allowed")
            }
          >
            

           
            <div className="absolute inset-0 rounded-[10px] shadow-inner shadow-blue-900/20" />

           
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            
            <div
              className="
          relative z-10
          w-[15px] ml-[5px] aspect-square
          rounded-[10px]
          flex items-center justify-center
        "
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={16}
                fill="currentColor"
                className="text-[#e8e8e8] drop-shadow-sm"
                strokeWidth={4}
              />
            </div>

           
            <div className="relative z-10  text-center ml-[10px] mr-[5px]">
              <span
                className="
            text-white font-[isb] text-[16px] 
            drop-shadow-sm
          "
              >
                Add Transaction
              </span>
            </div>
          </button>
        </div> */}
      </motion.div>

      {/* ---- For showing image */}

      <motion.div
        style={{ y: y2 }}
        animate={controls2}
        initial={{ y: 800 }}
        className="fixed left-0 right-0 bottom-0 w-full h-[400px] bg-[#1C1C1E] text-[#D4D4D4] rounded-t-3xl shadow-lg z-[70] p-[25px] pt-[5px]"
      >
        {/* Drag handle (same as first modal style) */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          style={{ y: y2, touchAction: "none", zIndex: 80 }}
          onDragEnd={handleDragEnd2}
          className="z-[80] w-full flex justify-center items-center h-[20px] cursor-grab active:cursor-grabbing relative"
        ></motion.div>
        <div
          className="w-full flex justify-center items-center h-[20px] mt-[-20px] relative"
          style={{ zIndex: 70 }}
        >
          <div className="w-[80px] h-[6px] bg-[#5a595c] rounded-full"></div>
        </div>

        <div className="w-full h-[calc(100%-20px)] flex justify-center items-center overflow-hidden">
          <TransformWrapper
            className="w-full h-full"
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            doubleClick={{ disabled: true }}
            pinch={{ disabled: false }}
            wheel={{ disabled: false }}
            panning={{ disabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
            >
              <img
                src={trnReciept || ""}
                alt="Zoomable"
                // style={{ width: "100%", height: "auto", display: "block" }}
                className="w-full h-full object-contain"
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </motion.div>
    </div>
  );
}
