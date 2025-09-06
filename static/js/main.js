let tasks = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  loadTasks();
  createParticleSystem();
  setupKeyboardShortcuts();
});

// Particle system (for visuals only)
function createParticleSystem() {
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = (5 + Math.random() * 5) + 's';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 10000);
  }
  setInterval(createParticle, 200);
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement === document.getElementById('taskInput')) {
      addTask();
    }
  });
}

// Load tasks
async function loadTasks() {
  try {
    const response = await fetch('/tasks');
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Add new task
async function addTask() {
  const input = document.getElementById('taskInput');
  const taskText = input.value.trim();
  if (!taskText) return;

  try {
    const response = await fetch('/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: taskText })
    });

    if (response.ok) {
      const newTask = await response.json();
      tasks.push(newTask);
      input.value = '';
      renderTasks();
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Toggle completion
async function toggleTask(taskId) {
  try {
    const response = await fetch(`/toggle/${taskId}`, { method: 'PATCH' });
    if (response.ok) {
      const updatedTask = await response.json();
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) tasks[idx] = updatedTask;
      renderTasks();
    }
  } catch (error) {
    console.error('Error toggling task:', error);
  }
}

// Delete task
async function deleteTask(taskId) {
  try {
    const response = await fetch(`/delete/${taskId}`, { method: 'DELETE' });
    if (response.ok) {
      tasks = tasks.filter(t => t.id !== taskId);
      renderTasks();
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

// Filter tasks
function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderTasks();
}

// Render tasks
function renderTasks() {
  const taskList = document.getElementById('taskList');
  let filteredTasks = tasks;

  // Apply current filter
  switch (currentFilter) {
    case 'pending':
      filteredTasks = tasks.filter(t => !t.done);
      break;
    case 'completed':
      filteredTasks = tasks.filter(t => t.done);
      break;
    default:
      filteredTasks = tasks; // all
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-text">
          ${currentFilter === 'completed' ? 'No completed tasks yet' :
            currentFilter === 'pending' ? 'No pending tasks' :
            'No tasks yet'}
        </div>
        <div class="empty-subtext">
          ${currentFilter === 'pending' ? 'Great job! All caught up!' : 'Add a task to get started'}
        </div>
      </div>
    `;
    return;
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <div class="task-item ${task.done ? 'completed' : ''}">
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
      </div>
      <div class="task-actions">
        ${!task.done 
          ? `<button class="action-btn complete-btn" onclick="toggleTask('${task.id}')" title="Mark as Completed">✅ Completed</button>` 
          : ''}
        <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete">🗑️ Delete</button>
      </div>
    </div>
  `).join('');

  // Update counter
  const pendingCount = tasks.filter(t => !t.done).length;
  document.getElementById('taskCounter').textContent =
    `${pendingCount} ${pendingCount === 1 ? 'task' : 'tasks'} remaining`;
}



// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
