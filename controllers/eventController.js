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
      author:req.userId,
    });

    return res.status(201).json({
      event: newEvent,
    });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(400);
  }
};

module.exports = {
  createNewEvent,
};
