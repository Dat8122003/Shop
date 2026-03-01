const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) return res.json({ error: "Lỗi không thấy Token" });
  const token = authHeaders.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "key");
    req.user = decoded;
    next();
  } catch (err) {
    res.json({ error: "Token không hợp lệ" });
  }
};
