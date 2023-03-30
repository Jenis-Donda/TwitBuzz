import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";

function SignupBody() {
  const [email, setEmail] = useState("");
  const [linksent, setLinksent] = useState(true);
  const toast = useToast();

  const errorToast = () => {
    toast({
      title: `Email not exist`,
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  const SuccessToast = () => {
    toast({
      title: `Password reset link sent successfully`,
      className:"stoast",
      position: "top",
      isClosable: true,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      email: email,
    };

    fetch("http://localhost:5000/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        response.json();
        if (response.status == 400) {
          errorToast();
        } else if (response.status == 200) {
          fetch("http://localhost:5000/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
            .then((response) => {
              SuccessToast();
              setEmail("");
              response.json();
            })
            .then((data) => {
              console.log(data);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
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
          <h2>Forgot Password</h2>
        </div>

        <form
          className="homeContainer-form"
          method="post"
          onSubmit={handleSubmit}
        >
          {linksent ? (
            <>
              <input
                required
                className="homeContainer-input"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              ></input>
              <br></br>
              <br></br>
              <button
                className="homeContainer-btn"
                type="submit"
                onClick={handleSubmit}
              >
                Send Reset Link
              </button>
              <br></br>
              <Link to="/">
                {" "}
                <p className="back">
                  <u>Back to Login</u>
                </p>
              </Link>
            </>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}

export default SignupBody;
