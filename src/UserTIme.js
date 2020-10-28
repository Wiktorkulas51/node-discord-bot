const fs = require("fs");
const path = require("path");
const randkey = require("random-keygen");
const replace = require("replace-in-file");
const utiles = require("./utiles");

module.exports = class UserTime {
  constructor(oldMember, newMember) {
    this.oldMember = oldMember;
    this.newMember = newMember;
    this.user = this.newMember.member.user;
    this.name = this.newMember.member.user.username;
    this.userTimeJoined = null;
    this.diff = null;
    this.userTimeLeft = null;
    this.userDiff = null;
    this.userObj = {
      name: this.name,
      useriD: this.user.id,
      userJoind: this.userTimeJoined,
      userLeft: this.userTimeLeft,
      userTimeDiff: this.diff,
    };
  }

  checkUser(file) {
    console.log(file);
  }

  async updateDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - (await left);
      console.log("diff", diff, "left", left);
      return Math.abs(diff);
    } else {
      console.log(left);
      const diff = joind - left;
      console.log(diff);
      const addedDiffTime = Math.abs(diff) + diffTime;
      console.log(addedDiffTime);
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

  checkDir(dirName) {
    const status = () => {
      fs.accessSync(
        path.join(
          __dirname,
          dirName === "usersData.json" ? "./files/usersData.json" : dirName
        ),
        fs.constants.F_OK
      );
    };
    if (status) {
      return "EEXIST";
    } else {
      fs.mkdirSync(
        path.join(
          __dirname,
          dirName === "usersData.json" ? "./files/usersData.json" : dirName,
          (err) => (err ? console.log(err) : "EEXIST")
        )
      );
    }
  }

  async time() {
    try {
      let key = this.keyGen();

      const jsonData = await utiles.readingFileSync("usersData.json");
      this.userObj.userJoind = new Date().getTime();

      if (utiles.isEmpty(jsonData)) {
        console.log("empty");
        let userData = JSON.stringify(this.userObj, null, 4);
        if (this.checkDir("usersData.json")) {
          fs.appendFileSync(
            path.join(__dirname, "./files", "usersData.json"),
            `[{"key":"${key}", "userData":${userData}}]`
          );
        }
      } else {
        jsonData.forEach(async (el) => {
          const jsonUserJoinedData = el.userData.userJoind;

          if (this.newMember.channelID) {
            this.userObj.userJoind = new Date().getTime();

            // NEXT USER

            const elementID =
              (await el.userData.useriD) !== this.user.id &&
              this.name !== el.userData.name;

            if (elementID) {
              console.log("inny user");
              key = this.keyGen();
              let userData = JSON.stringify(this.userObj, null, 4);
              if (this.checkDir("usersData.json")) {
                fs.appendFileSync(
                  path.join(__dirname, "./files", "usersData.json"),
                  `,{"key":"${key}", "userData":${userData}}`
                );
              }
            }

            console.log(
              "UserTime -> time -> jsonUserJoinedData",
              jsonUserJoinedData
            );

            if (
              this.name === el.userData.name &&
              el.userData.useriD === this.user.id
            ) {
              console.log("name");
              const options = {
                files: path.join(__dirname, "./files", "usersData.json"),
                from: `"userJoind": ${
                  jsonUserJoinedData ? jsonUserJoinedData : null
                },`,
                to: `"userJoind": ${this.userObj.userJoind},`,
              };
              this.replaceFunc(options);
            }
          }

          if (this.oldMember.channelID) {
            this.userObj.userLeft = new Date().getTime();
            const jsonUserLeftData = el.userData.userLeft;
            const jsonUserDiffData = el.userData.userTimeDiff;

            if (
              this.name === el.userData.name &&
              el.userData.useriD === this.user.id
            ) {
              const options = {
                files: path.join(__dirname, "./files", "usersData.json"),
                from: `"userLeft": ${
                  jsonUserLeftData ? jsonUserLeftData : null
                },`,
                to: `"userLeft": ${this.userObj.userLeft},`,
              };

              console.log(options);
              this.replaceFunc(options);
            }

            const diff = this.updateDiff(
              el.userData.userJoind,
              this.userObj.userLeft,
              jsonUserDiffData
            );

            if (diff) {
              const options = {
                files: path.join(__dirname, "./files", "usersData.json"),
                from: `"userTimeDiff": ${
                  jsonUserDiffData ? jsonUserDiffData : null
                }`,
                to: `"userTimeDiff": ${await diff}`,
              };
              this.replaceFunc(options);
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
};
