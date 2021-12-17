import Assignment from "../assignment/assignment.model.js";
import Course from "../course/course.model.js";
import Grade from "./grade.model.js";

export default {
    studentGetGrades: async (req, res) => {
        const courseId = req.params.courseId;
        const studentId = req.user.studentID;

        Assignment.find({
            course: courseId,
        }, "id")
        .exec(async (e, assignments) => {
            if (e) {
                return res.status(500).json({ message: e });
            }
            let result = await Grade.find({
                assignment: { $in: assignments },
                studentId: studentId,
                finalized: true
            });
            return res.status(200).json(result);
        });
    },

    getGrades: async (req, res) => {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId, "gradeBoard");

        Assignment.find({
            course: courseId,
        }, "id")
        .exec(async (e, assignments) => {
            if (e) {
                return res.status(500).json({ message: e });
            }
            let result = await Grade.find({
                assignment: { $in: assignments },
                studentId: { $in: course.gradeBoard.map(el => el.studentId) }
            });
            return res.status(200).json(result);
        });
    },

    editGrade: async (req, res) => {
        const { assignment, studentId, point, finalized } = req.body.data;
        
        Grade.updateOne(
            { assignment: assignment, studentId: studentId },
            { point: point, finalized: finalized},
            { upsert: true },
            function (err, doc) {
                if (err) return res.send(500, {error: err});
                res.status(200).json({ message: "UPDATE_SUCCESSFUL" });
            }
        );
    },

    finalizeGrade: async (req, res) => {
        const { assignment, studentId } = req.body.data;

        Grade.updateOne(
            { assignment: assignment, studentId: studentId},
            { finalized: true},
            function (err, doc) {
                if (err) return res.send(500, {error: err});
                if (!doc) return res.send(500, {error: 'INVALID_INPUT'});
                res.status(200).json({ message: "UPDATE_SUCCESSFUL" });
            }
        );
    },

    finalizeAssignment: async (req, res) => {
        Grade.updateMany(
            { assignment: req.body.assignmentId },
            { finalized: true},
            function (err, doc) {
                if (err) return res.send(500, {error: err});
                res.status(200).json({ message: "UPDATE_SUCCESSFUL" });
            }
        );
    },
};