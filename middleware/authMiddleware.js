const jwtUtils = require("../utils/jwtUtils");

exports.authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwtUtils.verifyToken(token);
  if (!decoded || decoded instanceof Error) {
    return res.status(401).json({ message: "Invalid token" });
  }
  req.userId = decoded.userId;
  next();
};
