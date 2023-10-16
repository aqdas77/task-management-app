import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import InputLabel from "@mui/material/InputLabel";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

const Main = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskToDelete, setSelectedTaskToDelete] = useState(null);
  const [data, setData] = useState({
    taskTitle: "",
    taskDetail: "",
    taskDeadline: new Date(),
  });

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      const url = "https://react-task-app.onrender.com/api/tasks";
      const token = localStorage.getItem("token");

      const res = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        setIsFormOpen(false);
        alert("Task created successfully");
        // Refresh the task list
        fetchTasks();
      } else {
        alert("Failed to create task. Please check your input.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const fetchTasks = () => {
    const token = localStorage.getItem("token");
    axios
      .get("https://react-task-app.onrender.com/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to open the detail dialog for a task
  const openDetail = (task) => {
    setSelectedTaskForDetail(task);
  };

  // Function to close the detail dialog
  const closeDetail = () => {
    setSelectedTaskForDetail(null);
  };

  // Function to open the edit dialog for a task
  const openEdit = (task) => {
    setSelectedTaskForEdit(task);
  };

  // Function to close the edit dialog
  const closeEdit = () => {
    setSelectedTaskForEdit(null);
  };

  const selectTaskForDeletion = (task) => {
    setSelectedTaskToDelete(task);
  };
  // Function to handle updating a task
  const handleUpdate = async () => {
    if (!selectedTaskForEdit) return;

    try {
      const url = `https://react-task-app.onrender.com/api/tasks/${selectedTaskForEdit._id}`;
      const token = localStorage.getItem("token");

      const res = await axios.put(url, selectedTaskForEdit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        // Task updated successfully
        alert("Task updated successfully");
        closeEdit(); // Close the edit dialog
        fetchTasks(); // Refresh the task list
      } else {
        alert("Failed to update task. Please check your input.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  // Function to handle deleting a task
  const handleDelete = async () => {
    if (!selectedTaskToDelete) return;

    try {
      const url = `https://react-task-app.onrender.com/api/tasks/${selectedTaskToDelete._id}`;
      const token = localStorage.getItem("token");

      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert("Task deleted successfully");
        closeDetail();
        // Refresh the task list
        fetchTasks();
        setSelectedTaskToDelete(null); // Clear the selected task for deletion
      } else {
        alert("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  function calculateStatus(deadline) {
    const today = new Date();
    const taskDeadline = new Date(deadline);
  
    if (today > taskDeadline) {
      return "Completed";
    } else if (today < taskDeadline) {
      return "In Progress";
    } else {
      return "Pending";
    }
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            ></IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Home
            </Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Container
        style={{ maxWidth: "lg", marginTop: "2rem", marginBottom: "2rem" }}
      >
        <Button variant="outlined" onClick={openForm}>
          Create Task
        </Button>

        <Dialog open={isFormOpen} onClose={closeForm}>
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel>Title</InputLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  placeholder="Task title..."
                  fullWidth
                  variant="outlined"
                  name="taskTitle"
                  value={data.taskTitle}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Details</InputLabel>
                <TextareaAutosize
                  minRows={3}
                  placeholder="Task details..."
                  style={{ width: "100%" }}
                  name="taskDetail"
                  value={data.taskDetail}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Deadline"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={data.taskDeadline}
                  name="taskDeadline"
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={closeForm} color="primary">
              Cancel
            </Button>
            <Button variant="outlined" onClick={createTask} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Container>
        <h1>Task List</h1>
        <Grid container spacing={2}>
          {tasks && tasks !== undefined && tasks.length > 0 ? (
            tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <Card
                  sx={{
                    maxWidth: 345,
                    height: 225,
                    border: "0.1px solid gray",
                    color: "text.primary",
                    borderRadius: "8px",

                    transition: "background-color 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      border: "white",
                      backgroundColor: "#e8f4f8",
                      boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                      {task.taskTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.taskDetail.length > 60
                        ? `${task.taskDetail.substring(0, 60)}...`
                        : task.taskDetail}
                    </Typography>
                    <Typography color="#ff6a6a">
                      Deadline: {formatDate(task.taskDeadline)}
                    </Typography>
                    <Typography>
      Status: {calculateStatus(task.taskDeadline)}
    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openDetail(task)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openEdit(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        selectTaskForDeletion(task);
                        handleDelete();
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Container sx={{ marginTop: 2 }}>No tasks to show...</Container>
          )}
        </Grid>
      </Container>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTaskForDetail} onClose={closeDetail}>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTaskForDetail && (
            <>
              <Typography gutterBottom variant="h4" component="div">
                {selectedTaskForDetail.taskTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTaskForDetail.taskDetail}
              </Typography>
              <Typography>
                Deadline:{" "}
                {new Date(
                  selectedTaskForDetail.taskDeadline
                ).toLocaleDateString()}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeDetail} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!selectedTaskForEdit} onClose={closeEdit}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {selectedTaskForEdit && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel>Title</InputLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  fullWidth
                  variant="outlined"
                  name="taskTitle"
                  value={selectedTaskForEdit.taskTitle}
                  onChange={(e) =>
                    setSelectedTaskForEdit({
                      ...selectedTaskForEdit,
                      taskTitle: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Details</InputLabel>
                <TextareaAutosize
                  minRows={3}
                  style={{ width: "100%" }}
                  name="taskDetail"
                  value={selectedTaskForEdit.taskDetail}
                  onChange={(e) =>
                    setSelectedTaskForEdit({
                      ...selectedTaskForEdit,
                      taskDetail: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Deadline"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={selectedTaskForEdit.taskDeadline}
                  onChange={(e) =>
                    setSelectedTaskForEdit({
                      ...selectedTaskForEdit,
                      taskDeadline: e.target.value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleUpdate} color="primary">
            Update
          </Button>
          <Button variant="outlined" onClick={closeEdit} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Main;
