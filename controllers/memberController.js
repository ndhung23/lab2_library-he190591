
const mongoose = require("mongoose");
const Member = require("../models/Member");

const getMembers = async (req, res) => {
    try {
        const members = await Member.find();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid member ID"
            });
        }

        const member = await Member.findById(id);

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMember = async (req, res) => {
    try {
        const member = await Member.create(req.body);
        res.status(201).json({
            message: "Member created successfully",
            member
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({ message: error.message });
    }
};

const updateMember = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid member ID"
            });
        }

        const member = await Member.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.status(200).json({
            message: "Member updated successfully",
            member
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({ message: error.message });
    }
};

const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid member ID"
            });
        }

        const member = await Member.findByIdAndDelete(id);

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.status(200).json({
            message: "Member deleted successfully",
            member
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
};
