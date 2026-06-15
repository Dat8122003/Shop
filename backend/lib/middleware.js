const jwt = require("jsonwebtoken");
const User = require("../model/User");

const getSecret = () => process.env.JWT_SECRET || "dev_local_secret";

const signToken = (user) =>
  jwt.sign(
    { _id: user._id || user.id, name: user.name, email: user.email, role: user.role },
    getSecret(),
  );

// Boc async route de tu bat loi, tranh try/catch lap khap noi
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("API error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Loi server" });
  });

// Helper: verify token + load full Mongoose document (de co the .save()/.toObject())
const verifyAndLoadUser = async (token) => {
  const payload = jwt.verify(token, getSecret());
  const user = await User.findById(payload._id);
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
};

// Bat buoc dang nhap
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Thieu token" });
  try {
    req.user = await verifyAndLoadUser(header.split(" ")[1]);
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Token khong hop le" });
    return res.status(401).json({ error: "Token khong hop le" });
  }
};

// Khong bat buoc: gan req.user neu token hop le, nguoc lai bo qua
const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  try {
    req.user = await verifyAndLoadUser(header.split(" ")[1]);
  } catch {}
  next();
};

const requireAdmin = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ error: "Chi admin moi co quyen" });

module.exports = { signToken, asyncHandler, requireAuth, optionalAuth, requireAdmin };