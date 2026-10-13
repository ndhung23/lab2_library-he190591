const mongoose = require('mongoose');

const loanItemSchema = new mongoose.Schema(
  {
    book_id: {
      type: String,
      ref: 'Book',
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    member_id: {
      type: String,
      ref: 'Member',
      required: true,
    },
    items: {
      type: [loanItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'A loan must contain at least one book item.',
      },
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Borrowing', 'Returned', 'Overdue'],
      default: 'Borrowing',
    },
  },
  {
    timestamps: true,
  }
);

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;