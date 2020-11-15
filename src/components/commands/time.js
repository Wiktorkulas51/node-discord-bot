const utiles = require("../../utiles");

module.exports = async function (msg, jsonFileObj, CMD_NAME, args) {
  if (utiles.isEmpty(jsonFileObj)) {
    msg.delete();
    msg.reply("plik jest pusty, upewnij się, że dołączyłeś na kanał");
    return;
  }

  const userDataObj = await utiles.findUser(jsonFileObj, msg);

  const everyValFalse = userDataObj.arr.every(
    (currentValue) => currentValue === false
  );

  if (userDataObj.filteredValue[0] === true) {
    const { userTimeDiff } = jsonFileObj[userDataObj.index].userData;
    if (CMD_NAME === "time" && args[0] === "left") {
      return utiles.timeUserNeedForNextRole(msg, userTimeDiff);
    }

    const time = utiles.timeCounter(userTimeDiff);
    utiles.format(time);
    msg.delete();

    utiles.checkTime(
      msg,
      time.sec === 0 && time.min === 0
        ? "nie byłes jeszcze na żadnym kanale"
        : utiles.format(time),
      jsonFileObj[userDataObj.index].userData.name
    );
  } else if (everyValFalse) {
    msg.delete();
    msg.reply("nie dołączyłeś jeszcze na żaden kanał");
  }
};
