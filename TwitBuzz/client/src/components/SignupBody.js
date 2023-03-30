import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { BsTwitter } from "react-icons/bs";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";

function SignupBody() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const toast = useToast();
  const successToast = () => {
    toast({
      title: `Successfully registered, please login`,
      position: "top",
      isClosable: true,
    });
  };

  const verified = () => {
    toast({
      title: `Email Verified Successfully`,
      position: "top",
      isClosable: true,
    });
  };

  const error = () => {
    toast({
      title: `Email not verified`,
      position: "top",
      isClosable: true,
      status: "error",
    });
  };

  const userexist = () => {
    toast({
      title: `User already exist`,
      position: "top",
      isClosable: true,
      status: "error",
    });
  };

  
  const Notverified = () => {
    toast({
      title: `Invalid OTP`,
      position: "top",
      status: "error",
      isClosable: true,
    });
  };

  const handleVerify = (event) => {
    event.preventDefault();

    const otpdata = {
      email: email,
      otp: otp,
    };

    console.log(otpdata);

    fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(otpdata),
    })
      .then((res) => {
        if (res.status == 200) {
          verified();
          setEmailVerified(true);
          setOtpSent(true);
        }
        else{
          Notverified();
          setEmailVerified(false);
        }
      })
      .then(setOtp(""))
      .catch((error) => {
        console.log(error);
      });
  };

  const handleotp = (event) => {
    event.preventDefault();
    console.log(email);
    axios
      .post("http://localhost:5000/send-otp", { email })
      .then((response) => {
        console.log(response.data);
        setOtpSent(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangeOTP = (e) => {
    setOtp(e.target.value);
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPerson = {
      username: userName,
      password: password,
      email:email
    };

    fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(newPerson),
    })
      .then((res) => {
       if(res.status==400)
       {
          userexist();
       }
      })
      .then((data) => {
        if (data.status === "ok") {
          if (emailVerified) {
            successToast();
            setTimeout(() => {
              navigate("/");
            }, 600);
          } else {
            error();
          }
        }
      })
      .then(setUserName(""))
      .then(setPassword(""));
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
          <h2>Join TwitBuzz today</h2>
        </div>

        <a className="googleSignIn" href="#">
          <FcGoogle style={{ fontSize: "1.3rem" }} />
          <div> Sign up with Google</div>
        </a>
        <div className="homeContainer-hr">
          <hr style={{color:"black"}}></hr>
          <span>or</span>
          <hr style={{color:"black"}}></hr>
        </div>
        <form
          className="homeContainer-form"
          action="http://localhost:5000/signup"
          method="post"
          onSubmit={handleSubmit}
        >
          <input
            required
            className="homeContainer-input"
            type="text"
            placeholder="Enter Username"
            value={userName}
            onChange={handleChangeUserName}
          ></input>
          <br></br>
          <input
            required
            className="homeContainer-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={handleChangePassword}
          ></input>
          <br></br>
          {!otpSent ? (
            <>
              <input
                required
                className="homeContainer-input"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={handleChangeEmail}
              ></input>
              <br></br>
              <button
                className="homeContainer-btn"
                type="submit"
                onClick={handleotp}
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              {!emailVerified && (
                <>
                  <input
                    required
                    className="homeContainer-input"
                    type="number"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={handleChangeOTP}
                  ></input>
                  <br></br>
                  <button
                    className="homeContainer-btn"
                    type="submit"
                    onClick={handleVerify}
                  >
                    Verify
                  </button>
                </>
              )}
            </>
          )}

          <br></br>
          <br></br>
          {emailVerified && (
            <button className="homeContainer-btn" type="submit">
            Sign up
          </button>
          )}
          
        </form>
        <div className="homeContainer-signup">
          Already have an account? <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupBody;
