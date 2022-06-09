const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");

const date = require(__dirname + "/date.js");

const app = express();

let grateful = [""];
let accomplishments = [""];
let mostEnjoyed = [""];
let commits = [""];

const mongoose = require("mongoose");
const res = require("express/lib/response");

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

const dateJournalSchema = new mongoose.Schema({
  date: { type: Date, default: date.getDate() },
  grateful: Array,
  accomplishments: Array,
  enjoyed: Array,
  commitments: Array,
});

const journalDate = mongoose.model("Date", dateJournalSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  let day = date.getDate();

  res.render("home", {
    day: day,
  });
});

app.get("/login", function (req, res) {
  res.render("login", {});
});

app.get("/register", function (req, res) {
  res.render("register", {});
});

app.get("/myJournals", function (req, res) {
  journalDate
    .find()
    .then((a) => {
      res.render("myJournals", {
        date: a,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//NIGHTJOURNAL

app.get("/nightJournal", function (req, res) {
  let day = date.getDate();

  res.render("nightJournal", {
    day: day,
    grateful: grateful,
    accomplishments: accomplishments,
    enjoyed: mostEnjoyed,
    commitments: commits,
  });
});

app.post("/grateful", function (req, res) {
  const gratefulFor = req.body.grateful;
  grateful.push(gratefulFor);
  res.redirect("/nightJournal");
});

app.post("/accomp", function (req, res) {
  const accomplished = req.body.accomplishments;
  accomplishments.push(accomplished);
  res.redirect("/nightJournal#grateful");
});

app.post("/enjoyed", function (req, res) {
  const enjoyed = req.body.enjoyed;
  mostEnjoyed.push(enjoyed);
  res.redirect("/nightJournal#accomplished");
});

app.post("/commit", function (req, res) {
  const commit = req.body.commitments;
  commits.push(commit);
  res.redirect("/nightJournal#enjoyed");
});

app.post("/submitJournal", function (req, res) {
  const journal = new journalDate({
    grateful: grateful,
    accomplishments: accomplishments,
    enjoyed: mostEnjoyed,
    commitments: commits,
  });

  journal.save();
  res.redirect("/myJournals");
});

app.get("/journal/:journalEntry", function (req, res) {
  const journalEntry = req.params.journalEntry;

  journalDate.findOne({ date: journalEntry }, function (err, foundEntry) {
    if (!err) {
      if (!foundEntry) {
        console.log("Doesn't exist");
      } else {
        res.render("journal", {
          title: foundEntry.date.toString().slice(0, 15),
          commitments: foundEntry.commitments,
          fuels: foundEntry.fuels,
          grateful: foundEntry.grateful,
          accomplishments: foundEntry.accomplishments,
          enjoyed: foundEntry.enjoyed,
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
