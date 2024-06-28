const eventStatusList = require("../config/eventStatusList");
const Project = require("../models/Project");
const Supervisor = require("../models/Supervisor");
const Event = require("../models/Event");

//update student details
const updateSupervisor = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const updateFields = {};
    const allowedFields = [
      "institution",
      "designation",
      "skillSet",
      "phoneNumber",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field]) {
        if (Array.isArray(req.body[field])) {
          updateFields[field] = req.body[field].map((fieldValue) => {
            return fieldValue;
          });
        }
        updateFields[field] = req.body[field];
      }
    });

    const supervisor = await Supervisor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -role -password",
      } // Exclude fields
    ).exec();

    if (!supervisor) {
      return res
        .status(204)
        .json({ message: `No student matches ID ${req.params.id}.` });
    }

    return res.status(200).json({
      data: supervisor,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

const getAllActiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id where the project status is active
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: eventStatusList.active,
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllArchiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id and is either complete or archive
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: {
        $in: [eventStatusList.complete, eventStatusList.archive],
      },
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getProjectBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }
  try {
    // Find event by ID and populate the author field
    const project = await Project.findById({
      _id: req.params.id,
      status: eventStatusList.active,
    })
      .populate("teamMembers")
      .populate("event")
      .populate("progressLogs")
      .populate([
        { path: "proposal.evaluations", populate: { path: "evaluator" } },
        { path: "mid.evaluations", populate: { path: "evaluator" } },
        { path: "final.evaluations", populate: { path: "evaluator" } },
      ]);

    // Check if event exists
    if (!project) {
      return res.sendStatus(204);
    }
    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};
const getAllActiveEvents = async (req, res) => {
  try {
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: eventStatusList.active,
    });
    console.log("🚀 ~ getAllActiveEvents ~ projects:", projects);
    console.log("🚀 ~ getAllActiveEvents ~ req.userId:", req.userId);

    const activeEventsIds = projects
      .filter((project) => {
        return (
          project.supervisor.supervisorId.toString() === req.userId.toString()
        );
      })
      .map((project) => project.event);
    //when there is no event that the supervisor is associated with
    if (!activeEventsIds.length) return res.sendStatus(204);
    console.log("🚀 ~ getAllActiveEvents ~ activeEventsIds:", activeEventsIds);

    const events = await Event.find({
      _id: {
        $in: activeEventsIds,
      },
      eventStatus: eventStatusList.active,
    });

    return res.status(200).json({
      data: events,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const toogleAvailabilityOfSupervisor = async (req, res) => {
  try{
    const {isAvailable} = req.body;
    console.log("🚀 ~ toogleAvailabilityOfSupervisor ~ isAvailable:", isAvailable)

    //get the current sueprviso
    const updatedSupervisor = await Supervisor.findOneAndUpdate(
      { _id: req.userId },
      { $set: { isAvailable: isAvailable } },
      { new: true }
    );
    console.log("🚀 ~ toogleAvailabilityOfSupervisor ~ updatedSupervisor:", updatedSupervisor)

    return res.status(200).json({
      data:updatedSupervisor
    })
  }catch(err){
    console.error()
  }
};
module.exports = {
  updateSupervisor,
  getAllActiveProjects,
  getAllArchiveProjects,
  getProjectBydId,
  getAllActiveEvents,
  toogleAvailabilityOfSupervisor
};
