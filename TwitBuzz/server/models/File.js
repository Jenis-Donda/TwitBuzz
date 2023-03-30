const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followBtn: {
    type: String,
    default: "Follow",
  },
  birthday:{
    type:Date,
  },
  location:{
    type:String,
  },
  bio:{
    type:String,
  },
  resetPasswordToken: {
    type:String,
  },
  resetPasswordExpires: {
    type:Date,
  },
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
  Bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
});

const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    image: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postedTweetTime: {
      type: String,
      default: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    likes: {
      type: Array,
    },
    likeTweetBtn: {
      type: String,
      default: "black",
    },
    retweetBtn: {
      type: String,
      default: "black",
    },
    retweetedByUser: {
      type: String,
    },
    isRetweeted: {
      type: Boolean,
      default: false,
    },
    retweets: {
      type: Array,
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    hashname:{
      type:String,
      default:"",
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

const hashSchema = new mongoose.Schema(
  {
    hashname: {
      type: String,
      validate: {
        validator: function (v) {
          return /^#/.test(v);
        },
      },
      required: true,
    },
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
  },
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postedCommentTime: {
      type: String,
      default: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    likes: {
      type: Array,
    },
    likeCommentBtn: {
      type: String,
      default: "black",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Tweet = mongoose.model("Tweet", tweetSchema);
const Comment = mongoose.model("Comment", commentSchema);
const HashTag= mongoose.model("HashTag", hashSchema);

module.exports = { User, Tweet, Comment,HashTag };
