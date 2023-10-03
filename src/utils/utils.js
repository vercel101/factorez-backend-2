const ObjectId = require("mongoose").Types.ObjectId;

const isValidRequestBody = (requestBody) => {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = (objectId) => {
  if (!ObjectId.isValid(objectId)) return false;
  return true;
};

const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === null) return false;
  if (typeof value === "string" && value.trim().length == 0) return false;
  return true;
};

let isValidName = function (name) {
  let nameRegex = /^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/;
  return nameRegex.test(name);
};

const isValidEmail = function (gmail) {
  let regex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,6})+$/;
  return regex.test(gmail);
};

let isValidPassword = function (password) {
  let regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
  return regexPassword.test(password);
};

const isValidMoblie = function (mobile) {
  let regex =
    /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([-]?)\d{3}([-]?)\d{4})$/;
  return regex.test(mobile);
};

const isValidGST = function (GST) {
  let regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
  return regex.test(GST);
};

const isValidPrice = function (price) {
  let regex = /^\d+(?:[.,]\d+)*$/;
  return regex.test(price);
};

const isValidImg = (img) => {
  const reg = /image\/png|image\/jpeg|image\/jpg/;
  return reg.test(img);
};

function isValidStatus(value) {
  if( ["pending", "completed", "cancled"].indexOf(value) == -1) {return false}
  else return true
};

function isValidPin(pin) {
  const regex = /^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/;
  return regex.test(pin);
}

module.exports = {
  isValidRequestBody,
  isValidObjectId,
  isValid,
  isValidName,
  isValidEmail,
  isValidImg,
  isValidPassword,
  isValidMoblie,
  isValidGST,
  isValidPrice,
  isValidStatus,
  isValidPin
};