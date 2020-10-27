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
      const diff = joind - left;
      const addedDiffTime = Math.abs(diff) + diffTime;
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

      const jsonDate = await utiles.readingFileSync("usersData.json");

      const jsonUserJoinedData = jsonDate.userData.userJoind;

      // const jsonDataArray = jsonDate.forEach((el) => console.log(el));
      // console.log(jsonDataArray);

      if (this.newMember.channelID) {
        console.log(jsonDate);

        this.userObj.userJoind = new Date().getTime();
        const dateNow = new Date().getTime();

        // NEXT USER
        // const elementID = jsonDate.forEach((el) => {
        //   if (el.userData.useriD !== this.user.id) {
        //   }
        // });

        // if (elementID) {
        //   console.log("inny user");
        //   key = this.keyGen();
        //   let userData = JSON.stringify(this.userObj, null, 4);
        //   if (!this.checkDir("usersData.json")) {
        //     fs.appendFile(
        //       path.join(__dirname, "./files", "usersData.json"),
        //       `{ "key":"${key}", "userData":${userData}}`,
        //       (err) => {
        //         if (err) throw err;
        //       }
        //     );
        //   }
        // }

        if (utiles.isEmpty(jsonDate)) {
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
        this.userObj.userLeft = new Date().getTime();
        const jsonUserLeftData = jsonDate.userData.userLeft;
        const jsonUserDiffData = jsonDate.userData.userTimeDiff;
        console.log("userleft", jsonUserLeftData);

        const options = {
          files: path.join(__dirname, "./files", "usersData.json"),
          from: `"userLeft": ${jsonUserLeftData ? jsonUserLeftData : null},`,
          to: `"userLeft": ${this.userObj.userLeft},`,
        };
        await this.replaceFunc(options);

        // const time = utiles.timeCounter(
        //   await jsonUserJoinedData,
        //   this.userObj.userLeft
        // );
        // console.log("format", utiles.format(time));

        const diff = this.updateDiff(
          jsonDate.userData.userJoind,
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
    } catch (error) {
      console.log(error);
    }
  }
};
