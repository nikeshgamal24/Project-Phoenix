const Event = require("../models/Events");

// Create a new event
const createNewEvent = async (req, res) => {
  if (
    !req?.body?.eventName ||
    !req?.body?.eventTarget ||
    !req?.body?.eventType
  ) {
    return res.status(400).json({ message: "Required Fields are empty" });
  }

  try {
    const newEvent = await Event.create({
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

    return res.status(201).json({
      event: newEvent,
    });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(400);
  }
};

// get all created events
const getAllEvents = async (req, res) => {
  const events = await Event.find();
  if (!events) return res.status(204).json({ message: "No employees found." });
  res.status(200).json({
    results: events.length,
    data: events,
  });
};

//update a specified event based on event id
const updateEvent = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const event = await Event.findOne({ _id: req.params.id }).exec();
  if (!event) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  try {
    const {
      eventName,
      description,
      eventTarget,
      eventType,
      proposal,
      mid,
      final,
      year,
    } = req.body;

    if (eventName) event.eventName = eventName;
    if (description) event.description = description;
    if (eventTarget) event.eventTarget = eventTarget;
    if (eventType) event.eventType = eventType;
    if (proposal) event.proposal = proposal;
    if (mid) event.mid = mid;
    if (final) event.final = final;
    if (year) event.year = year;
    const result = await event.save();
    return res.status(200).json({
      data: result,
    });
  } catch (err) {
    console.error(`"error-message":${err.message}`);
    return res.sendStatus(400);
  }
};

//get specified event based on event id
const getEvent = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Event ID required." });

  const event = await Event.findOne({ _id: req.params.id }).exec();
  if (!event) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  res.status(200).json({
    data: event,
  });
};

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  updateEvent,
};
