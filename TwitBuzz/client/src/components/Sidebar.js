import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsTwitter } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { AiFillCamera } from "react-icons/ai";
import { FiBookmark } from "react-icons/fi";
import { GrLogout } from "react-icons/gr";
import {GoThreeBars} from "react-icons/go"
import { GrSearch } from "react-icons/gr";
import { FaHashtag } from "react-icons/fa";
import { useToast } from "@chakra-ui/toast";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import moment from "moment";
import axios from "axios";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";

import jwtDecode from "jwt-decode";

function Sidebar() {
  const [activeUser, setActiveUser] = useState("");
  const [input, setInput] = useState("");
  const toast = useToast();
  const [img, setImg] = useState();
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [sidebar, setSidebar] = useState(true);

  const showSidebar = () => setSidebar(true);
  const hideSidebar = () => setSidebar(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const onImageChange = (e) => {
    const [file] = e.target.files;
    setImg(URL.createObjectURL(file));
    setIsImageSelected(true);
  };

  const checkInput = input || isImageSelected;

  const successToast = () => {
    toast({
      title: `Tweet sent`,
      position: "top",
      isClosable: true,
    });
  };

  async function populateUser() {
    const req = await fetch("http://localhost:5000/feed", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    if (data.status === "ok") {
      setActiveUser(data.activeUser.username);
    } else {
      alert(data.error);
    }
  }

  populateUser();

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const logout = (e) => {
    
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 650px)");
    const listener = () => setIsDesktop(media.matches);
    listener();
    const show = () => setSidebar(!media.matches);
    show();
    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [isDesktop]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const tweet = {
      content: input,
      postedBy: {
        username: activeUser,
      },
      image: "",
      likes: [],
      retweets: [],
      comments: [],
      likeTweetBtn: "black",
      postedTweetTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
      tweetId: moment(),
    };

    let form = document.getElementById("form");
    let formData = new FormData(form);
    formData.append("main", JSON.stringify(tweet));
    const action = e.target.action;

    axios
      .post(`${action}`, formData)
      .then(setInput(""))
      .then(successToast())
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      {isDesktop && (
        <Link to="#" className="menu-bars">
          <GoThreeBars onClick={showSidebar} />
        </Link>
      )}

      {sidebar && (
        <div className="sidebar">
          {isDesktop && (
             <div className="closebtn">
             <Link to="#" className="menu-bars">
               <AiIcons.AiOutlineClose onClick={hideSidebar}/>
             </Link>
           </div>
          )}
         

          <ul className="sidebar-menu">
            <li className="sidebar-menu-items">
              <div className="title">
                <Link to="/feed">
                  {/* <BsTwitter /> */}
                  <div className="img">
                    <img src={require("../images/logo1.png")} />
                  </div>
                </Link>
              </div>
            </li>
            <li className="sidebar-menu-items">
              <Link to="/feed">
                <AiOutlineHome />
                <div>Home</div>
              </Link>
            </li>
            <li className="sidebar-menu-items">
              <Link to={`/profile/${activeUser}`}>
                <CgProfile />
                <div>Profile</div>
              </Link>
            </li>
            <li className="sidebar-menu-items">
              <Link to={`/bookmarks/${activeUser}`}>
                <FiBookmark />
                <div>Bookmark</div>
              </Link>
            </li>
            <li className="sidebar-menu-items">
              <Link to={"/trend"}>
                <FaHashtag />
                <div>Trending</div>
              </Link>
            </li>
            
            <li className="sidebar-menu-items">
              <Link to={"/users"}>
                <GrSearch />
                <div>Explore</div>
              </Link>
            </li>
            <li onClick={logout} className="sidebar-menu-items">
              <Link to="/">
                <GrLogout />
                <div>Logout</div>
              </Link>
              </li>
            <li className="sidebar-menu-items tweet-list-item">
              <Popup
                trigger={
                  <button className="tweetBtn sidebar-menu-tweetBtn">
                   Tweet
                  </button>
                }
                modal
                position="center"
              >
                {(close) => (
                  <form
                    onSubmit={(e) => {
                      handleSubmit(e);
                      close();
                    }}
                    method="post"
                    encType="multipart/form-data"
                    action="http://localhost:5000/feed"
                    className="tweet-form"
                    id="form"
                  >
                    <input
                      autoFocus
                      placeholder="What's happening?"
                      type="text"
                      value={input}
                      onChange={handleChange}
                    ></input>
                    <div className="tweet-flex">
                      <label
                        style={{ border: "none" }}
                        className="avatar-label"
                      >
                        <AiFillCamera
                          style={{
                            color: "#1DA1F2",
                            fontSize: "1.5rem",
                          }}
                        />
                        <input
                          className="avatar-input"
                          id="avatarInputId"
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          name="tweetImage"
                          onChange={onImageChange}
                        />
                      </label>
                      <button
                        className={checkInput ? "tweetBtn" : "disabled"}
                        disabled={!checkInput}
                        type="submit"
                      >
                        {" "}
                        Tweet
                      </button>
                    </div>
                    <img className="tweet-preview" src={img} alt="" />
                  </form>
                )}
              </Popup>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default Sidebar;
