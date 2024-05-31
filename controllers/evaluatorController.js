const Defense = require("../models/Defense");
const Project = require("../models/Project");

const getDefenseBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const defense = await Defense.findById(req.params.id)
      .populate("rooms")
      .populate("event");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    //populate evalutator and projects inside defense
    // Map over each defense room  and populate evaluator and projects
    const populatedRooms = await Promise.all(
      defense.rooms.map(async (room) => {
        // Populate projects for the current defense
        const populatedProjecs = await room.populate("projects");
        // populate evaluators
        const populatedEvaluator = await room.populate("evaluators");
        return {populatedProjecs,populatedEvaluator};
      })
    );

    // Send response
    return res.status(200).json({
      data: defense,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getProjectBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const project = await Project.findById(req.params.id)
      .populate("teamMembers")
      .populate("event");

    // Check if event exists
    if (!project) {
      return res.sendStatus(204);
    }

    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getDefenseBydId, getProjectBydId };
