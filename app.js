const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");

const date = require(__dirname + "/date.js");

const app = express();

// let grateful = ["Family", "Waking up in a beautiful place"];
// let accomplishments = ["nothing"];
// let mostEnjoyed = "";

let commits = [""];
let fuels = [""];

const mongoose = require("mongoose");

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
  date: { type: Date, default: Date.now },
  commitments: String,
  fuels: String,
  grateful: String,
  accomplishments: String,
  enjoyed: String,
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

  journalDate
    .find()
    .then((a) => {
      res.render("nightJournal", {
        day: day,
        grateful: a,
        accomplishments: a,
        enjoyed: a,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/grateful", function (req, res) {
  const gratefulFor = req.body.grateful;
  const grateful = new journalDate({
    grateful: gratefulFor,
  });
  grateful.save();
  res.redirect("/nightJournal");
});

app.post("/accomp", function (req, res) {
  const accomplished = req.body.accomplishments;
  const accomplishments = new journalDate({
    accomplishments: accomplished,
  });
  accomplishments.save();
  res.redirect("/nightJournal");
});

app.post("/enjoyed", function (req, res) {
  const mostEnjoyed = req.body.enjoyed;
  const enjoyed = new journalDate({
    enjoyed: mostEnjoyed,
  });
  enjoyed.save();
  res.redirect("/nightJournal");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
