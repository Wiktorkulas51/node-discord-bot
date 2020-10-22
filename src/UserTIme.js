const fs = require("fs");
const path = require("path");
const randkey = require("random-keygen");
const replace = require("replace-in-file");

module.exports = class UserTime {
  constructor(oldMember, newMember) {
    this.oldMember = oldMember;
    this.newMember = newMember;
    this.user = this.oldMember.member.user;
    this.name = this.oldMember.member.user.username;
    this.userTimeJoined = null;
    this.diff = null;
    this.userTimeLeft = null;
    this.userObj = {
      name: this.name,
      useriD: this.user.id,
      userJoind: this.userTimeJoined,
      userLeft: this.userTimeLeft,
      userTimeDiff: this.diff,
    };
  }

  keyGen() {
    let key = randkey.get({
      length: 10,
      numbers: true,
    });
    return key;
  }

  checkDir(dirName) {
    fs.access(
      path.join(
        __dirname,
        dirName === "usersData.json" ? "./files/usersData.json" : dirName
      ),
      fs.constants.F_OK,
      (err) => {
        console.log(`${dirName} ${err ? "does not exist" : "exists"}`);
      }
    );
    fs.mkdir(
      path.join(
        __dirname,
        dirName === "usersData.json" ? "./files/usersData.json" : dirName
      ),
      (err) => {
        if (err.code === "EEXIST") return;
      }
    );
  }

  async time() {
    let key = this.keyGen();

    if (this.newMember.channelID) {
      console.log("newme");
      this.userObj.userJoind = Date.now();
      let userData = JSON.stringify(this.userObj);
      if (!this.checkDir("usersData.json")) {
        fs.appendFile(
          path.join(__dirname, "./files", "usersData.json"),
          `[{ "key":"${key}", "userData":${userData}},]`,
          (err) => {
            if (err) throw err;
          }
        );
      }
    }

    if (this.oldMember.channelID) {
      console.log("old");
      this.userObj.userLeft = Date.now();
      // let userData = JSON.stringify(this.userObj);
      const options = {
        files: path.join(__dirname, "./files", "usersData.json"),
        from: '"userLeft":null',
        to: `"userLeft":${this.userObj.userLeft}`,
      };
      try {
        const results = await replace(options);
        console.log("Replacement results:", results);
      } catch (error) {
        console.error("Error occurred:", error);
      }

      // fs.appendFile(
      //   path.join(__dirname, "./files", "usersData.json"),
      //   `[{ "key:${key}", "userData":${userData}}]`,
      //   (err) => {
      //     if (err) throw err;
      //   }
      // );
    }
  }
};
