import React from "react";
import Header from "../components/Header";
//import ProfileBody from "../components/ProfileBody";
import Sidebar from "../components/Sidebar";
import Trending from "../components/Trends";


function Hashes() {
  return (
    <div className="App">
      <Sidebar />
      <div className="HeaderAndFeed">
        <Header />
        <Trending />
      </div>
    </div>
  );
}

export default Hashes;
