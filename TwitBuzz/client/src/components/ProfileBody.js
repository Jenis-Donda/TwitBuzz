import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { AiFillCamera } from "react-icons/ai";
import { GrLocation } from "react-icons/gr";
import { HiOutlineCake } from "react-icons/hi";
import { Link } from "react-router-dom";
import Tweet from "./Tweet";
import jwtDecode from "jwt-decode";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { BiUnderline } from "react-icons/bi";
import { textDecoration } from "@chakra-ui/styled-system";

function ProfileBody() {
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState([]);
  const [activeUser, setActiveUser] = useState("");
  const [followers, setFollowers] = useState([]);
  const [followBtn, setFollowBtn] = useState("");
  const [avatar, setAvatar] = useState("initial-avatar.png");
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isprofileChanged, setIsprofileChanged] = useState(false);
  const navigate = useNavigate();
  let { userName } = useParams();
  const isActiveUser = activeUser;
  const [img, setImg] = useState();
  const [edited, setedited] = useState();
  const [bday, setbday] = useState("");
  const [location, setlocation] = useState("");
  const [bio, setbio] = useState("");
  const [birth, setbirth] = useState();
  const [loc, setloc] = useState();
  const [bioo, setbioo] = useState();
  const [option, setoption] = useState("1");

  const onChangebday = (e) => {
    setbirth(e.target.value);
  };

  const onChangelocation = (e) => {
    setloc(e.target.value);
  };

  const onChangebio = (e) => {
    setbioo(e.target.value);
  };

  const handleoptionfollowers = (e) => {
    setoption("2");
    isprofileChanged(true);
  };

  const handleoptiontweets = (e) => {
    setoption("1");
  };

  const addbio = async (e) => {
    setedited("");
    e.preventDefault();

    const response = await fetch(
      `http://localhost:5000/profile/createbio/${activeUser}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          birthday: birth,
          location: loc,
          bio: bioo,
        }),
      }
    );

    const json = await response.json();
    const inputDate = new Date(json.birthday);
    const day = inputDate.getDate().toString().padStart(2, "0");
    const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
    const year = inputDate.getFullYear().toString();
    const formatteddate = `${day}/${month}/${year}`;
    setbday(formatteddate);
    setbirth(formatteddate);
    setlocation(json.location);
    setloc(json.location);
    setbioo(json.bio)
    setbio(json.bio);
  };

  const cancel = async (e) => {
    setedited("");
    setbirth(bday);
    setloc(location);
    setbioo(bio);
  };

  const onImageChange = (e) => {
    const [file] = e.target.files;
    setImg(URL.createObjectURL(file));
    setIsImageSelected(true);
  };

  const edit = (e) => {
    setedited("1");
  };

  const handleFollow = (e) => {
    e.preventDefault();

    fetch(`http://localhost:5000/user/${activeUser}/follow/${userName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setFollowers(data.followers);
        setFollowBtn(data.followBtn);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  async function populateUserData() {
    const req = await fetch(`http://localhost:5000/profile/${userName}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    console.log(data);
    if (data.status === "ok") {
      setLoading(false);
      setActiveUser(data.activeUser);
      setTweets(data.tweets);
      setFollowers(data.followers);
      setFollowBtn(data.followBtn);
      setAvatar(data.avatar);
      setoption("1");
      const inputDate = new Date(data.birthday);
      const day = inputDate.getDate().toString().padStart(2, "0");
      const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
      const year = inputDate.getFullYear().toString();
      const formatteddate = `${day}/${month}/${year}`;
      setbday(formatteddate);
      setbirth(formatteddate);
      setlocation(data.location);
      setbio(data.bio);
      setloc(data.location);
      setbioo(data.bio);
      setIsprofileChanged(false);
    } else {
      alert(data.error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      if (!user) {
        localStorage.removeItem("token");
      } else {
        populateUserData();
      }
    } else navigate("/");
  }, [isprofileChanged]);

  const handleSubmitAvatar = (e) => {
    e.preventDefault();
    let form = document.getElementById("form");
    let formData = new FormData(form);
    const action = e.target.action;

    axios.post(`${action}`, formData).then((response) => {
      response.data.status === "ok" && setAvatar(response.data.avatar);
    });
  };

  const ref = useRef();

  const textStyle = {
    fontWeight: option==1 ? "bold" : "normal",
    color: option==1 ? "black":"",
  };

  const textStyle1 = {
    fontWeight: option==2 ? "bold" : "normal",
    color: option==2 ? "black":"",
  };

  return (
    <>
    <div className="container">
      <div className="flex-avatar">
        <img
          className="profile-avatar"
          src={`http://localhost:5000/images/${avatar}`}
        ></img>
        {isActiveUser==userName && (
          <form
            className="avatar-form"
            onSubmit={handleSubmitAvatar}
            action={`http://localhost:5000/avatar/${activeUser}`}
            encType="multipart/form-data"
            id="form"
          >
            <label className="avatar-label">
              <AiFillCamera />
              <input
                className="avatar-input"
                id="avatarInputId"
                type="file"
                accept=".png, .jpg, .jpeg"
                name="photo"
                onChange={onImageChange}
                required
              />
              Upload profile picture
            </label>

            <Popup
              trigger={<img className="avatar-preview" src={img} alt="" />}
              modal
              position="center"
            >
              <div className="popup-avatar">
                <h1>Preview</h1>
                <img
                  style={{ width: "200px", margin: "20px auto" }}
                  src={img}
                  alt=""
                />
              </div>
            </Popup>
            {isImageSelected && (
              <button className="tweetBtn avatarBtn" type="submit">
                Confirm
              </button>
            )}
          </form>
        )}
      </div>

      {bio && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{bio}</span>
        </div>
      )}

      {bday && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <HiOutlineCake style={{ marginRight: "0.5rem" }} />
          <span>{bday}</span>
        </div>
      )}

      {location && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <GrLocation style={{ marginRight: "0.5rem" }} />
          <span>{location}</span>
        </div>
      )}

      <br></br>
      {console.log(isActiveUser)}
      {isActiveUser==userName && (
        
        <div>
          <div class="col-md-3 col-sm-3 mt-0 ml-5">
            <button class="btnedit" onClick={edit}>
              Edit Bio
            </button>
          </div>
          <br></br>
          {edited && (
            <>
              <div class="form-group pmd-textfield pmd-textfield-floating-label">
                <label for="regularfloating">Enter Birthday</label>
                <input
                  id="regularfloating"
                  class="form-control"
                  type="text"
                  placeholder={birth}
                  onChange={onChangebday}
                  ref={ref}
                  onFocus={() => (ref.current.type = "date")}
                />
              </div>
              <br></br>

              <div class="form-group pmd-textfield pmd-textfield-floating-label">
                <label for="regularfloating">Add Location</label>
                <input
                  id="regularfloating"
                  class="form-control"
                  type="text"
                  value={loc}
                  onChange={onChangelocation}
                />
              </div>

              <div class="form-group pmd-textfield pmd-textfield-floating-label">
                <label>Enter Bio</label>
                <textarea
                  class="form-control"
                  value={bioo}
                  onChange={onChangebio}
                ></textarea>
              </div>

              <div class="col-md-4 col-sm-3 mt-3 ml-5 mb-5">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button class="btnsave" onClick={addbio}>
                    Save
                  </button>
                  <div style={{ marginLeft: "30px" }}></div>
                  <button class="btnsave" style={{backgroundColor:"#db0e0e"}} onClick={cancel}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <br></br>
      <div className="Bio"></div>
      <div className="userName">{userName}</div>
      

      <div className="followFollowing">
        <div>
          <b></b> <p style={textStyle} onClick={handleoptiontweets}>Tweets</p>
        </div>
        <div>
          <p style={textStyle1} onClick={handleoptionfollowers}>Followers</p>
        </div>
      </div>

      {isActiveUser!=userName && (
        <div className="followBtn-div">
          <form
            action={`http://localhost:5000/user/${activeUser}/follow/${userName}`}
            method="POST"
            className="follow-form"
            onSubmit={handleFollow}
          >
            <button className="followBtn" type="submit">
              {followBtn}
            </button>
          </form>
        </div>
      )}

      {option == 1 && (
        <div className="userTweets">
          <div className="userTweets-heading">Tweets</div>
          <div className="tweets">
            <ul className="tweet-list">
              {loading ? (
                <div
                  style={{ marginTop: "50px", marginLeft: "250px" }}
                  className="loadingio-spinner-rolling-uzhdebhewyj"
                >
                  <div className="ldio-gkgg43sozzi">
                    <div></div>
                  </div>
                </div>
              ) : (
                tweets.map(function (tweet) {
                  return <Tweet user={activeUser} body={tweet} />;
                })
              )}
            </ul>
          </div>
        </div>
      )}

      {option == 2 && (
        <>
          <div class="mt-5">
          <div className="userTweets-heading">followers</div>
          <br></br>
            {followers.length > 0 ? (
              <ul class="list-group">
                {followers.map((user) => (
                  <>
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
                                <div className="profile-link" onClick={()=>setIsprofileChanged(true)}>{user.username}</div>
                                </Link>
                              </div>
                              {/* <div class="col-md-3 col-sm-3 mt-2">
                                <button class="btnfollow"  onClick={() => {
                                  gotoprofile(user.username);
                                }}>View Profile</button>
                              </div> */}
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
                <center>No followers.</center>
              </p>
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
}

export default ProfileBody;
