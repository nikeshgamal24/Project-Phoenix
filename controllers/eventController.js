const Event = require("../models/Events");
const Student = require("../models/Students");
const Evaluator = require("../models/Evaluators");
const roleList = require("../config/roleList");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const { generateEventId } = require("./utility functions/generateEventId");
const {
  getBatchYearFromEventType,
} = require("./utility functions/getBatchYearFromEventType");
const evaluatorTypeList = require("../config/evaluatorTypeList");

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
  const eventCode = await generateEventId({eventType:Number(req.body.eventType)});

  if(!eventCode) return res.sendStatus(400);

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
      return res
        .status(204)
        .json({ message: `No event matches ID ${req.params.id}.` });
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

    // Send response
    return res.status(200).json({
      eligibleStudentCountForEvent: studentCount,
      data: event,
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
    console.log(evaluatorTypeList[evaluatorType]);
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
    let events = await Event.find().sort({ createdAt: -1 }).populate("projects");

    //if no events
    if (!events) return res.sendStatus(204);

    // Map over each event and process its projects
    events = await Promise.all(
      events.map(async (event) => {
        // Populate team members for each project within the current event
        event.projects = await Promise.all(
          event.projects.map(async (project) => {
            await project
              .populate({
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
     const evaluators = await Evaluator.find({
      isAssociated:false
     }).sort({ createdAt: -1 }).lean();

     // Check if events are empty
     if (!evaluators.length) return res.sendStatus(204);


    return res.status(200).json({
      data: {
        events: events,
        evaluators:evaluators,
      },
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
};
