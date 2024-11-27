// modules/checkBody.js
module.exports.checkBody = function (body, fields) {
  for (let field of fields) {
    if (!body[field] || body[field].trim() === "") {
      return false;
    }
  }
  return true;
};

