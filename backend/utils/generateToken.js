import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "fallback_default_jwt_secret_online_polling_key_2025";
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" }
  );
};

export default generateToken;
