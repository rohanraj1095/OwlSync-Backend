// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Users",
//       required: true,
//     },
//     txnId: { type: Number, required: true },
//     amount: { type: Number, required: true },
//     type: { type: String, enum: ["credited", "debited"], required: true },
//     date: { type: Date, required: true },
//     bank: { type: String },
//     raw: { type: String },
//   },
//   { timestamps: true, strict: true },
// );

// transactionSchema.index({ userId: 1, date: -1 });
// transactionSchema.index({ userId: 1, txnId: 1 }, { unique: true });

// const Transaction = mongoose.model("transactions", transactionSchema);
// export default Transaction;

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Matches mongoose.model("User", userSchema)
      required: true,
    },
    txnId: { type: Number, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credited", "debited"], required: true },
    date: { type: Date, required: true },
    bank: { type: String },
    raw: { type: String },
  },
  { timestamps: true, strict: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, txnId: 1 }, { unique: true });

const Transaction = mongoose.model("transactions", transactionSchema);
export default Transaction;
