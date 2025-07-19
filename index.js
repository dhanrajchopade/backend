import express from 'express'
import initializeDatabase from './db/db.connect.js'
import bcrypt from 'bcrypt';
import Project from './models/project.models.js'
import Tag from './models/tag.models.js'
import Task from './models/task.models.js'
import Team from './models/team.models.js'
import User from './models/user.models.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())

initializeDatabase()

// cors 
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

 
// Authentication 
import jwt from "jsonwebtoken";
 
const JWT_SECRET = "jwt_secret_key"

const verifyJWT = (req,res,next)=>{
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({message:"No Token Provided."})
    }
    try{
        const decodedToken = jwt.verify(token,JWT_SECRET)
        req.user = decodedToken
        next()
    }catch(error){
        return res.status(403).json({message:"Invalid token"})
    }
}

// Login API to verify the account / Token authentication
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

// Signup route
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "New user account added to the database" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create a new user account." });
  }
});


// Get authenticated user details
app.get("/auth/me", verifyJWT, async (req, res) => {     //  verifyJWT sets req.user to the authenticated user's payload
  try {

    const user = await User.findById(req.user.userId); 
    if (!user) {
      return res.status(400).json({ error: "User Details not found" });
    }
    res.json(user); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the user details" });
  }
});

// Post (Create Tasks)

app.post("/tasks", verifyJWT, async(req,res)=>{
    try{
        const newTask = new Task(req.body)
        await newTask.save()
        res.status(201).json({message:"Task added to database successfully."})
    }catch(error){
        console.log(error)
        res.status(500).json({error:"Failed to add task to database."})
    }
})

// fetch/filter the Tasks
app.get('/tasks', verifyJWT, async(req,res)=>{
try{
    const {team,owners,tags,project,status} = req.query;
    const filter = {}

    if(team) filter.team = team;
    if(owners) filter.owners = owners;
    if(tags) filter.tags = { $in: tags.split(',') };
    if(project) filter.project = project;
    if(status) filter.status = status;

    const tasks = await Task.find(filter)
    res.json(tasks)
}catch(errror){
    res.status(500).json({error:"Failed to fetch the tasks."})
}
})


// updated task (Patching)
app.put('/tasks/:id', verifyJWT, async(req,res)=>{
    try{
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body,{new:true})
    if(!updatedTask){
        return res.status(404).json({error:"Task not found."})
    }
    res.json(updatedTask)
    }catch(error){
        res.status(500).json({error:"Failed to update Task."})
    }
})
// Delete a task 
app.delete("/tasks/:id", verifyJWT, async(req,res)=>{
    try{
const tasks = await Task.findByIdAndDelete(req.params.id)
if(!tasks){
    return res.status(404).json({error:"Task not found"})
}
res.status(200).json({error:"Task deleted successfully."})
    }catch(error){
        res.status(500).json({error:"Failed to delete a task."})
    }
})

// Get Tasks by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project')
      .populate('team')
      .populate('owners'); // populating all references

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task by ID." });
  }
});



// Get Project by ID

app.get('/project/:id', verifyJWT, async(req,res)=>{
  try{
    const project = await Project.findById(req.params.id)
    res.json(project)
  }catch(error){
    res.status(500).json({error:"Failed to fetch Project details by Id."})
  }
})

// Add Team (POST Call API)

app.post("/teams", verifyJWT, async(req,res)=>{
    try{
        const newTeam = new Team(req.body)
        await newTeam.save()
        res.status(201).json({message:"Team added to database successfully."})
    }catch(error){
        console.log(error)
        res.status(500).json({error:"Failed to add lead to database."})
    }
})


// GET team (Fetch Team Details)

app.get("/teams", verifyJWT, async (req, res) => {
  try {
    const teams = await Team.find().populate("members");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team details." });
  }
});

app.get('/users',verifyJWT, async (req, res) => {
  try {
    const users = await User.find();  
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// Add projects (POST Call API)
app.post("/projects", verifyJWT, async(req,res)=>{
    try{
        const newProjects = new Project(req.body)
       await newProjects.save()
       res.status(201).json({message:"Project added successfully."})
    }catch(error){
        res.status(500).json({error:"Failed to add project details."})
    }
})


// Fetch Projects API (GET call)
app.get("/projects", verifyJWT, async(req,res)=>{
    try{
        const projects = await Project.find()
        res.json({projects})
    }catch(error){
      console.error("Backend error at /projects:", error); 
        res.status(500).json({error:"Failed to get projects details."})
    }
})

// Get Project by ID
app.get('/project/:id', verifyJWT, async(req,res)=>{
  try{
    const project = await Project.findById(req.params.id)
    res.json(project)
  }catch(error){
    res.status(500).json({error:"Failed to fetch Project details by Id."})
  }
})

// Add tags (POST )
app.post("/tags", verifyJWT, async(req,res)=>{
    try{
        const newTags = new Tag(req.body)
        await newTags.save()
        res.status(201).json({message:"Tag added successfully."})
    }catch(error){
        res.status(500).json({error:"Failed to add Tags."})
    }
})

// Get Tags (GET)
app.get("/tags", verifyJWT, async(req,res)=>{
    try{
        const tags= await Tag.find()
        res.json(tags)
    }catch(error){
        res.status(500).json({error:"Failed to get tags."})
    }
})

// Report Routes (APIs)

// Task completed last week (GET /report/last-week)

app.get('/report/last-week', verifyJWT, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const tasks = await Task.find({
      status: 'Completed',
      updatedAt: { $gte: oneWeekAgo }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch last week's completed tasks." });
  }
});

// GET /report/pending

app.get('/report/pending', verifyJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ status: { $ne: 'Completed' } });

    // Assuming timeToComplete is in days
    const totalPendingDays = tasks.reduce((sum, task) => sum + (task.timeToComplete || 0), 0);

    res.json({ totalPendingDays });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending work report." });
  }
});

// GET /report/closed-tasks

app.get('/report/closed-tasks', verifyJWT, async (req, res) => {
  try {
    // Group by team, owner, and project, and count completed tasks
    const aggregation = await Task.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: {
            team: "$team",
            owners: "$owners",
            project: "$project"
          },
          closedTasks: { $sum: 1 }
        }
      }
    ]);

    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch closed tasks report." });
  }
});

app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))
