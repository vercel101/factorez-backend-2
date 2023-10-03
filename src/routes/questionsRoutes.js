const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const cancelledReasonController = require("../controllers/cancelReasonController");

const { Authentication } = require("../middlewares/auth");

router.post("/addquestion", Authentication, questionController.addQuestions);
router.get("/getallquestion", Authentication, questionController.getAllQuestion);
router.get("/getallquestionbyuser", Authentication, questionController.getAllQuestionByModel);
router.delete("/delete-question-byid/:questionid", Authentication, questionController.deleteQuestionById);

module.exports = router;
