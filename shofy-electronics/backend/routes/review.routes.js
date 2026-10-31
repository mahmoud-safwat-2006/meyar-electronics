const express = require("express");
const router = express.Router();
const { addReview, deleteReviews } = require("../controller/review.controller");
const { isAuth, isAdmin } = require("../config/auth");

// add a review (Requires authenticated user)
router.post("/add", isAuth, addReview);

// delete all reviews of a product (Admin only)
router.delete("/delete/:id", isAuth, isAdmin, deleteReviews);

module.exports = router;