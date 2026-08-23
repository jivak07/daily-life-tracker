const habitForm = document.getElementById('habit-form');
const habitNameInput = document.getElementById('habit-name');
const habitList = document.getElementById('habit-list');
const goalForm = document.getElementById('goal-form');
const goalNameInput = document.getElementById('goal-name');
const goalTargetInput = document.getElementById('goal-target');
const goalUnitInput = document.getElementById('goal-unit');
const goalList = document.getElementById('goal-list');

let habits = JSON.parse(localStorage.getItem('habits')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];

function getTodayString() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function calculateStreak(habit) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
    if (habit.completedDates.indexOf(dateStr) !== -1) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function renderHabits() {
  habitList.innerHTML = '';

  if (habits.length === 0) {
    habitList.innerHTML = '<p class="empty">No habits added yet. Add one habit to get started.</p>';
    return;
  }

  const today = getTodayString();

  habits.forEach(function (habit) {
    const isDoneToday = habit.completedDates.indexOf(today) !== -1;
    const streak = calculateStreak(habit);

    const habitDiv = document.createElement('div');
    habitDiv.className = 'habit';
    habitDiv.innerHTML = `
      <input type="checkbox" ${isDoneToday ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
      <span class="habit-name">${habit.name}</span>
      <span class="habit-streak">${streak} day streak</span>
      <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
    `;
    habitList.appendChild(habitDiv);
  });
}

function toggleHabit(id) {
  const habit = habits.find(function (h) { return h.id === id; });
  const today = getTodayString();
  const index = habit.completedDates.indexOf(today);

  if (index === -1) {
    habit.completedDates.push(today);
  } else {
    habit.completedDates.splice(index, 1);
  }

  localStorage.setItem('habits', JSON.stringify(habits));
  renderHabits();
}

function deleteHabit(id) {
  const confirmed = confirm('Are you sure you want to delete this habit? This cannot be restore or undo');
  if (!confirmed) {
    return;
  }

  habits = habits.filter(function (h) { return h.id !== id; });
  localStorage.setItem('habits', JSON.stringify(habits));
  renderHabits();
}

habitForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const newHabit = {
    id: Date.now(),
    name: habitNameInput.value,
    completedDates: []
  };

  habits.push(newHabit);
  localStorage.setItem('habits', JSON.stringify(habits));

  renderHabits();
  habitForm.reset();
});

function renderGoals() {
  goalList.innerHTML = '';

  if (goals.length === 0) {
    goalList.innerHTML = '<p class="empty">No goals added yet. Add one goal to get started.</p>';
    return;
  }

  goals.forEach(function (goal) {
    const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const isComplete = goal.current >= goal.target;
    const unitLabel = goal.unit ? goal.unit : '';

    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal' + (isComplete ? ' goal-complete' : '');
    goalDiv.innerHTML = `
      <p class="goal-name">${goal.name}${isComplete ? ' \u2713' : ''}</p>
      <div class="goal-progress-bar">
        <div class="goal-progress-fill" style="width: ${percent}%"></div>
      </div>
      <p class="goal-progress-text">${goal.current} / ${goal.target} ${unitLabel}</p>
      <div class="goal-controls">
        <input type="number" class="goal-add-input" id="add-input-${goal.id}" placeholder="Add">
        <button onclick="addProgress(${goal.id})">Add</button>
        <button class="delete-btn" onclick="deleteGoal(${goal.id})">Delete</button>
      </div>
    `;
    goalList.appendChild(goalDiv);
  });
}

function addProgress(id) {
  const input = document.getElementById('add-input-' + id);
  const amount = Number(input.value);

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid number.');
    return;
  }

  const goal = goals.find(function (g) { return g.id === id; });
  goal.current += amount;

  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

function deleteGoal(id) {
  const confirmed = confirm('Are you sure, you want to delete this goal? This cannot be restore or undo');
  if (!confirmed) {
    return;
  }

  goals = goals.filter(function (g) { return g.id !== id; });
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

goalForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const newGoal = {
    id: Date.now(),
    name: goalNameInput.value,
    target: Number(goalTargetInput.value),
    unit: goalUnitInput.value,
    current: 0
  };

  goals.push(newGoal);
  localStorage.setItem('goals', JSON.stringify(goals));

  renderGoals();
  goalForm.reset();
});

renderHabits();
renderGoals();