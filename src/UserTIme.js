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

  checkDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - left;
      return diff;
    } else {
      const diff = joind - left;
      const addedDiffTime = diff + diff;
      return addedDiffTime;
    }
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

  isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    console.log(obj);
    return true;
  }

  readingFileSync(fileName) {
    const fileDate = fs.readFileSync(path.join(__dirname, "./files", fileName));
    if (this.isEmpty(fileDate)) {
      console.log(fileDate);
      return null;
    }
    return JSON.parse(fileDate);
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
    try {
      let key = this.keyGen();

      const jsonDate = await this.readingFileSync("usersData.json");

      const jsonUserJoinedData = jsonDate.userData.userJoind;
      const jsonUserLeftData = jsonDate.userData.userLeft;
      const jsonUserDiffData = jsonDate.userData.userTimeDiff;

      if (this.newMember.channelID) {
        console.log(jsonDate);

        this.userObj.userJoind = Date.now();
        const dateNow = Date.now();

        if (this.isEmpty(jsonDate)) {
          console.log("empty");
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
          if (jsonDate.userData.useriD !== this.user.id) {
            console.log("inny user");
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
          }
        } else {
          console.log(
            "UserTime -> time -> jsonUserJoinedData",
            jsonUserJoinedData
          );

          if (
            this.name === jsonDate.userData.name &&
            jsonDate.userData.useriD === this.user.id
          ) {
            const options = {
              files: path.join(__dirname, "./files", "usersData.json"),
              from: `"userJoind": ${
                jsonUserJoinedData ? jsonUserJoinedData : null
              },`,
              to: `"userJoind": ${dateNow},`,
            };
            this.replaceFunc(options);
          }
        }
      }

      if (this.oldMember.channelID) {
        this.userObj.userLeft = Date.now();

        const options = {
          files: path.join(__dirname, "./files", "usersData.json"),
          from: `"userLeft": ${jsonUserLeftData ? jsonUserLeftData : null},`,
          to: `"userLeft": ${this.userObj.userLeft},`,
        };
        this.replaceFunc(options);

        const diff = this.checkDiff(
          jsonUserJoinedData,
          jsonUserLeftData,
          jsonUserDiffData
        );

        if (diff) {
          const options = {
            files: path.join(__dirname, "./files", "usersData.json"),
            from: `"userTimeDiff": ${
              jsonUserDiffData ? jsonUserDiffData : null
            }`,
            to: `"userTimeDiff": ${diff}`,
          };
          this.replaceFunc(options);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};
