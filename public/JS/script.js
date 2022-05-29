const toggleMorning = document.querySelector(".morningLog");
const toggleNight = document.querySelector(".nightLog");

const morningIntentions = document.querySelector(".morningIntentions");
const nightJournal = document.querySelector(".nightJournal");

toggleMorning.addEventListener("click", function () {
  morningIntentions.classList.toggle("hidden");
});

toggleNight.addEventListener("click", function () {
  nightJournal.classList.toggle("hidden");
});
