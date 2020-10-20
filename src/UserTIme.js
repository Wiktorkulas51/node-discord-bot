const fs = require("fs");
const path = require("path");

module.exports = class UserTime {
  constructor(data, user, name) {
    this.data = data;
    this.user = user;
    this.name = name;
    this.userTime = Date.now();
    this.counter = 0;
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

  time() {
    setInterval(() => {
      this.counter++;
      const timeCounter = this.userTime + this.counter;

      const userObj = {
        name: this.name,
        useriD: this.user.id,
        userTime: timeCounter,
      };
      let userData = JSON.stringify(userObj);
      this.writeFileOndate(userData);

      console.log(timeCounter);
    }, 1000);
  }
};
