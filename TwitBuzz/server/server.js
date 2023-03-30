const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const cors = require("cors");
const { User, Tweet, Comment, HashTag } = require("./models/File");
const app = express();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const ApiFeatures = require("./utils/apifeatures");
const UserFilter = require("./utils/userfilter");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images", express.static("images"));
app.use("/tweetImages", express.static("tweetImages"));

mongoose.connect("mongodb://localhost:27017/twitapp", (err) => {
  if (err) console.log(err);
  else console.log("mongdb is connected");
});

//sign in
app.post("/", (req, res) => {
  const userLogin = req.body;
  User.findOne({ username: userLogin.username }).then((dbUser) => {
    if (!dbUser) {
      return res.json({
        status: "error",
        error: "Invalid login",
      });
    }
    bcrypt.compare(userLogin.password, dbUser.password).then((isCorrect) => {
      if (isCorrect) {
        const payload = {
          id: dbUser._id,
          username: dbUser.username,
        };
        const token = jwt.sign(payload, "newSecretKey", { expiresIn: 86400 });
        return res.json({ status: "ok", user: token });
      } else {
        return res.json({ status: "error", user: false });
      }
    });
  });
});

//sign up
app.post("/signup", async (req, res) => {
  const user = req.body;
  const takenUsername = await User.findOne({ username: user.username });

  if (takenUsername) {
    return res.status(400).send("username already exist");
  } else {
    user.password = await bcrypt.hash(req.body.password, 10);

    const dbUser = new User({
      username: user.username.toLowerCase(),
      password: user.password,
      avatar: "initial-avatar.png",
    });

    dbUser.save();
    return res.json({ status: "ok" });
  }
});

//feed
app.get("/feed", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "newSecretKey");
    const username = decoded.username;
    //console.log(username);
    const user = await User.findOne({ username: username });
    //console.log(user);
    Tweet.find({ isRetweeted: false })
      .populate("postedBy")
      .populate("comments")
      .sort({ createdAt: -1 })
      .exec((err, docs) => {
        if (!err) {
          //to know if a person has liked tweet
          docs.forEach((doc) => {
            if (!doc.likes.includes(username)) {
              doc.likeTweetBtn = "black";
              doc.save();
            } else {
              doc.likeTweetBtn = "deeppink";
              doc.save();
            }
          });

          //to know if a person has liked comment
          docs.forEach((doc) => {
            doc.comments.forEach((docComment) => {
              if (!docComment.likes.includes(username)) {
                docComment.likeCommentBtn = "black";
                docComment.save();
              } else {
                docComment.likeCommentBtn = "deeppink";
                docComment.save();
              }
            });
          });

          //to know if a person has retweeted the tweet
          docs.forEach((doc) => {
            if (!doc.retweets.includes(username)) {
              doc.retweetBtn = "black";
            } else {
              doc.retweetBtn = "green";
            }
          });

          return res.json({
            status: "ok",
            tweets: docs,
            activeUser: user,
          });
        }
      });
  } catch (error) {
    return res.json({ status: "error", error: "Session ended :(" });
  }
});

//populate comments of a particular tweet
app.get("/feed/comments/:tweetId", (req, res) => {
  Tweet.find({ postedTweetTime: req.params.tweetId })
    .populate("postedBy")

    .populate({
      path: "comments",
      populate: [{ path: "postedBy" }],
    })
    .exec((err, tweet) => {
      if (!err) {
        return res.json({
          status: "ok",
          tweet: tweet,
        });
      } else return res.json({ status: "error", error: "comments not found" });
    });
});

//compose tweet

