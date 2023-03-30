import React, { useState, useEffect } from "react";
import Tweet from "./Tweet";
import { useNavigate } from "react-router-dom";
import { AiFillCamera } from "react-icons/ai";
import axios from "axios";
import jwtDecode from "jwt-decode";
import moment from "moment";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useParams } from "react-router";

function HashedTweets() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState("");
  const navigate = useNavigate();
  let { hashname } = useParams();


  async function populateTweets() {
    console.log("iii")
    const req = await fetch(`http://localhost:5000/trends/${hashname}`, {
      method: "POST",
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    console.log(data.activeUser.username)
    if (data.status === "ok") {
      setTweets(data.tweets.tweets);
      console.log(tweets)
      console.log(data.tweets.tweets)
      setActiveUser(data.activeUser.username);
      setLoading(false);
    } else {
      alert(data.error);
      navigate("/");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      if (!user) {
        localStorage.removeItem("token");
      } else {
        populateTweets();
      }
    } else navigate("/");
  }, [loading]);

  return (
    <div>
      <div className="tweets">
      <p className="trendname">#{hashname}</p>
        <ul className="tweet-list">
          {loading ? (
            <div
              style={{ marginTop: "50px", marginLeft: "250px" }}
              class="loadingio-spinner-rolling-uzhdebhewyj"
            >
              <div class="ldio-gkgg43sozzi">
                <div></div>
              </div>
            </div>
          ) : (
            tweets.map(function (tweet) {
              return (
                <>
               
                  <Tweet
                    updateLoading={setLoading}
                    user={activeUser}
                    body={tweet}
                  />
                </>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default HashedTweets;
