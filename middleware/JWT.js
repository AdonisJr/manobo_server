const jwt = require("jsonwebtoken");


exports.getAccessToken = async (credentials) => {
  const user = credentials;
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  return accessToken;
};

exports.verifyAccessToken = async (req, res, next) => {
  let authHeader = null;
  if (req.headers.authorization) {
    authHeader = req.headers.authorization;
  } else {
    authHeader = req.query.getAccessToken;
  }

  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({
      status: 403,
      message:
        "Unauthorized, Authorization token not found, please login first.",
    });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({
            status: 403,
            message: 'Forbidden, Invalid Access Token, Please login first'
        })
        req.user = user.id
        next();
    })
};
