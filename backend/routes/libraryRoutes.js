const express = require("express");
const router = express.Router();
const { 
  addBook, 
  smartSearch, 
  issueBook, 
  getTransactions, 
  returnBook 
} = require("../controllers/libraryController");

// These will now respond to /api/library/add, /api/library/transactions, etc.
router.post("/add", addBook); 
router.get("/search", smartSearch);
router.post("/issue", issueBook);
router.get("/transactions", getTransactions); 
router.put("/return/:transactionId", returnBook); 

module.exports = router;