const storageEngine1 = multer.diskStorage({
  destination: "tweetImages",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, callback) => {
  let pattern = /jpg|png|jpeg/; // reqex

  if (pattern.test(path.extname(file.originalname))) {
    callback(null, true);
  } else {
    callback("Error: not a valid file");
  }
};

const upload = multer({
  storage: storageEngine1,
  fileFilter,
});

app.post("/feed", upload.single("tweetImage"), (req, res) => {
  const info = JSON.parse(JSON.stringify(req.body));
  const finalInfo = JSON.parse(info.main);
  const content = finalInfo.content;
  var f = 0;
  let hashname = "";

  if (content.includes("#")) {
    for (var i = 0; i < content.length - 1; i++) {
      if (i != content.length - 1) {
        if (
          content[i] == "#" &&
          content[i + 1] != " " &&
          content[i + 1] != "#"
        ) {
          while (content[i] != " " && i <= content.length - 1) {
            hashname += content[i];
            i++;
          }
          break;
        }
      }
    }
  }
  console.log(hashname);
  function check(twit) {
    HashTag.findOne({ hashname: hashname }, (err, doc) => {
      if (doc != null) {
        //console.log(doc);
        doc.tweets.unshift(twit._id);
        doc.save();
        const newhashname = {};
        newhashname.hashname = hashname;
        Tweet.findByIdAndUpdate(twit._id, { $set: newhashname }, (err, doc) => {
          if (!err) {
            console.log("Updated!!");
          } else {
            console.log(err);
          }
        });
      } else {
        newhash = HashTag.create(
          {
            hashname: hashname,
            tweets: twit,
          },
          (err, newhash) => {
            if (!err) {
              newhash.save();
              // newhashname.hashname=hashname;
              // Tweet.findByIdAndUpdate(
              //   twit._id,
              //   { $set: newhashname },
              //   (err, doc) => {
              //     if (!err) {
              //       console.log("Updated!!");
              //     } else {
              //       console.log(err);
              //     }
              //   }
              // );
            } else
              return res.json({ status: "error", error: "An error occured" });
          }
        );
      }
    });
  }
  // console.log(req);
  newTweet = Tweet.create(
    {
      content: finalInfo.content,
      retweets: [],
      postedTweetTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    (err, newTweet) => {
      if (!err) {
        if (req.file) {
          newTweet.image = req.file.filename;
        } else console.log("no image found");
        User.findOne({ username: finalInfo.postedBy.username }, (err, doc) => {
          if (!err) {
            newTweet.postedBy = doc._id;
            if (newTweet.postedBy) {
              newTweet.save();
              doc.tweets.unshift(newTweet._id);
              doc.save();
              if (hashname != "") {
                check(newTweet);
              }

              return res.json({ image: req.file });
            } else
              return res.json({ status: "error", error: "An error occured" });
          } else
            return res.json({ status: "error", error: "An error occured" });
        });
      }
    }
  );
});

//show all trends
app.post("/fetchallhashes", async (req, res) => {
  try {
    const trends = await HashTag.find();
    res.json(trends);
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal server error");
  }
});

//search
app.post("/search", async (req, res) => {
  const apifeature = new ApiFeatures(HashTag.find(), req.query)
    .search()
    .filter();
  console.log("I Called");

  try {
    //const jobs = await Job.find();
    const trends = await apifeature.query;

    //console.log(trends);
    res.json(trends);
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal server error");
  }
});

//show tweets of particular trend
app.post("/trends/:hashname", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, "newSecretKey");
    const username = decoded.username;
    //console.log(username);
    const user = await User.findOne({ username: username });
    let temp = "#" + req.params.hashname;
    HashTag.findOne({ hashname: temp })
      .populate({
        path: "tweets",
        populate: {
          path: "postedBy",
          model: "User",
        },
      })
      .exec(function (err, doc) {
        if (err) return handleError(err);
        //console.log(doc);
        return res.json({ status: "ok", tweets: doc, activeUser: user });
      });

    console.log("I Called");
  } catch (error) {
    return res.json({ status: "error", error: "invalid hashname" });
  }
});

//Usersearch
app.post("/usersearch", async (req, res) => {
  const userfilter = new UserFilter(User.find(), req.query).search().filter();

  try {
    const users = await userfilter.query;
    console.log(users);
    res.json(users);

  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal server error");
  }
});

