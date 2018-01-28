const express = require('express');
const mongoose = require('mongoose');
const {isRoot} = require('middlewares/userGroup');
const Classroom = mongoose.model('Classroom');
const isObjectId = mongoose.Types.ObjectId.isValid;

const router = express.Router();

router.get('/classrooms', getClassroom);
router.post('/classrooms', insertClassroom);

router.get('/classrooms/:classId', getOneClassroom);
router.put('/classrooms/:classId', updateClassroom);
router.delete('/classrooms/:classId', deleteClassroom);

router.post('/classrooms/:classId/students', postAddOneStudent);
router.delete('/classrooms/:classId/students/:studentId', deleteOneStudent);

module.exports = {
  addRouter(app) {
    app.use('/api/v1', isRoot, router);
  },
};
/**
 *Implementation
 */

async function getClassroom(req, res, next) {
  try {
    const {coach} = req.query;
    const dbQuery = {};
    if (coach) {
      dbQuery.coach = mongoose.Types.ObjectId(coach);
    }
    const classrooms = await Classroom.find(dbQuery)
      .populate('coach students', 'username')
      .exec();
    return res.status(200).json({
      status: 200,
      data: classrooms,
    });
  } catch (err) {
    return next(err);
  }
}

async function getOneClassroom(req, res, next) {
  try {
    const {classId} = req.params;
    const classroom = await Classroom
      .findOne({_id: classId})
      .populate('coach students', 'username')
      .exec();
    return res.status(200).json({
      status: 200,
      data: classroom,
    });
  } catch (err) {
    return next(err);
  }
}

async function postAddOneStudent(req, res, next) {
  try{
    const {classId} = req.params;
    const {student} = req.body;

    if (isObjectId(student) == false) {
      const e = new Error(`Student: ${student} must be an objectId`);
      e.status = 400;
      throw e;
    }

    const classroom = await Classroom.findOneAndUpdate({_id: classId}, {
      $addToSet: {
        students: student,
      },
    });

    if (!classroom) {
      const e = new Error(`No such classroom: ${classId}`);
      e.status = 400;
      throw e;
    }

    return res.status(201).json({
      status: 201,
      data: classroom,
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteOneStudent(req, res, next) {
  try {
    const {classId, studentId} = req.params;

    const classroom = await Classroom.findOneAndUpdate({_id: classId}, {
      $pull: {
        students: studentId,
      },
    });

    if (!classroom) {
      const e = new Error('No such classroom');
      e.status = 400;
      throw e;
    }

    return res.status(200).json({
      status: 200,
    });
  } catch (err) {
    return next(err);
  }
}

async function insertClassroom(req, res, next) {
  try {
    const {name, students} = req.body;
    if (!name || !students) {
      const err = new Error('Post body must have name and students field');
      err.status = 400;
      throw err;
    }
    if (!students.every(isObjectId)) {
      const err = new Error('Students must be an array of ObjectId');
      err.status = 400;
      throw err;
    }
    if ((new Set(students)).size !== students.length) {
      const err = new Error('Students array must contain unique Ids');
      err.status = 400;
      throw err;
    }

    const classroom = new Classroom({
      name,
      coach: req.session.userId,
      students,
    });
    await classroom.save();
    return res.status(201).json({
      status: 201,
      data: classroom,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateClassroom(req, res, next) {
  try {
    const {name, students} = req.body;
    const {classId} = req.params;
    if (!name || !students) {
      throw new Error('Post body must have name and students field');
    }
    const classroom = await Classroom.findOneAndUpdate({_id: classId}, {
      name,
      coach: req.session.userId,
      students,
    });
    return res.status(201).json({
      status: 201,
      data: classroom,
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteClassroom(req, res, next) {
  try {
    const {classId} = req.params;
    await Classroom.findOneAndRemove({_id: classId}).exec();
    return res.status(200).json({
      status: 200,
    });
  } catch (err) {
    next(err);
  }
}