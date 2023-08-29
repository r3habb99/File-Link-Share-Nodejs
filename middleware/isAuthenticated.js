const jwtUtils = require("../utils/jwtUtils");

exports.isAuthenticated = (req, res, next) => {
  // Get the authorization header from the request
  const authHeader = req.headers.authorization;

  // If the header is not present, return an error message
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1];

  // Verify the token using jwtUtils
  const decoded = jwtUtils.verifyToken(token);

  // If the token is invalid, return an error message
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // If the token is valid, attach the user email to the request object and proceed to the next middleware or route handler
  req.userEmail = decoded.userId;
  next();
};
