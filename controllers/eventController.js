const Event = require("../models/Events");
const { filterSensitiveFields } = require("./utility functions/filterSensitiveDetails");
const { generateEventId } = require("./utility functions/generateEventId");

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
  const eventId = await generateEventId(Number(req.body.eventType));

  try {
    const newEvent = await Event.create({
      eventId: eventId,
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
    if (!events.length)
      return res.sendStatus(204);

    // Filter sensitive fields from authors
    const populatedEvents = events.map((event) => {
      event.author = filterSensitiveFields(event.author, sensitiveFields);

      if(!event.author) return res.sendStatus(400);
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

//update a specified event based on event id
// const updateEvent = async (req, res) => {
//   if (!req?.params?.id) {
//     return res.status(400).json({ message: "ID parameter is required." });
//   }

//   const event = await Event.findOne({ _id: req.params.id }).exec();
//   if (!event) {
//     return res
//       .status(204)
//       .json({ message: `No employee matches ID ${req.params.id}.` });
//   }
//   try {
//     const {
//       eventName,
//       description,
//       eventTarget,
//       eventType,
//       proposal,
//       mid,
//       final,
//       year,
//     } = req.body;

//     if (eventName) event.eventName = eventName;
//     if (description) event.description = description;
//     if (eventTarget) event.eventTarget = eventTarget;
//     if (eventType) event.eventType = eventType;
//     if (proposal) event.proposal = proposal;
//     if (mid) event.mid = mid;
//     if (final) event.final = final;
//     if (year) event.year = year;
//     const result = await event.save();
//     return res.status(200).json({
//       data: result,
//     });
//   } catch (err) {
//     console.error(`"error-message":${err.message}`);
//     return res.sendStatus(400);
//   }
// };
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
    "year"
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
    const event = await Event.findById(req.params.id).populate("author").lean();

    // Check if event exists
    if (!event) {
      return res
        .status(204)
        .json({ message: `No event matches ID ${req.params.id}.` });
    }

    // Filter sensitive fields from the author
    event.author = filterSensitiveFields(event.author, sensitiveFields);

    // Send response
    return res.status(200).json({ data: event });
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
