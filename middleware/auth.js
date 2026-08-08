// import jwt from "jsonwebtoken";

// export const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid or expired token" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

// export const authorizeRole =
//   (...allowedRoles) =>
//   (req, res, next) => {
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: "Access Denied" });
//     }
//     next();
//   };

import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests via JWT Access Token
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header and Bearer scheme
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // 2. Secret key matching user.model.js & auth.service.js
  const secretKey = process.env.ACCESS_TOKEN_SECRET || "default_access_secret";

  // 3. Verify JWT
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // 4. Attach user payload and bridge both 'id' and '_id' so queries work across all controllers
    req.user = {
      ...decoded,
      _id: decoded.id || decoded._id,
      id: decoded.id || decoded._id,
    };

    next();
  });
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 */
export const authorizeRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access Denied: Insufficient permissions",
        });
    }
    next();
  };
