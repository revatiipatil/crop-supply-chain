const dotenv = require("dotenv");
const bs58 = require("bs58");

dotenv.config();

console.log("Raw SECRET_KEY from .env:", process.env.SECRET_KEY);

try {
    const secretKey = bs58.decode(process.env.SECRET_KEY);
    console.log("Decoded Secret Key:", secretKey);
} catch (error) {
    console.error("Error decoding SECRET_KEY:", error.message);
}