//Bookmark a Tweet
app.post("/bookmark/:user/:tweetid", async (req, res) => {
  const username = req.params.user;
  //console.log(username);
  const tweetId = req.params.tweetid;
  //console.log(tweetId);

  try {
    User.findOne({ username: username }, (err, doc) => {
      if (!err) {
        if (tweetId) {
          doc.Bookmarks.unshift(tweetId);
          doc.save();
          return res.json({ status: "ok" });
        } else return res.json({ status: "error", error: "An error occured" });
      } else return res.json({ status: "error", error: "An error occured" });
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal server error");
  }
});

//Remove Tweet from Bookmark
app.post("/removebookmark/:user/:tweetid", async (req, res) => {
  const username = req.params.user;
  //console.log(username);
  const tweetId = req.params.tweetid;
  //console.log(tweetId);

  try {
    User.findOne({ username: username }, (err, user) => {
      if (!err) {
        user.Bookmarks = user.Bookmarks.filter(
          (bookmark) => bookmark.toString() !== tweetId
        );
        user.save();
        return res.json({ status: "ok" });
      } else return res.json({ status: "error", error: "An error occured" });
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal server error");
  }
});

//show all bookmarks
app.post("/bookmarks/:user", async (req, res) => {
  try {
    console.log("IIIIIII");
    //console.log(req.params.user);
    User.findOne({ username: req.params.user })
      .populate({
        path: "Bookmarks",
        populate: {
          path: "postedBy",
          model: "User",
        },
      })
      .exec(function (err, doc) {
        if (err) return handleError(err);
        console.log(doc);
        res.send({ status: "ok", docs: doc, username: req.params.user });
      });
    // .populate('Bookmarks')
    // .populate('postedBy')
    // .exec(function(err,doc){
    //   if(!err)
    //     console.log(doc.Bookmarks)
    //     res.send({status:"ok",docs:doc});
    // });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

//Add bio
app.post("/profile/createbio/:userName", async (req, res) => {
  try {
    const { birthday, location, bio } = req.body;

    const newbio = {};

    if (birthday) {
      newbio.birthday = birthday;
    }
    if (location) {
      newbio.location = location;
    }
    if (bio) {
      newbio.bio = bio;
    }

    let fetchuser = await User.findOne({ username: req.params.userName });
    if (!fetchuser) {
      return res.status(400).send("404 Job is Not Found");
    }

    fetchuser = await User.findByIdAndUpdate(
      fetchuser.id,
      { $set: newbio },
      { new: true }
    );
    //console.log(fetchuser);
    fetchuser.save();
    res.json(fetchuser);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

//compose comment
app.post("/feed/comment/:tweetId", (req, res) => {
  newComment = Comment.create(
    {
      content: req.body.content,
      postedCommentTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    (err, newComment) => {
      if (!err) {
        Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
          if (!err) {
            User.findOne(
              { username: req.body.postedBy.username },
              (err, user) => {
                if (!err) {
                  newComment.postedBy = user._id;
                  if (newComment.postedBy) {
                    newComment.save();
                    doc.comments.unshift(newComment._id);
                    doc.save();
                  } else
                    return res.json({
                      status: "error",
                      error: "An error occured",
                    });
                }
              }
            );

            return res.json({ comments: doc.comments.length });
          } else
            return res.json({ status: "error", error: "An error occured" });
        });
      }
    }
  );
});

//retweet
app.route("/post/:userName/retweet/:tweetId").post((req, res) => {
  Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
    if (!err) {
      if (!doc.retweets.includes(req.params.userName)) {
        //create a new tweet
        newTweet = Tweet.create(
          {
            content: doc.content,
            postedBy: doc.postedBy,
            likes: doc.likes,
            likeTweetBtn: doc.likeTweetBtn,
            image: doc.image,
            postedTweetTime: doc.postedTweetTime,
            retweetedByUser: req.params.userName,
            isRetweeted: true,
            retweetBtn: "green",
            retweets: [req.params.userName],
          },
          (err, newTweet) => {
            if (!err) {
              User.findOne({ username: req.params.userName }, (err, doc) => {
                if (!err) {
                  doc.tweets.unshift(newTweet._id);
                  doc.save();
                } else console.log(err);
              });
            }
          }
        );

        //update the number of retweets
        doc.retweets.push(req.params.userName);

        doc.retweetBtn = "green";
        doc.save();
      } else {
        const user = req.params.user;
        Tweet.find({})
          .populate("postedBy")
          .deleteOne(
            {
              "postedBy.username": user,
              content: doc.content,
              isRetweeted: true,
            },
            (err, res) => {
              console.log(res);
            }
          );

        let indexForRetweets = doc.retweets.indexOf(req.params.userName);
        doc.retweets.splice(indexForRetweets, 1);
        doc.retweetBtn = "black";

        doc.save();
      }
    } else console.log(err);
  });
});

//like tweet
app.route("/post/:userName/like/:tweetId").post((req, res) => {
  Tweet.find({ postedTweetTime: req.params.tweetId }, (err, docs) => {
    docs.forEach((doc) => {
      if (!err) {
        if (!doc.likes.includes(req.params.userName)) {
          doc.likes.push(req.params.userName);
          doc.likeTweetBtn = "deeppink";
          doc.save();
        } else {
          let indexForLikes = doc.likes.indexOf(req.params.userName);
          doc.likes.splice(indexForLikes, 1);
          doc.likeTweetBtn = "black";
          doc.save();
        }
      } else console.log(err);
    });
  });
});

//like comment
app.route("/comment/:userName/like/:commentId").post((req, res) => {
  Comment.findOne({ postedCommentTime: req.params.commentId }, (err, doc) => {
    if (!err) {
      if (!doc.likes.includes(req.params.userName)) {
        doc.likes.push(req.params.userName);
        doc.likeCommentBtn = "deeppink";
        doc.save();
        return res.json({ btnColor: "deeppink", likes: doc.likes.length });
      } else {
        let indexForLikes = doc.likes.indexOf(req.params.userName);
        doc.likes.splice(indexForLikes, 1);
        doc.likeCommentBtn = "black";
        doc.save();
        return res.json({ btnColor: "black", likes: doc.likes.length });
      }
    } else console.log(err);
  });
});

//delete tweet
app.route("/deleteTweet/:tweetId").post((req, res) => {
  Tweet.updateMany({}, { $pull: { references: req.params.tweetId } }, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send('Failed to update references');
      return;
    }
  });

  Tweet.findOneAndDelete({ postedTweetTime: req.params.tweetId }, (err) => {
    if (!err) {
      return res.json({
        status: "ok",
      });
    } else console.log(err);
  });
});

//delete comment
app.route("/deleteComment/:commentId").post((req, res) => {
  Comment.findOneAndDelete(
    { postedCommentTime: req.params.commentId },
    (err) => {
      if (!err) {
        return res.json({
          status: "ok",
        });
      } else console.log(err);
    }
  );
});

//edit tweet
app.route("/editTweet/:tweetId").post((req, res) => {
  Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
    doc.content = req.body.content;
    doc.isEdited = true;
    doc.save();
    return res.json({
      status: "ok",
    });
  });
});

//edit comment
app.route("/editComment/:commentId").post((req, res) => {
  Comment.findOne({ postedCommentTime: req.params.commentId }, (err, doc) => {
    doc.content = req.body.content;
    doc.isEdited = true;
    doc.save();
    return res.json({
      status: "ok",
    });
  });
});

//upload image
const storageEngine = multer.diskStorage({
  destination: "images",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload1 = multer({
  storage: storageEngine,
  fileFilter,
});

app.post("/avatar/:userName", upload1.single("photo"), (req, res) => {
  User.findOne({ username: req.params.userName }, (err, user) => {
    if (!err) {
      user.avatar = req.file.filename;
      if (user.avatar) {
        user.save();
        return res.json({ status: "ok", avatar: req.file.filename });
      }
    } else return res.json({ status: "error", error: "Please upload again" });
  });
});

//user profile
app.get("/profile/:userName", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "newSecretKey");
    const username = decoded.username;
    User.findOne({ username: req.params.userName })
    .populate({
      path: "followers",
      populate: [
        { path: "tweets" },
        { path: "followers" },
      ],
    })
      .populate({
        path: "tweets",
        populate: [
          { path: "postedBy" },
          { path: "comments", populate: [{ path: "postedBy" }] },
        ],
      })
      
      .exec((err, doc) => {
        if (!err) {
          // if (!doc.followers.includes(username)) {
          //   doc.followBtn = "Follow";
          // } else doc.followBtn = "Following";

          doc.tweets.forEach((tweet) => {
            if (!tweet.likes.includes(username)) {
              tweet.likeTweetBtn = "black";
            } else tweet.likeTweetBtn = "deeppink";
          });

          doc.tweets.forEach((tweet) => {
            if (!tweet.retweets.includes(username)) {
              tweet.retweetBtn = "black";
            } else tweet.retweetBtn = "green";
          });

          console.log(doc.tweets)

          return res.json({
            status: "ok",
            tweets: doc.tweets,
            followers: doc.followers,
            followBtn: doc.followBtn,
            activeUser: username,
            avatar: doc.avatar,
            birthday: doc.birthday,
            location: doc.location,
            bio: doc.bio,
          });
        } else console.log(err);
      });
  } catch (error) {
    return res.json({ status: "error", error: "invalid token" });
  }
});

//follow
//userName= user
//user= Active user
app.route("/user/:user/follow/:userName").post((req, res) => {
  User.findOne({ username: req.params.userName }, (err, doc) => {
    if (!err) {
      if (doc.username !== req.params.user) {
        User.findOne({ username:req.params.user }, function(err, docs) {
          if (err) {
            console.log(err);
          }
          if (docs) {
            if (!doc.followers.includes(docs._id)) {
              doc.followers.unshift(docs._id);
              doc.followBtn = "Following";
              doc.save();
            } else {
              let indexForUnFollow = doc.followers.indexOf(docs._id);
              doc.followers.splice(indexForUnFollow, 1);
              doc.followBtn = "Follow";
              doc.save();
            }
            return res.json({
              followers: doc.followers.length,
              followBtn: doc.followBtn,
            });
          } else {
            console.log('No documents found');
          }
        });
       
      }
    }
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "20ceuos070@ddu.ac.in",
    pass: "J#enis@997868",
  },
});

const otps = {};

app.post("/send-otp", (req, res) => {
  const email = req.body.email;

  const otp = Math.floor(100000 + Math.random() * 900000);
  //
  //console.log("i called");

  otps[email] = otp;

  const mailOptions = {
    from: "20ceuos070@ddu.ac.in",
    to: email,
    subject: "OTP for email verification",
    text: `Your OTP for email verification is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending OTP");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("OTP sent successfully");
    }
  });
});

app.post("/verify-otp", (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const OTP = parseInt(otp);

  if (OTP === otps[email]) {
    delete otps[email];
    res.status(200).send("Email verified successfully");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      return res.status(200).send("Email Found");
    } else {
      return res.status(400).send("Email Not Found");
    }
  });
});

app.post('/forgot-password', (req, res) => {
  // Find user by email
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred');
    }
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');

    // Update user document with reset token and expiration date
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 120000; // 2 minutes

    // Save updated user document to database
    user.save((err) => {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred');
      }

      // Send password reset email
      const mailOptions = {
        to: user.email,
        from: '20ceuos070@ddu.ac.in',
        subject: 'Password Reset Request',
        text: `Hi ${user.username},\n\nYou are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://localhost:3000/reset-password/${token}\n\nThis link will be expired after 2 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send('An error occurred');
        }
        res.send('Password reset email sent');
      });
    });
  });
});

// Handle reset password requests
// Handle reset password requests
app.post('/reset-password', async (req, res) => {
  // Find user by reset token and expiration date
  try {
    const user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(404).send('Password reset token is invalid or has expired');
    }

    // Update user password
    const password = await bcrypt.hash(req.body.password, 10);
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save updated user document to database
    await user.save();

    // Send password reset confirmation email
    const mailOptions = {
      to: user.email,
      from: '20ceuos070@ddu.ac.in',
      subject: 'Your password has been changed',
      text: `Hi ${user.username},\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred');
      }
      res.send('Your password has been reset');
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('An error occurred');
  }
});

app.post("/check/:user/follow/:userName", async (req, res) => {
  User.findOne({ username: req.params.userName }, (err, doc) => {
    if (!err) {
      if (doc.username !== req.params.user) {
        User.findOne({ username: req.params.user }, (err, user) => {
          if(doc.followers.includes(user._id))
          {
            return res.json({followBtn:"following"})
          }
          else
          {
            return res.json({followBtn:"follow"});
          }
        });
      }
    }
  });
});

app.listen("5000", () => {
  console.log("server running on port 5000");
});
