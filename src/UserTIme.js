const fs = require("fs");
const path = require("path");

module.exports = class UserTime {
  constructor(data, user, name) {
    this.data = data;
    this.user = user;
    this.name = name;
    this.userTimeJoined = Date.now();
    this.diff = null;
    this.userTimeLeft = Date.now();
    this.userObj = {
      name: this.name,
      useriD: this.user.id,
      userJoind: this.userTimeJoined,
      userLeft: this.userTimeLeft,
      userTimeDiff: this.diff,
    };
  }

  checkDir(dirName) {
    fs.access(path.join(__dirname, dirName), fs.constants.F_OK, (err) => {
      console.log(`${dirName} ${err ? "does not exist" : "exists"}`);
    });
    fs.mkdir(path.join(__dirname, dirName), (err) => {
      if (err.code === "EEXIST") return;
    });
  }

  writeFileOndate(userData) {
    if (!this.checkDir("files")) {
      fs.writeFile(
        path.join(__dirname, "./files", "usersData.json"),
        userData,
        (err) => {
          if (err) throw err;
          console.log("The file has been saved!");
        }
      );
    }
  }

  //use function writefile only when user leaving channel

  //make new function in order to read userData.json file

  time(data) {
    if (data) {
      let userData = JSON.stringify(this.userObj);
      this.writeFileOndate(userData);
    }
  }
};
