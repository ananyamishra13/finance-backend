const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are default in Mongoose 6+, but explicit for clarity
      // useNewUrlParser: true,       // deprecated in Mongoose 7+
      // useUnifiedTopology: true,    // deprecated in Mongoose 7+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;