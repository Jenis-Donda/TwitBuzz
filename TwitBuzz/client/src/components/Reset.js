import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useParams } from "react-router";

function Reset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();
  let { token } = useParams();
  const navigate = useNavigate();

  const errorToast = () => {
    toast({
      title: `Something went wrong`,
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  const Notmatch = () => {
    toast({
      title: `password and confirm password not match`,
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  const ExpireLink = () => {
    toast({
      title: `Password reset link is invalid or has expired`,
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  const SuccessToast = () => {
    toast({
      title: `Password updated successfully`,
      className: "stoast",
      position: "top",
      isClosable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      token: token,
      password: password,
    };

    console.log(data);

    if (password !== confirmPassword) {
      Notmatch();
    } else {
      fetch(`http://localhost:5000/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status == 404) {
            ExpireLink();
            setPassword("");
            setConfirmPassword("");
          } else {
            SuccessToast();
            response.json();
            navigate("/");
          }
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div className="container">
      <div className="homeContainer">
        <div className="homeContainer-logo">
          <center>
            <div className="img">
              <img src={require("../images/logo1.png")} />
            </div>
          </center>
        </div>
        <br></br>
        <div className="homeContainer-header">
          <h2>Reset Password</h2>
        </div>

        <form
          className="homeContainer-form"
          method="post"
          onSubmit={handleSubmit}
        >
          <input
            required
            className="homeContainer-input"
            type="password"
            placeholder="Enter New Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          ></input>
          <input
            required
            className="homeContainer-input"
            type="password"
            placeholder="Enter Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          ></input>
          <br></br>
          <br></br>
          <button
            className="homeContainer-btn"
            type="submit"
            onClick={handleSubmit}
          >
            Reset Password
          </button>
          <br></br>
          <Link to="/forgot">
            {" "}
            <p className="back">
              <u>Resend link</u>
            </p>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Reset;
