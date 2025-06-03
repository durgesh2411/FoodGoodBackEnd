const express = require("express");
const router = express.Router();
const { getAIReply } = require("../Controllers/genAI.controller");

router.post("/chat", getAIReply);

module.exports = router;