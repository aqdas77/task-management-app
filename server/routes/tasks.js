const router = require("express").Router();
const { Task } = require("../models/task");
const { User } = require("../models/user");
const jwt_decode = require("jwt-decode");

router.post("/", async (req, res, next) => {
    try {
      // Check if token exists in request headers
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Decode the token to get user ID
      const decodedToken = jwt_decode(token);
      const userId = decodedToken._id;
  
      // Create a new task using Task model
      const task = new Task(req.body);
  
      // Save the task to the database
      await task.save();
  
      // Now, associate the task with the user
      const user = await User.findById(userId);
  
      // Push the task's ObjectId to the user's tasks array
      user.tasks.push(task._id);
  
      // Save the updated user document
      await user.save();
  
      res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  });

router.get('/', async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Decode the token to get user ID
      const decodedToken = jwt_decode(token);
      const userId = decodedToken._id;
  
      const user = await User.findById(userId).populate('tasks');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const tasks=user.tasks;
  
      // Send the tasks as a JSON response
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.put('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const updatedTaskData = req.body;
  
    try {
      // Find the task by ID and update its data
      const updatedTask = await Task.findByIdAndUpdate(taskId, updatedTaskData, {
        new: true, // Return the updated task
      });
  
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.delete('/:taskId', async (req, res) => {
    try {
      const taskId = req.params.taskId;
  
      // Find the task by ID and remove it
      const deletedTask = await Task.findByIdAndRemove(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Respond with a success message
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      // Handle errors, e.g., database errors or server errors
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;