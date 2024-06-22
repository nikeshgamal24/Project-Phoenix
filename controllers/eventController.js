const Event = require("../models/Event");
const Student = require("../models/Student");
const Evaluator = require("../models/Evaluator");
const Defense = require("../models/Defense");
const Room = require("../models/Room");
const Project = require("../models/Project");
const roleList = require("../config/roleList");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const { generateEventId } = require("./utility functions/generateEventId");
const {
  getBatchYearFromEventType,
} = require("./utility functions/getBatchYearFromEventType");
const evaluatorTypeList = require("../config/evaluatorTypeList");
const eventStatusList = require("../config/eventStatusList");
const {
  generateAccesscode,
} = require("./utility functions/generateAccessCode");
const bcrypt = require("bcrypt");
const { sendMailToUser } = require("./utility functions/sendMailToUser");
const {
  initializeEventTypeBasedOnBatch,
} = require("./utility functions/initializeEventTypeBasedOnBatch");

//sensitive fields that will be undefined by the funciton filterSensitiveFields
const sensitiveFields = ["role", "password", "refreshToken"];

// Create a new event
const createNewEvent = async (req, res) => {
  if (
    !req?.body?.eventName ||
    !req?.body?.eventTarget ||
    !req?.body?.eventType
  ) {
    return res.status(400).json({ message: "Required Fields are empty" });
  }
  const eventCode = await generateEventId({
    eventType: Number(req.body.eventType),
  });

  if (!eventCode) return res.sendStatus(400);

  try {
    const newEvent = await Event.create({
      eventCode: eventCode,
      eventName: req.body.eventName,
      description: req.body.description,
      eventTarget: req.body.eventTarget,
      eventType: req.body.eventType,
      proposal: {
        defense: req.body.proposal.defense,
        defenseDate: req.body.proposal.defenseDate,
        reportDeadline: req.body.proposal.reportDeadline,
      },
      mid: {
        defense: req.body.mid.defense,
        defenseDate: req.body.mid.defenseDate,
        reportDeadline: req.body.mid.reportDeadline,
      },
      final: {
        defense: req.body.final.defense,
        defenseDate: req.body.final.defenseDate,
        reportDeadline: req.body.final.reportDeadline,
      },
      year: req.body.year,
      author: req.userId,
    });
    // // // Populate the author field
    await newEvent.populate("author");

    const filteredDetails = filterSensitiveFields(
      newEvent.author.toObject(),
      sensitiveFields
    );

    return res.status(201).json({
      event: { ...newEvent.toObject(), author: filteredDetails },
      // newEvent: newEvent,
    });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(400);
  }
};

// get all created events
const getAllEvents = async (req, res) => {
  try {
    // Find all events and populate the author field
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .select()
      .populate("author")
      .populate("projects")
      .lean();

    // Check if events are empty
    if (!events.length) return res.sendStatus(204);

    // Filter sensitive fields from authors
    const populatedEvents = events.map((event) => {
      event.author = filterSensitiveFields(event.author, sensitiveFields);

      if (!event.author) return res.sendStatus(400);
      return event;
    });

    // Send response
    res.status(200).json({
      results: populatedEvents.length,
      data: populatedEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const updateEvent = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const updateFields = {};
  const allowedFields = [
    "eventName",
    "description",
    "eventTarget",
    "eventType",
    "proposal",
    "mid",
    "final",
    "year",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field]) {
      updateFields[field] = req.body[field];
    }
  });

  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      { new: true, runValidators: true } // returns the updated document and runs validators
    ).exec();

    if (!event) {
      return res
        .status(204)
        .json({ message: `No event matches ID ${req.params.id}.` });
    }

    return res.status(200).json({
      data: event,
    });
  } catch (err) {
    console.error(`"error-message":${err.message}`);
    return res.sendStatus(400);
  }
};

