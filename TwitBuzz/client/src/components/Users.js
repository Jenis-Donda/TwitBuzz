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

function Users(props) {
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState("");
  const navigate = useNavigate();
  const [followBtn, setFollowBtn] = useState("");
  let { userName } = useParams();
  const isActiveUser = activeUser === userName;
  console.log(activeUser);

  const [users, setusers] = useState([]);

  const search = async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;

    console.log(username);
    const response = await fetch(
      `http://localhost:5000/usersearch?keyword=${username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json();
    // console.log(json);

    setusers(json);
  };

  const gotoprofile = async (userName) => {
   navigate(`/profile/${userName}`)
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      setActiveUser(user.username);
      if (!user) {
        localStorage.removeItem("token");
      } else {
        //fetchallhashes();
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
        <div class="row mt-5"></div>
        <p className="trendtext">Users</p>
        <div class="container">
          <div class="row height d-flex justify-content-center align-items-center">
            <div class="col-md-8">
              <div class="search">
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  placeholder="search"
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
          {users.length > 0 ? (
            <ul class="list-group">
              {users.map((user) => (
                <>
                  {/* {checkfollow(user.username)} */}
                  <div class="row shadow p-0 mb-4 bg-body rounded">
                    <div class="col-md-9">
                      <div class="people-nearby">
                        <div class="nearby-user">
                          <div class="row">
                            <div class="col-md-2 col-sm-2">
                              <img
                                className="profile-photo-lg"
                                src={`http://localhost:5000/images/${user.avatar}`}
                              />
                            </div>
                            <div class="col-md-7 col-sm-7">
                              <Link to={`/profile/${user.username}`}>
                                <div className="profile-link">
                                  {user.username}
                                </div>
                              </Link>
                            </div>
                            <div class="col-md-3 col-sm-3 mt-2">
                              <button
                                class="btnfollow"
                                onClick={() => {
                                  gotoprofile(user.username);
                                }}
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </ul>
          ) : (
            <p>
              <center>No users found</center>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Users;
