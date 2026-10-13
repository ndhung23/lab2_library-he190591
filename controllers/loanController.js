const Loan = require("../models/Loan");
const Book = require("../models/Book");
const Member = require("../models/Member");

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("member_id")
      .populate("items.book_id");

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve loans", error: error.message });
  }
};

const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("member_id")
      .populate("items.book_id");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve loan", error: error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    const { member_id, items, dueDate, borrowDate } = req.body;

    if (!member_id) {
      return res.status(400).json({ message: "member_id is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "A loan must contain at least one book item" });
    }

    if (!dueDate) {
      return res.status(400).json({ message: "dueDate is required" });
    }

    const member = await Member.findById(member_id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!member.isActive) {
      return res.status(400).json({ message: "Only active members are allowed to borrow books" });
    }

    const bookQuantityMap = {};
    for (const item of items) {
      if (!item.book_id) {
        return res.status(400).json({ message: "Each item must have a valid book_id" });
      }
      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      bookQuantityMap[item.book_id] = (bookQuantityMap[item.book_id] || 0) + quantity;
    }

    for (const [bookId, requestedQty] of Object.entries(bookQuantityMap)) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: `Book with ID ${bookId} not found` });
      }

      if (book.availableCopies < requestedQty) {
        return res.status(400).json({
          message: `Insufficient copies for book "${book.title}". Available: ${book.availableCopies}, requested: ${requestedQty}`
        });
      }
    }

    for (const [bookId, requestedQty] of Object.entries(bookQuantityMap)) {
      await Book.findByIdAndUpdate(bookId, {
        $inc: { availableCopies: -requestedQty }
      });
    }

    const loan = await Loan.create({
      member_id,
      items,
      dueDate,
      borrowDate: borrowDate || Date.now(),
      status: "Borrowing"
    });

    const populatedLoan = await Loan.findById(loan._id)
      .populate("member_id")
      .populate("items.book_id");

    res.status(201).json({
      message: "Loan created successfully",
      loan: populatedLoan
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create loan", error: error.message });
  }
};

const getLoansByMemberId = async (req, res) => {
  try {
    const loans = await Loan.find({ member_id: req.params.memberId })
      .populate("member_id")
      .populate("items.book_id");

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve member loans", error: error.message });
  }
};

const returnLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Borrowing record not found" });
    }

    if (loan.status === "Returned" || loan.returnDate) {
      return res.status(400).json({ message: "This borrowing record has already been returned" });
    }

    for (const item of loan.items) {
      const quantity = Number(item.quantity) || 1;
      await Book.findByIdAndUpdate(item.book_id, {
        $inc: { availableCopies: quantity }
      });
    }

    loan.returnDate = new Date();
    loan.status = "Returned";
    await loan.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate("member_id")
      .populate("items.book_id");

    res.status(200).json({
      message: "Book(s) returned successfully",
      loan: populatedLoan
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to return loan", error: error.message });
  }
};

module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  getLoansByMemberId,
  returnLoan
};