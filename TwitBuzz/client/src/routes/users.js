import React from "react";
import Header from "../components/Header";
//import ProfileBody from "../components/ProfileBody";
import Sidebar from "../components/Sidebar";
import Users from "../components/Users";


function User() {
  return (
    <div className="App">
      <Sidebar />
      <div className="HeaderAndFeed">
        <Header />
        <Users />
      </div>
    </div>
  );
}

export default User;
