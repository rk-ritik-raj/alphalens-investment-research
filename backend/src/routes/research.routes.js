const express = require("express");

const router = express.Router();

const {
  researchCompany,
} = require("../controllers/research.controller");

router.post("/", researchCompany);

module.exports = router;
