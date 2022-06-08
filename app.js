const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");

const date = require(__dirname + "/date.js");

const app = express();

let grateful = [""];
let accomplishments = [""];
let mostEnjoyed = [""];

let commits = [""];
let fuels = [""];

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
  date: { type: Date, default: Date },
  commitments: String,
  fuels: String,
  grateful: Array,
  accomplishments: Array,
  enjoyed: Array,
});

const journalDate = mongoose.model("Date", dateJournalSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  let day = date.getDate();

  journalDate
    .find()
    .then((a) => {
      res.render("home", {
        day: day,
        date: a,
        grateful: a,
        accomplishments: a,
        enjoyed: a,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//MORNING JOURNAL

app.get("/morningJournal", function (req, res) {
  let day = date.getDate();
  res.render("morningJournal", {
    day: day,
    commits: commits,
    fuels: fuels,
  });
});

app.post("/commits", function (req, res) {
  let commitments = req.body.commits;
  commits.push(commitments);

  res.redirect("/morningJournal");
});

app.post("/fuel", function (req, res) {
  let fueling = req.body.fuel;
  fuels.push(fueling);

  res.redirect("/morningJournal");
});

//NIGHTJOURNAL

app.get("/nightJournal", function (req, res) {
  let day = date.getDate();

  res.render("nightJournal", {
    day: day,
    grateful: grateful,
    accomplishments: accomplishments,
    enjoyed: mostEnjoyed,
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
  res.redirect("/nightJournal");
});

app.post("/enjoyed", function (req, res) {
  const enjoyed = req.body.enjoyed;
  mostEnjoyed.push(enjoyed);

  const journal = new journalDate({
    grateful: grateful,
    accomplishments: accomplishments,
    enjoyed: mostEnjoyed,
  });

  journal.save();

  res.redirect("/");
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
