import React from "react";
import Header from "../components/Header";
import ProfileBody from "../components/ProfileBody";
//import ProfileBody from "../components/ProfileBody";
import Sidebar from "../components/Sidebar";
import Trending from "../components/Trends";
import Tweet from "../components/Tweet";
import HashedTweets from "../components/HashedTweets";
import Bookmarks from "../components/Bookmarks";


function Bookmark() {
  return (
    <div className="App">
      <Sidebar />
      <div className="HeaderAndFeed">
      <Header />
      <Bookmarks/>
      </div>
    </div>
  );
}

export default Bookmark;
