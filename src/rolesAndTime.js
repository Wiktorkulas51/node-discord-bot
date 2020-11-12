function rolesAndTimeData() {
  const timeObj = {
    hour: 3600000,
    hour5: 18000000,
    hour10: 36000000,
    day: 86400000,
    day3: 259200000,
    day7: 604800000,
    day14: 1209600000,
    month: 2629800000,
    month3: 7889400000,
    month6: 15778800000,
  };
  const roleArr = [
    "776098643014582302",
    "776098666611343360",
    "776098806454419476",
    "776098824967159818",
    "776098842554269766",
    "776098859990122498",
    "776098878247534593",
    "776098896211869728",
    "776098915891544104",
    "776098937923960842",
  ];

  // const roleAndTimeData = {

  // }
  return {
    timeObj: timeObj,
    roleArr: roleArr,
  };
}
module.exports = {
  rolesAndTimeData,
};
