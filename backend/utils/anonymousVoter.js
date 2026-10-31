import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const COOKIE_NAME = "primepoll_anon";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured");
  }
  return secret;
};

const sign = (id) =>
  createHmac("sha256", getSecret()).update(id).digest("base64url");

const getCookieValue = (req) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  return cookie ? cookie.slice(COOKIE_NAME.length + 1) : null;
};

export const getAnonymousVoterId = (req) => {
  const value = getCookieValue(req);
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;

  const id = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(id);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);

  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return null;
  }

  return id;
};

export const ensureAnonymousVoterCookie = (req, res) => {
  const existingId = getAnonymousVoterId(req);
  if (existingId) return existingId;

  const id = randomUUID();
  res.cookie(COOKIE_NAME, `${id}.${sign(id)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/api",
  });
  return id;
};

export const getIpHash = (ip) =>
  createHmac("sha256", getSecret()).update(ip || "unknown").digest("hex");
