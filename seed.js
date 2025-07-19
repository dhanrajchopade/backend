import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import fs from "fs";
import Project from "./models/project.models.js";
import Tag from "./models/tag.models.js";
import Task from "./models/task.models.js";
import Team from "./models/team.models.js";
import User from "./models/user.models.js";
import initializeDatabase from "./db/db.connect.js";

dotenv.config();

const projectData = JSON.parse(fs.readFileSync("projectData.json", "utf-8"));
const tagData = JSON.parse(fs.readFileSync("tagData.json", "utf-8"));
const taskData = JSON.parse(fs.readFileSync("taskData.json", "utf-8"));
const teamData = JSON.parse(fs.readFileSync("teamData.json", "utf-8"));
const userData = JSON.parse(fs.readFileSync("userData.json", "utf-8"));

async function seedData() {
  try {
    // Project Data
    for (const project of projectData) {
      const newProject = new Project({
        name: project.name,
        description: project.description,
      });
      await newProject.save();
    }
    console.log("Project Data seeded successfully.");

    // Tag Data
    for (const tag of tagData) {
      const newTag = new Tag({
        name: tag.name,
      });
      await newTag.save();
    }
    console.log("Tag Data seeded successfully.");

    // Task Data
    for (const task of taskData) {
      const newTask = new Task({
        name: task.name,
        project: task.project,
        team: task.team,
        owners: task.owners,
        tags: task.tags,
        timeToComplete: task.timeToComplete,
        status: task.status,
      });
      await newTask.save();
    }
    console.log("Task Data seeded successfully.");

    // Team Data
    for (const team of teamData) {
      const newTeam = new Team({
        name: team.name,
        description: team.description,
        members: team.members,
      });
      await newTeam.save();
    }
    console.log("Team Data seeded successfully.");

    // User Data
    for (const user of userData) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        name: user.name,
        email: user.email,
        password: hashedPassword,
      });
      await newUser.save();
    }
    console.log("User Data seeded successfully.");
  } catch (error) {
    console.log("An error occurred while seeding the data", error);
  }
}

// Connect to DB, seed, then disconnect
initializeDatabase().then(async () => {
  await seedData();
  await mongoose.disconnect();
  console.log("Database connection closed. Seeding complete.");
  process.exit(0);
}); 