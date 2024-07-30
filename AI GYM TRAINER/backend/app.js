const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
const PORT = 8000;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.mongo_url);
  console.log("db connected");
}

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const GymUser = mongoose.model("GymUser", UserSchema);

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new GymUser({ username, email, password });
  console.log(newUser);
  const savedUser = await newUser
    .save()
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await GymUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
