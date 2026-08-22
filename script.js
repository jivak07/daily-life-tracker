const habitForm = document.getElementById('habit-form');
const habitNameInput = document.getElementById('habit-name');
const habitList = document.getElementById('habit-list');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

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
    habitList.innerHTML = '<p class="empty">No habits yet. Add one above to get started.</p>';
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
  const confirmed = confirm('Delete this habit? This cannot be undone.');
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

renderHabits();