const fs = require("fs");
const path = require("path");
const randkey = require("random-keygen");
const replace = require("replace-in-file");

module.exports = class UserTime {
  constructor(oldMember, newMember) {
    this.oldMember = oldMember;
    this.newMember = newMember;
    this.user = this.newMember.member.user;
    this.name = this.newMember.member.user.username;
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

  async replaceFunc(options) {
    try {
      const results = await replace(options);
      console.log("Replacement results:", results);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  keyGen() {
    let key = randkey.get({
      length: 10,
      numbers: true,
    });
    return key;
  }

  readingFile(fileName) {
    fs.readFile(path.join(__dirname, "./files", fileName), (err, date) => {
      if (err) console.log("message error", err.message);
      if (date) {
        const toConsolelog = JSON.parse(date);
        console.log(toConsolelog);
        return JSON.parse(date);
      }
    });
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
    if (this.newMember.channelID) {
      const jsonDate = await this.readingFile("usersData.json");
      const jsonD = await require("./files/usersData.json");

      let key = this.keyGen();

      this.userObj.userJoind = Date.now();
      const dateNow = Date.now();

      if (jsonD.userData.useriD !== jsonDate.userData.useriD) {
        console.log("why kURWA PRAWDA");
        key = this.keyGen();
        let userData = JSON.stringify(this.userObj, null, 4);
        if (!this.checkDir("usersData.json")) {
          fs.appendFile(
            path.join(__dirname, "./files", "usersData.json"),
            `{ "key":"${key}", "userData":${userData}}`,
            (err) => {
              if (err) throw err;
            }
          );
        }
      } else {
        const jsonDateKey = jsonDate.key;
        console.log("oldmemjson", await jsonDate.key);
        console.log(key);

        if (key === jsonDateKey) {
          console.log("true");
          const options = {
            files: path.join(__dirname, "./files", "usersData.json"),
            from: `"userJoind":${this.userObj.userJoind}`,
            to: `"userJoind":${dateNow},`,
          };
          this.replaceFunc(options);
        }
      }
    }

    if (this.oldMember.channelID) {
      this.userObj.userLeft = Date.now();
      // let userData = JSON.stringify(this.userObj);
      const options = {
        files: path.join(__dirname, "./files", "usersData.json"),
        from: '"userLeft": null,',
        to: `"userLeft":${this.userObj.userLeft},`,
      };
      this.replaceFunc(options);

      const jsonDateLeave = await this.readingFile("usersData.json");

      console.log("newmemJosn", jsonDateLeave);
    }
  }
};