//get specified event based on event id
const getEvent = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Event ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const event = await Event.findById(req.params.id)
      .populate("author")
      .populate("projects");

    // Check if event exists
    if (!event) {
      return res.sendStatus(204);
    }

    // Filter sensitive fields from the author
    event.author = filterSensitiveFields(event.author, sensitiveFields);

    /**********Populated the team members of the projects inside the event object*****************/

    // Map over each project and populate team members
    const populatedProjects = await Promise.all(
      event.projects.map(async (project) => {
        // Populate team members for the current project
        const populatedData = await project.populate({
          path: "teamMembers",
          select: "-password -OTP -refreshToken",
        });
        // Return the populated project
        return populatedData;
      })
    );

    /**********Total student count eligible for particular event****************/
    //get the batch number of the student
    const batchNumber = getBatchYearFromEventType(event.eventType);

    //1. Construct the query based on the event type
    let query;
    if (event.eventTarget === "72354") {
      // If event type is '72354', include all students regardless of program
      query = { batchNumber: batchNumber };
    } else {
      // Otherwise, include only students whose program matches the event target
      query = { program: event.eventTarget, batchNumber: batchNumber };
    }

    // 2. based on event target get the student number who can participant in that event
    const studentCount = await Student.find(query).countDocuments();

    //search for the defense that has given event id
    const defenses = await Defense.find({
      event: req.params.id,
    });

    // Send response
    return res.status(200).json({
      eligibleStudentCountForEvent: studentCount,
      data: event,
      defenses: defenses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

const createEvaluator = async (req, res) => {
  try {
    if (
      !req?.body?.fullname ||
      !req?.body?.email ||
      !req?.body?.contact ||
      !req?.body?.evaluatorType
    ) {
      return res.status(400).json({
        message: "Credentials are required",
      });
    }

    const evaluatorType = req.body.evaluatorType;
    //create a new evaluator, with credentials
    const newEvaluator = await Evaluator.create({
      fullname: req.body.fullname,
      email: req.body.email,
      contact: req.body.contact,
      role: roleList.Evaluator,
      evaluatorType: evaluatorTypeList[evaluatorType],
      designation: req.body.designation,
      institution: req.body.institution,
    });

    //if no evaluator is created
    if (!newEvaluator) return res.sendStatus(400);

    //if creation is success
    console.log(newEvaluator);

    //return if everything goes well
    return res.status(201).json({
      data: newEvaluator,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllEvaluators = async (req, res) => {
  try {
    // Find all events and populate the author field
    const evaluators = await Evaluator.find().sort({ createdAt: -1 }).lean();

    // Check if events are empty
    if (!evaluators.length) return res.sendStatus(204);

    // Send response
    res.status(200).json({
      data: evaluators,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllEventsAndEvaluators = async (req, res) => {
  try {
    //fetch all events details and populate projects
    let events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("projects");

    //if no events
    if (!events) return res.sendStatus(204);

    // Map over each event and process its projects
    events = await Promise.all(
      events.map(async (event) => {
        // Populate team members for each project within the current event
        event.projects = await Promise.all(
          event.projects.map(async (project) => {
            await project.populate({
              path: "teamMembers",
              select: "-password -OTP -refreshToken",
            });
            return project;
          })
        );
        return event;
      })
    );

    // Find all events and populate the author field
    const evaluators = await Evaluator.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      data: {
        events: events,
        evaluators: evaluators,
      },
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllDefenses = async (req, res) => {
  try {
    // Find all events and populate the author field
    const defenses = await Defense.find()
      .sort({ createdAt: -1 })
      .populate("rooms")
      .populate("event");
    // Check if events are empty
    if (!defenses.length) return res.sendStatus(204);

    // Send response
    return res.status(200).json({
      data: defenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const createNewDefense = async (req, res) => {
  try {
    if (
      !req?.body?.eventId ||
      !req?.body?.defenseTime ||
      !req?.body?.defenseDate ||
      !req?.body?.rooms.length
    )
      return res.status(400).json({
        message: "Required redentials are missing",
      });

    const defenseExists = await Defense.find({
      event: req.body.eventId,
      defenseType: req.body.defenseType,
      status: eventStatusList.active,
    });

    console.log(defenseExists);

    //does not allow to create defense of a particular event that has been already created for e.g. if project I proposal defense has already been created then if we create it again it will give 409----> conflict
    if(defenseExists.length){
      return res.status(409).json({
        message: "Defense already exists for the given event and defense type",
      });
    }

    for (const room of req.body.rooms) {
      console.log(room);
      console.log(room.evaluators.length);
      if (room.evaluators.length === 0)
        return res.status(400).json({
          message: "Evaluators redentials are missing",
        });
    }

    // //get room list
    const roomList = req.body.rooms;
    //create room collection in db and return id
    let defenseRoomIdList = roomList.map(async (room) => {
      const newRoom = await Room.create({
        room: room.room,
        evaluators: room.evaluators.map((evaluator) => {
          return evaluator._id;
        }),
        projects: room.projects.map((project) => {
          return project._id;
        }),
      });
      return newRoom._id;
    });

    //get the value of the promises and returns the array
    defenseRoomIdList = await Promise.all(defenseRoomIdList);

    //create new collection of defense in defense document
    const newDefense = await Defense.create({
      event: req.body.eventId,
      defenseType: req.body.defenseType,
      defenseTime: req.body.defenseTime,
      defenseDate: req.body.defenseDate,
      rooms: defenseRoomIdList.map((id) => {
        return id;
      }),
      status: eventStatusList.active,
    });

    if (!newDefense) return res.sendStatus(400);

    const defenseType = req.body.defenseType;
    //save to newdefense id to event
    const eventDoc = await Event.findOne({
      _id: req.body.eventId,
    });
    const eventDefenseField = eventDoc[defenseType];
    eventDefenseField.defenseId.push(newDefense._id);
    console.log(eventDefenseField.defenseId);
    // Save the updated project
    await eventDoc.save();

    //iterate through project and update the defenseId field in project model
    for (const room of req.body.rooms) {
      for (const project of room.projects) {
        try {
          const projectDoc = await Project.findOne({
            _id: project._id,
          });

          const defenseField = projectDoc[defenseType];

          // Ensure the defense field exists and is an object with a defenseId array
          if (!defenseField) {
            project[defenseType] = { defenseId: [] };
          } else if (!Array.isArray(defenseField.defenses)) {
            project[defenseType].defenses = [];
          }

          console.log(
            "Trying to project defense array section before pushing new defense id"
          );
          console.log("defenseField");
          console.log(defenseField);
          console.log(newDefense._id);
          console.log(
            "Trying to update project defense array section after pushing new defense id"
          );

          //creating a object that contains defense ID , evaluators list with their evaluation status and isGraded status and push them into defenseField's defenses

          const defenseObjDetails = {
            defense: newDefense._id,
            evaluators: room.evaluators.map((evaluator) => {
              return { evaluator: evaluator._id, hasEvaluated: false };
            }),
          };

          // Add new defense ID to the array
          defenseField.defenses.push(defenseObjDetails);
          console.log(defenseField.defenses);
          // Save the updated project
          await projectDoc.save();

          console.log("Project after saving:");
          console.log(projectDoc);
          console.log("---------after project Doc save()-------");
        } catch (error) {
          console.error(`Error updating project ${project._id}:`, error);
          return res.sendStatus(400);
        }
      }
    }

    //section for sending email
    //generate unique access code for each evaluators and save the access code to the evaluator's accessCode field
    roomList.forEach((room) => {
      room.evaluators.forEach(async (evaluator) => {
        const evaluatorDetails = await Evaluator.findOne({
          _id: evaluator._id,
        });
        const accessCode = generateAccesscode({
          evaluatorEmail: evaluatorDetails.email,
        });

        //if something went wrong while creating access code
        if (!accessCode) return res.sendStatus(400);

        //mail the acccess code to the evaluator
        const status = sendMailToUser({
          defenseType:req.body.defenseType,
          evaluatorEmail: evaluatorDetails.email,
          accessCode: accessCode,
          room: room.room,
          defenseDate: req.body.defenseDate,
          defenseTime: req.body.defenseTime,
          evaluatorName: evaluatorDetails.fullname,
        });

        //encrypt the accessCode
        const hashedAccessCode = await bcrypt.hash(accessCode, 10);

        const newDefenseObject = {
          defenseId: newDefense._id,
          accessCode: hashedAccessCode,
        };

        // //save access code along with the particular defense id--> push the both in evalueators defense field
        evaluatorDetails.defense.push(newDefenseObject);
        await evaluatorDetails.save();
      });
    });

    return res.status(201).json({
      data: newDefense,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  createEvaluator,
  getAllEvaluators,
  getAllEventsAndEvaluators,
  getAllDefenses,
  createNewDefense,
};
