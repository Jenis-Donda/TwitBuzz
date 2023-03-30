import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { AiFillCamera } from "react-icons/ai";
import Tweet from "./Tweet";
import jwtDecode from "jwt-decode";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

function Trending() {
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState("");
  const navigate = useNavigate();
  let { userName } = useParams();
  const isActiveUser = activeUser === userName;

  const [hashes, sethashes] = useState([]);
  const fetchallhashes = async () => {
    await fetch("http://localhost:5000/fetchallhashes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.sort((a, b) => (a.tweets.length < b.tweets.length) ? 1: -1)
        sethashes(data)});
  };

  const search = async (e) => {
    e.preventDefault();
    const hashname = document.getElementById("hashname").value;

    console.log(hashname);
    const response = await fetch(
      `http://localhost:5000/search?keyword=${hashname}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json();
    // console.log(json);

    sethashes(json);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      if (!user) {
        localStorage.removeItem("token");
      } else {
        fetchallhashes();
      }
    } else navigate("/");
  }, []);

  return (
    <>
      <link
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        rel="stylesheet"
      />

      <div class="container">
        <p className="trendtext">Trends</p>
        <div class="container">
          <div class="row height d-flex justify-content-center align-items-center">
            <div class="col-md-8">
              <div class="search">
                <input
                  type="text"
                  class="form-control"
                  id="hashname"
                  placeholder="#search"
                  onChange={search}
                />
                <form method="post" onSubmit={search}>
                  {/* <button class="btn btn-primary btn-rounded">Search</button> */}
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5">
         {hashes.length > 0 ? <ul class="list-group">
              {hashes.map((hash) => (
                <>
                {hash.tweets.length > 0 ? <>
                   <div class="d-style btn btn-brc-tp border-2 bgc-white btn-outline-blue btn-h-outline-blue btn-a-outline-blue w-100 my-2 py-3 shadow p-3 mb-4 bg-body rounded">
                   <div class="row align-items-center">
                     <div class="col-12 col-md-4">
                       <p className="hashtext">
                         <Link to={`/trend/${hash.hashname.slice(1)}`}>
                           <u>{hash.hashname}</u>
                         </Link>
                         <p className="tweettext">{hash.tweets.length} tweets</p>
                       </p>
                       
                     </div>
                   </div>
                 </div>
                </>:(<></>)}
                </>
              ))}
            </ul>:<p><center>No Trends are availabe</center></p>}
        </div>
      </div>
    </>
  );
}

export default Trending;
