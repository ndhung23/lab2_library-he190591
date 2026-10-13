const express = require("express");
const router = express.Router();

const {
  getLoans,
  getLoanById,
  createLoan,
  getLoansByMemberId,
  returnLoan
} = require("../controllers/loanController");

router.get("/", getLoans);
router.get("/member/:memberId", getLoansByMemberId);
router.get("/:id", getLoanById);
router.post("/", createLoan);
router.put("/:id/return", returnLoan);

module.exports = router;