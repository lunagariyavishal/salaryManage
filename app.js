// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();

// --- Middlewares ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); // parse form data
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "salary-pass-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// --- Database ---
const MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/salary_system";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Simple auth middleware ---
function requireLogin(req, res, next) {
  if (!req.session.loggedIn) return res.redirect("/login");
  next();
}

// Make a small helper available in views (optional)
app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.loggedIn;
  next();
});

// --- Routes: login / logout ---
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const password = req.body.password || "";
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    return res.redirect("/months");
  }
  res.render("login", { error: "Wrong password" });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// --- Application routes (protected) ---
app.use("/settings", requireLogin, require("./routes/settings"));
app.use("/employees", requireLogin, require("./routes/employee"));
app.use("/months", requireLogin, require("./routes/month"));
app.use("/salary", requireLogin, require("./routes/salary"));

// default route
app.get("/", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  res.redirect("/months");
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Not found");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error");
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
