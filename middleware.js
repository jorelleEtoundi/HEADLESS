const jwt = require("jsonwebtoken");

const ensureRole = (role) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send("Authorization header missing");
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, "your_jwt_secret", (err, decoded) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }

      if (decoded.role !== role) {
        return res.status(403).send("Forbidden");
      }

      req.user = decoded;
      next();
    });
  };
};

const authenticate = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) return res.status(401).send("Access denied");
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

module.exports = { ensureRole, authenticate };
