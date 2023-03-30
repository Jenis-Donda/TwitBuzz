import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./routes/home";
import Profile from "./routes/profile";
import User from "./routes/users";
import SignUp from "./routes/signUp";
import Forgot from "./routes/forgot";
import Hashes from "./routes/hashes";
import HashTweets from "./routes/hashtweets";
import ResetPassword from "./routes/resetpassword";
import Bookmark from "./routes/bookmark";
import { ChakraProvider } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="feed" element={<App />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forgot" element={<Forgot />} />
        <Route path="profile" element={<Profile />} />
        <Route path="/profile/:userName" element={<Profile />} />
        <Route path="trend" element={<Hashes />} />
        <Route path="users" element={<User />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/bookmarks/:userName" element={<Bookmark />} />
        <Route path="/trend/:hashname" element={<HashTweets />} />
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
);
