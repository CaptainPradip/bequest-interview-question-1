import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "secret key";

// Verify user token
const verifyUser = (req: any, res: any, next: any) => {
  const bearerToken = req.headers.authorization;
  const token = bearerToken?.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY || "");
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
// Hash data
const hashData = (data: any) => {
  const hash = crypto.createHash("sha256").update(data).digest("base64");
  return hash;
};

// Create private and public key
const createPrivateAndPublicKey = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  fs.writeFileSync("private.pem", privateKey);
  fs.writeFileSync("public.pem", publicKey);
  return { privateKey, publicKey };
};

// Read private and public key
const readPrivateAndPublicKey = () => {
  if (!fs.existsSync("private.pem") || !fs.existsSync("public.pem")) {
    createPrivateAndPublicKey();
  }
  const privateKey = fs.readFileSync("private.pem", "utf8");
  const publicKey = fs.readFileSync("public.pem", "utf8");
  return { privateKey, publicKey };
};

// Encrypt and decrypt data
const encryptData = (data: any) => {
  const { privateKey, publicKey } = readPrivateAndPublicKey();
  const dataHash = hashData(data);
  const signature = crypto.sign("sha256", Buffer.from(dataHash), privateKey);
  const maxDataLength = 214; // For a 2048-bit key size

  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += maxDataLength) {
    chunks.push(data.slice(i, i + maxDataLength));
  }
  const encryptedChunks = chunks.map((chunk) => {
    return crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(chunk)
    );
  });

  return {
    encryptedData: Buffer.concat(encryptedChunks).toString("base64"),
    hash: dataHash,
  };
};

// Decrypt data
const decryptData = (encryptedData: any) => {
  const { privateKey, publicKey } = readPrivateAndPublicKey();
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(encryptedData, "base64")
  );

  const data = decryptedData.toString();
  const hash = hashData(data);
  const signature = crypto.sign("sha256", Buffer.from(hash), privateKey);
  const isVerified = crypto.verify(
    "sha256",
    Buffer.from(hash),
    publicKey,
    signature
  );
  if (!isVerified) {
    throw new Error("Invalid signature");
  }
  return { data, hash };
};

export {
  verifyUser,
  hashData,
  SECRET_KEY,
  createPrivateAndPublicKey,
  readPrivateAndPublicKey,
  encryptData,
  decryptData,
};
