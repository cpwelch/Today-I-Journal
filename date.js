exports.getDate = function () {
  let today = new Date();

  let options = {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return today.toLocaleDateString("en-uk", options);
};
