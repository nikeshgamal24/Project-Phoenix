const eventStatusList = require("../../../config/eventStatusList");
const Project = require("../../../models/Project");
const Supervisor = require("../../../models/Supervisor");
const { cosineSimilarity, getSkillVector } = require("./cosineSimilarity");
const { demoProjectsData } = require("./demoProjectsData");
const { demoSupervisorsData } = require("./demoSupervisorsData");

// Function to fetch all unique skills from projects and supervisors
const getAllSkills = async ({ projects, supervisors }) => {
  const allSkills = new Set();
  console.log("🚀 ~ getAllSkills before~ allSkills:", allSkills);

  projects.forEach((project) =>
    project.categories.forEach((skill) => allSkills.add(skill))
  );

  supervisors.forEach((supervisor) =>
    supervisor.skillSet.forEach((skill) => allSkills.add(skill))
  );

  console.log("🚀 ~ getAllSkills  before return~ allSkills:", allSkills);
  return Array.from(allSkills);
};

// Function to match projects to supervisors
const matchProjectsToSupervisors = async ({
  availableSupervisors,
  eventId,
}) => {
  // const projects = demoProjectsData; //demodata
  // const supervisors = demoSupervisorsData; //demodata
  
  const projects = await Project.find({
    event: eventId,
    status: eventStatusList.active,
  });

  console.log("🚀 ~ matchProjectsToSupervisors ~ projects:", projects);
  const supervisors = availableSupervisors;
  console.log("🚀 ~ matchProjectsToSupervisors ~ supervisors:", supervisors);

  const allSkills = await getAllSkills({
    projects: projects,
    supervisors: supervisors,
  });
  console.log("🚀 ~ matchProjectsToSupervisors ~ allSkills:", allSkills);

  const projectVectors = projects.map((project) => {
    return getSkillVector(project.categories, allSkills);
  });
  console.log(
    "🚀 ~ matchProjectsToSupervisors ~ projectVectors:",
    projectVectors
  );
  console.log("*******************************************");

  const supervisorVectors = supervisors.map((supervisor) => {
    return getSkillVector(supervisor.skillSet, allSkills);
  });
  console.log(
    "🚀 ~ matchProjectsToSupervisors ~ supervisorVectors:",
    supervisorVectors
  );
  console.log("*******************************************");

  let matches = [];

  projects.forEach((project, projectIndex) => {
    console.log(
      "🚀 ~ projects.forEach ~ project, projectIndex:",
      project,
      projectIndex
    );
    let supervisorChoices = [];

    supervisorVectors.forEach((supervisorVector, supervisorIndex) => {
      console.log(
        "🚀 ~ supervisorVectors.forEach ~ supervisorVector, supervisorIndex:",
        supervisorVector,
        supervisorIndex
      );

      //finding out cosine similarity of a single project against all the supervisor skillset
      const similarity = cosineSimilarity(
        projectVectors[projectIndex],
        supervisorVector
      );
      console.log("🚀 ~ supervisorVectors.forEach ~ similarity:", similarity);

      // Store supervisor index and similarity score
      // store  how much every project is similar to the supervisor
      supervisorChoices.push({ index: supervisorIndex, similarity });
      console.log(
        "🚀 ~ supervisorVectors.forEach ~ supervisorChoices:",
        supervisorChoices
      );
    });
    console.log("*******************************************");
    console.log(
      "🚀 ~ projects.forEach ~ before supervisorChoices:",
      supervisorChoices
    );
    // Sort supervisor choices by similarity (highest to lowest)
    supervisorChoices.sort((a, b) => b.similarity - a.similarity);
    console.log(
      "🚀 ~ projects.forEach ~ after supervisorChoices:",
      supervisorChoices
    );
    console.log("*******************************************");

    let assigned = false;
    for (const choice of supervisorChoices) {
      console.log("🚀 ~ projects.forEach ~ choice:", choice);
      const supervisor = supervisors[choice.index];
      console.log("🚀 ~ projects.forEach ~ supervisor:", supervisor);

      // Check if supervisor can take more projects
      // Assign project to supervisor
      project.supervisor = supervisor.fullname;
      // project.supervisor = supervisor._id;
      console.log("🚀 ~ projects.forEach ~ project:", project);

      // Update supervisor's projectsAssigned count
      supervisor.projects.push(project.projectName); // should push project id
      // supervisor.projects.push(project._id);
      // await supervisor.save();

      matches.push({
        project: project.projectName,
        supervisor: supervisor.fullname,
      });
      assigned = true;
      console.log(
        "🚀 ~ projects.forEach inside supervisor.projectsAssigned~ matches:",
        matches
      );
      break; // Exit loop once project is assigned
    }

    if (!assigned) {
      // Handle case where no supervisor can take the project (optional)
      matches.push({ project: project.projectName, supervisor: "Unassigned" });
    }
  });

  return matches;
};

module.exports = {
  matchProjectsToSupervisors,
};
