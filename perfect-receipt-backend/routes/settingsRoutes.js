const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/")
    .get(protect, getSettings)
    .put(protect, updateSettings);

module.exports = router;