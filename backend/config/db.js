import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-polling";
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (firstErr) {
    if (firstErr.message && firstErr.message.includes("querySrv")) {
      try {
        console.log("Retrying with Google DNS fallback...");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB connected with DNS fallback: ${conn.connection.host}`);
        return;
      } catch (retryErr) {
        console.error("❌ MongoDB connection error:", retryErr.message);
        process.exit(1);
      }
    }
    console.error("❌ MongoDB connection error:", firstErr.message);
    process.exit(1);
  }
};

export default connectDB;
