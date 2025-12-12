const express = require("express");
const router = express.Router();
const multer = require("multer");
const Setting = require("../models/Setting");
const path = require("path");

// MULTER STORAGE FOR BOTH FILES
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "signature") {
      cb(null, "public/uploads/signatures");
    } else if (file.fieldname === "logo") {
      cb(null, "public/uploads/logos");
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  }
});

const upload = multer({ storage });

// ---------------- SETTINGS PAGE ----------------
router.get("/", async (req, res) => {
  const setting = await Setting.findOne();
  res.render("settings", { setting });
});

// ---------------- SAVE SETTINGS ----------------
router.post("/", upload.fields([
  { name: "signature", maxCount: 1 },
  { name: "logo", maxCount: 1 }
]), async (req, res) => {

  let setting = await Setting.findOne();
  if (!setting) setting = new Setting();

  setting.title = req.body.title;
  setting.address = req.body.address;
  setting.email = req.body.email;

  if (req.files.signature) {
    setting.signaturePath =
      "/uploads/signatures/" + req.files.signature[0].filename;
  }

  if (req.files.logo) {
    setting.logoPath =
      "/uploads/logos/" + req.files.logo[0].filename;
  }

  await setting.save();
  res.redirect("/settings");
});

module.exports = router;
