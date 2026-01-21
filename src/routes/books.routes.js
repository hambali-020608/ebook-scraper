const express = require("express");
const router = express.Router();
const {getAllCategory, getSubCategory, getDetailsBook, getBookByCategory, searchBook} = require("../controllers/books.controller");

router.get("/v1/all-category", getAllCategory);
router.get("/v1/subcategory", getSubCategory);
router.get("/v1/get-books", getBookByCategory);
router.get("/v1/detail", getDetailsBook);
router.get("/v1/search", searchBook);

module.exports = router;
