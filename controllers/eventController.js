const Event = require("../models/Event");
const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
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
const {
  matchProjectsToSupervisors,
} = require("./utility functions/Match Projects and Supervisors/matchProjectsToSupervisors");

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
    console.log(
      "🚀 ~ getEvent ~ eventStatusList.complete:",
      eventStatusList.complete
    );
    console.log(
      "🚀 ~ getEvent ~ eventStatusList.active:",
      eventStatusList.active
    );
    // Find event by ID and populate the author field
    const event = await Event.findById(req.params.id)
      .populate({ path: "author", select: "-password -refreshToken" })
      .populate({
        path: "projects",
        match: {
          status: { $in: [eventStatusList.active, eventStatusList.complete] },
        },
        populate: [
          {
            path: "teamMembers",
            select: "-password -OTP -refreshToken",
          },
          {
            path: "supervisor.supervisorId",
          },
        ],
      });
    console.log("🚀 ~ getEvent ~ event:", event);

    // Check if event exists
    if (!event) {
      return res.sendStatus(204);
    }

    // Total student count eligible for particular event
    // Get the batch number of the student
    const batchNumber = getBatchYearFromEventType(event.eventType);

    // Construct the query based on the event type
    let query;
    if (event.eventTarget === "72354") {
      // If event type is '72354', include all students regardless of program
      query = { batchNumber: batchNumber };
    } else {
      // Otherwise, include only students whose program matches the event target
      query = { program: event.eventTarget, batchNumber: batchNumber };
    }

    // Get the number of students who can participate in that event
    const studentCount = await Student.find(query).countDocuments();

    // Search for the defenses that have the given event ID
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
    // Fetch all events details and populate projects
    let events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("projects");

    // If no events, return status 204
    if (!events || events.length === 0) {
      return res.sendStatus(204);
    }

    // Map over each event and process its projects
    events = await Promise.all(
      events.map(async (event) => {
        // Filter projects by status 101
        const filteredProjects = event.projects.filter(
          (project) => project.status === "101"
        );

        // Populate team members for each filtered project within the current event
        event.projects = await Promise.all(
          filteredProjects.map(async (project) => {
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

    // Find all evaluators and sort by createdAt
    const evaluators = await Evaluator.find().sort({ createdAt: -1 }).lean();

    // Return response with events and evaluators
    return res.status(200).json({
      data: {
        events: events,
        evaluators: evaluators,
      },
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
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
    console.log("🚀 ~ createNewDefense ~ defenseExists:", defenseExists);

    //does not allow to create defense of a particular event that has been already created for e.g. if project I proposal defense has already been created then if we create it again it will give 409----> conflict
    if (defenseExists.length) {
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
          defenseType: req.body.defenseType,
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

const getDefenseById = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find defense by ID and populate different fields
    const defense = await Defense.findById(req.params.id)
      .populate({
        path: "rooms",
        populate: [
          { path: "evaluators" },
          {
            path: "projects",
            populate: [
              { path: "proposal.evaluations" },
              { path: "proposal.defenses.evaluators.evaluator" },
              { path: "mid.evaluations" },
              { path: "mid.defenses.evaluators.evaluator" },
              { path: "final.evaluations" },
              { path: "final.defenses.evaluators.evaluator" },
              { path: "supervisor.supervisorId" },
            ],
          },
        ],
      })
      .populate("event");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }
    // Send response
    return res.status(200).json({
      data: defense,
    });
  } catch (err) {
    console.log(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

const extendDeadline = async (req, res) => {
  try {
    console.log(req.body);
    const { subEventType, reportDeadline, defenseDate, event } = req.body;
    if (!subEventType || !reportDeadline || !defenseDate || !event) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    //get the event
    const eventDetails = await Event.findOne({
      _id: event,
    });

    if (!eventDetails)
      return res.status(404).json({ error: "Event not found" });
    previousPhase = Number(eventDetails[subEventType].phase);
    previousPhase++;

    //update the reportDeadline and defensesDate of the event
    eventDetails[subEventType].defenseDate = defenseDate;
    eventDetails[subEventType].reportDeadline = reportDeadline;
    eventDetails[subEventType].phase = previousPhase.toString();

    await eventDetails.save();
    return res.status(200).json({
      data: eventDetails,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

const getAllProjects = async (req, res) => {
  try {
    // Fetch all events details and populate projects
    let projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate("supervisor.supervisorId");

    // If no events, return status 204
    if (!projects || projects.length === 0) {
      return res.sendStatus(204);
    }

    // Return response with events and evaluators
    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
  }
};

const getAllStudents = async (req, res) => {
  try {
    // Fetch all students details and populate projects
    const students = await Student.find().sort({ createdAt: -1 });

    // If no students, return status 204
    if (!students || students.length === 0) {
      return res.sendStatus(204);
    }

    // Return response with students
    return res.status(200).json({
      data: students,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
  }
};

const getAllSupervisors = async (req, res) => {
  try {
    // Fetch all supervisors details and populate projects
    const supervisors = await Supervisor.find().sort({ createdAt: -1 });

    // If no supervisor, return status 204
    if (!supervisors || supervisors.length === 0) {
      return res.sendStatus(204);
    }

    // Return response with events
    return res.status(200).json({
      data: supervisors,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
  }
};

const matchProjects = async (req, res) => {
  try {
    const { availableSupervisors, eventId } = req.body;

    // when supervisors and event id is empty as we can not proceed wihtout them
    if (!availableSupervisors.length || !eventId) return res.sendStatus(400);

    const matches = await matchProjectsToSupervisors({
      availableSupervisors: availableSupervisors,
      eventId: eventId,
    });

    if (matches.statusCode === 204) return res.sendStatus(204);

    // const matches = await matchProjectsToSupervisors();// for demo
    console.log("**************************************************");
    console.log("🚀 ~ matchProjects ~ matches:", matches);
    return res.status(200).json({
      matches,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

const saveMatchedProjects = async (req, res) => {
  try {
    const { matchedProjects } = req.body;
    console.log("🚀 ~ saveMatchedProjects ~ matchedProjects:", matchedProjects);

    let updatedMatches = [];

    for (const matchedProject of matchedProjects) {
      const { supervisor, projects } = matchedProject;
      console.log("🚀 ~ saveMatchedProjects ~ projects:", projects);
      console.log("🚀 ~ saveMatchedProjects ~ supervisor:", supervisor);

      let updatedProjects = [];

      for (const project of projects) {
        project.supervisor = { supervisorId: supervisor._id };

        const updatedProject = await Project.findByIdAndUpdate(
          project._id,
          { supervisor: { supervisorId: supervisor._id } },
          { new: true }
        );

        updatedProjects.push(updatedProject);
      }

      //this is to create an array that will save the updated projects record and push to the array
      // to achieve the format that is received
      updatedMatches.push({ supervisor, projects: updatedProjects });
    }

    console.log("🚀 ~ saveMatchedProjects ~ updatedMatches:", updatedMatches);
    return res.status(200).json({ matches: updatedMatches });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const dashboardDetails = async (req, res) => {
  try {
    const activeEvents = await Event.find({
      eventStatus: eventStatusList.active,
    });

    const activeDefenses = await Defense.find({
      status: eventStatusList.active,
    });

    return res.status(200).json({
      data: {
        activeEvents,
        activeDefenses,
      },
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getProjectById = async (req, res) => {
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
      .populate({
        path: "supervisor",
        populate: {
          path: "supervisorId",
        },
      })
      .populate({
        path: "progressLogs",
        populate: {
          path: "author",
          select: "-OTP -refreshToken -password",
        },
      })
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

const getResultDetails = async (req, res) => {
  try {
    console.log("🚀 ~ getResultDetails ~ req?.parama?.id:", req?.params?.id);
    if (!req?.params?.id) return res.sendStatus(404);

    const event = await Event.findOne({
      _id: req.params.id,
    }).populate({
      path: "projects",
      match: {
        $or: [{ status: eventStatusList.active },{ status:  eventStatusList.complete }],
      },
      populate: [
        {
          path: "proposal",
          populate: {
            path: "evaluations",
            populate: { path: "individualEvaluation.student" },
          },
        },
        {
          path: "mid",
          populate: {
            path: "evaluations",
            populate: { path: "individualEvaluation.student" },
          },
        },
        {
          path: "final",
          populate: {
            path: "evaluations",
            populate: { path: "individualEvaluation.student"   },
          },
        },
      ],
    });

    if (!event) return res.sendStatus(400);
    console.log("🚀 ~ getResultDetails ~ event:", event);

    return res.status(200).json({
      data: event,
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
  getDefenseById,
  extendDeadline,
  getAllProjects,
  getAllStudents,
  getAllSupervisors,
  matchProjects,
  saveMatchedProjects,
  dashboardDetails,
  getProjectById,
  getResultDetails,
};
