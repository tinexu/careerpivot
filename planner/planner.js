// planner.js

// Fetch and render planner from localStorage on load
const weeklyPlan = JSON.parse(localStorage.getItem("weeklyPlan")) || [];

function renderPlanner() {
  const days = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
  ];

  days.forEach(day => {
    const column = document.getElementById(day);
    if (column) column.innerHTML = ""; // Clear before rendering
  });

  weeklyPlan.forEach((task, index) => {
    const column = document.getElementById(task.day);
    if (column) {
      const block = document.createElement("div");
      block.className = "task-block " + task.priority.toLowerCase();
      if (task.status === "Complete") {
        block.classList.add("completed");
      }

      block.innerHTML = `
      <div class="checkbox-label">
        <input type="checkbox" ${task.status === "Complete" ? "checked" : ""} onchange="markComplete('${task.day}', '${task.task}')">
          <span><strong>${task.time}</strong><br>${task.task}</span>
      </div>
      <div class="task-actions">
       <button class="edit-btn" onclick="editTask(${index})" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 21h17v-2H4v2zm14.71-13.29l-2.42-2.42a1 1 0 00-1.41 0L4 16.17V20h3.83l11.46-11.46a1 1 0 000-1.41z"/>
          </svg>
        </button>
        <button class="delete-btn" onclick="deleteTask(${index})" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 7h12v14H6zm2 2v10h2V9zm4 0v10h2V9zm2-5h-4l-1 1H5v2h14V5h-4z"/>
          </svg>
        </button>
      </div>
    `;
      column.appendChild(block);
    }
  });
}

function markComplete(day, taskName) {
  const idx = weeklyPlan.findIndex(t => t.day === day && t.task === taskName);
  if (idx !== -1) {
    const currentStatus = weeklyPlan[idx].status;
    weeklyPlan[idx].status = currentStatus === "Complete" ? "Pending" : "Complete";
    localStorage.setItem("weeklyPlan", JSON.stringify(weeklyPlan));
    location.reload();
  }
}

function editTask(index) {
  const task = weeklyPlan[index];
  const newTask = prompt("Edit task:", task.task);
  if (newTask !== null) {
    weeklyPlan[index].task = newTask.trim();
    localStorage.setItem("weeklyPlan", JSON.stringify(weeklyPlan));
    renderPlanner();
  }
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    weeklyPlan.splice(index, 1);
    localStorage.setItem("weeklyPlan", JSON.stringify(weeklyPlan));
    renderPlanner();
  }
}

function toggleTaskCompletion(day, taskName) {
  const idx = weeklyPlan.findIndex(t => t.day === day && t.task === taskName);
  if (idx !== -1) {
    weeklyPlan[idx].status = weeklyPlan[idx].status === "Complete" ? "Pending" : "Complete";
    localStorage.setItem("weeklyPlan", JSON.stringify(weeklyPlan));
    renderPlanner(); // re-render to reflect checkbox state
  }
}

async function generatePlanFromAI() {
  const button = document.querySelector(".card-action");
  button.disabled = true;
  button.textContent = "Generating...";

  try {
    const response = await fetch("http://localhost:3001/api/weekly-plan");

    let aiPlan;
    try {
      aiPlan = await response.json();
    } catch (jsonErr) {
      throw new Error("Invalid JSON from server");
    }

    if (!response.ok) {
      console.error("Server responded with error status:", response.status);
      console.error("Response body:", aiPlan);
      throw new Error("Server returned error");
    }

    localStorage.setItem("weeklyPlan", JSON.stringify(aiPlan));
    location.reload();
  } catch (err) {
    alert("Couldn't generate plan. Check API/server.");
    console.error("API error:", err);
  } finally {
    button.disabled = false;
    button.textContent = "Generate Plan";
  }
}


// Connect button to function
window.addEventListener("DOMContentLoaded", () => {
  renderPlanner();

  const button = document.querySelector(".card-action");
  if (button) {
    button.addEventListener("click", generatePlanFromAI);
  }
});
