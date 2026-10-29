import jwt from "jsonwebtoken";

const getSecret = () => {
  return process.env.JWT_SECRET || "fallback_default_jwt_secret_online_polling_key_2025";
};

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, getSecret());
    req.user = decoded; // id + role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Optional auth: agar token present hai toh req.user set karega, warna bina block kiye continue karega
export const optionalAuth = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getSecret());
      req.user = decoded;
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

// admin only route
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
