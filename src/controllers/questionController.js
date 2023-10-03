const questionModel = require("../models/questionModel");
const { isValid } = require("../utils/utils");

// ADD QUESTIONS
const addQuestions = async (req, res) => {
    try {
        let { questionFor, question } = req.body;

        if (!isValid(questionFor)) {
            return res.status(400).send({ status: false, message: "QuestionFor field is required" });
        }

        if (!isValid(question)) {
            return res.status(400).send({ status: false, message: "Question is required" });
        }

        let questionObj = {
            questionFor,
            question,
        };

        await questionModel.create(questionObj);
        let allQuestion = await questionModel.find({ questionFor: questionFor, isDeleted: false });

        return res.status(201).send({
            status: true,
            message: "Question added successfully",
            data: allQuestion,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllQuestionByModel = async (req, res) => {
    try {
        let model = req.userModel;
        let questions = await questionModel.find({ questionFor: model, isDeleted: false });
        return res.status(200).send({
            status: true,
            message: "Question fetched successfully",
            data: questions,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllQuestion = async (req, res) => {
    try {
        let questions = await questionModel.find({ isDeleted: false });
        let data = {
            admin: [],
            vendor: [],
            customer: [],
        };
        for (let x of questions) {
            if (x.questionFor === "ADMIN") {
                data.admin.push(x);
            }
            if (x.questionFor === "VENDOR") {
                data.vendor.push(x);
            }
            if (x.questionFor === "CUSTOMER") {
                data.customer.push(x);
            }
        }
        return res.status(200).send({
            status: true,
            message: "Question fetched successfully",
            data: data,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const deleteQuestionById = async (req, res) => {
    try {
        let questionId = req.params.questionid;
        let question = await questionModel.findById(questionId);
        if (question) {
            question.isDeleted = true;
            await question.save();
            let questions = await questionModel.find({ questionFor: question.questionFor, isDeleted: false });
            return res.status(200).send({
                status: true,
                message: "Question fetched successfully",
                data: questions,
            });
        } else {
            return res.status(400).send({ status: false, message: "question id is not valid" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { addQuestions, getAllQuestionByModel, getAllQuestion, deleteQuestionById };
