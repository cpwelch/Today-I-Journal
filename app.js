require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require("mongoose");
const res = require("express/lib/response");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "My super secret secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const database = (module.exports = () => {
  const connectionParams = {
    useNewUrlParse: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(
      "mongodb+srv://cpw95:Blueprint45@todayijournal.yoxrnto.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("DB cnx success");
  } catch (error) {
    console.log(error);
    console.log("Db cnx error");
  }
});

database();

const userSchema = new mongoose.Schema({
  date: { type: Date, default: date.getDate() },
  grateful: Array,
  accomplishments: Array,
  enjoyed: Array,
  commitments: Array,
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  let day = date.getDate();

  res.render("login", {
    day: day,
  });
});

app.get("/login", function (req, res) {
  res.render("login", {});
});

app.get("/register", function (req, res) {
  res.render("register", {});
});

app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    let day = date.getDate();
    res.render("home", {
      day: day,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    }
  });
});

app.get("/myJournals", function (req, res) {
  if (req.isAuthenticated()) {
    User.find()
      .then((a) => {
        res.render("myJournals", {
          date: a,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

//NIGHTJOURNAL

app.get("/nightJournal", function (req, res) {
  if (req.isAuthenticated()) {
    let day = date.getDate();

    User.findById(req.user.id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          res.render("nightJournal", {
            day,
            commitments: foundUser.commitments,
            grateful: foundUser.grateful,
            accomplishments: foundUser.accomplishments,
            enjoyed: foundUser.enjoyed,
          });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/grateful", function (req, res) {
  const gratefulFor = req.body.grateful;
  User.findById(req.user.id, function (err, foundUser) {
    console.log(req.user.id);
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.grateful.push(gratefulFor);

        foundUser.save(function () {
          res.redirect("/nightJournal");
        });
      }
    }
  });
});

app.post("/accomp", function (req, res) {
  const accomplished = req.body.accomplishments;
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.accomplishments.push(accomplished);

        foundUser.save(function () {
          res.redirect("/nightJournal#grateful");
        });
      }
    }
  });
});

app.post("/enjoyed", function (req, res) {
  const enjoyed = req.body.enjoyed;
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.enjoyed.push(enjoyed);

        foundUser.save(function () {
          res.redirect("/nightJournal#accomplished");
        });
      }
    }
  });
});

app.post("/commit", function (req, res) {
  const commit = req.body.commitments;
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.commitments.push(commit);

        foundUser.save(function () {
          res.redirect("/nightJournal#enjoyed");
        });
      }
    }
  });
});

app.get("/journal/:journalEntry", function (req, res) {
  if (req.isAuthenticated()) {
    const journalEntry = req.params.journalEntry;

    User.findById(req.user.id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser && foundUser.date == journalEntry) {
          res.render("journal", {
            title: foundUser.date.toString().slice(0, 15),
            commitments: foundUser.commitments,
            grateful: foundUser.grateful,
            accomplishments: foundUser.accomplishments,
            enjoyed: foundUser.enjoyed,
          });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
