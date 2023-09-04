const jwtUtils = require("../utils/jwtUtils");
const responseMessages = require("../Responses/responseMessages");

exports.authenticateUser = (req, res, next) => {
  //console.log(req);
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json(responseMessages.error(401, "Unauthorized User "));
  }
  const decoded = jwtUtils.verifyToken(token);
  if (!decoded || decoded instanceof Error) {
    return res.status(401).json(responseMessages.error(401, "Invalid token"));
  }
  // console.log("end auth");
  req.userId = decoded.userId;
  next();
};
