
const express = require("express");
const router = express.Router();

const {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
} = require("../controllers/memberController");

router.get("/", getMembers);
router.get("/:id", getMemberById);
router.post("/", createMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

module.exports = router;
