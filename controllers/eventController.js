const Event = require("../models/Events");

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

const getAllEvents = async (req, res) => {
  const events = await Event.find();
  if (!events) return res.status(204).json({ message: "No employees found." });
  res.status(200).json({
    data: events,
  });
};

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
  getEvent
};
