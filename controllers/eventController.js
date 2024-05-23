const Event = require("../models/Events");
const Student = require("../models/Students");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const { generateEventId } = require("./utility functions/generateEventId");
const {
  getBatchYearFromEventType,
} = require("./utility functions/getBatchYearFromEventType");

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
  const eventCode = await generateEventId(Number(req.body.eventType));

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
    console.log("after creation");
    console.log(newEvent);
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

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  updateEvent,
};
