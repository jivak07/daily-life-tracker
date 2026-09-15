let userName = localStorage.getItem('userName');
if (!userName) {
    userName = prompt('What should we call you?') || 'Guest';
    localStorage.setItem('userName', userName);
}

function getFormattedDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return now.toLocaleDateString('en', options);
}

document.getElementById('greeting').textContent = '\u{1F464} ' + userName + ' \u00b7 ' + getFormattedDate();

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const targetTab = button.getAttribute('data-tab');

        tabButtons.forEach(function (btn) { btn.classList.remove('active'); });
        tabPanels.forEach(function (panel) { panel.classList.remove('active'); });

        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        if (targetTab === 'overview') {
            renderOverview();
        }

        if (targetTab === 'history') {
            renderHistory();
        }

        if (targetTab === 'journey') {
            renderJourney();
        }
    });
});

function getTodayString() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

const taskForm = document.getElementById('task-form');
const taskIconInput = document.getElementById('task-icon');
const taskNameInput = document.getElementById('task-name');
const taskTimeInput = document.getElementById('task-time');
const routineSubtitle = document.getElementById('routine-subtitle');
const routineProgressFill = document.getElementById('routine-progress-fill');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderRoutine() {
    taskList.innerHTML = '';

    const today = getTodayString();
    const doneToday = tasks.filter(function (t) { return t.completedDates.indexOf(today) !== -1; }).length;
    const percent = tasks.length > 0 ? Math.round((doneToday / tasks.length) * 100) : 0;

    routineSubtitle.textContent = doneToday + '/' + tasks.length + ' done today';
    routineProgressFill.style.width = percent + '%';

    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="empty">No tasks yet. Add one above.</p>';
        return;
    }

    tasks.forEach(function (task) {
        const isDone = task.completedDates.indexOf(today) !== -1;

        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item' + (isDone ? ' done' : '');
        taskDiv.innerHTML = `
            <button class="check-btn" onclick="toggleTask(${task.id})">${isDone ? '\u2713' : ''}</button>
            <div class="task-icon">${task.icon}</div>
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-time">${task.time}</div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(taskDiv);
    });
}

function toggleTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    const today = getTodayString();
    const index = task.completedDates.indexOf(today);

    if (index === -1) {
        task.completedDates.push(today);
    } else {
        task.completedDates.splice(index, 1);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderRoutine();
}

function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderRoutine();
}

taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newTask = {
        id: Date.now(),
        icon: taskIconInput.value.trim() || '\u2022',
        name: taskNameInput.value,
        time: taskTimeInput.value,
        completedDates: []
    };

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderRoutine();
    taskForm.reset();
});

const goalForm = document.getElementById('goal-form');
const goalIconInput = document.getElementById('goal-icon');
const goalNameInput = document.getElementById('goal-name');
const goalTargetInput = document.getElementById('goal-target');
const goalUnitInput = document.getElementById('goal-unit');
const goalsSubtitle = document.getElementById('goals-subtitle');
const goalList = document.getElementById('goal-list');

let goals = JSON.parse(localStorage.getItem('goals')) || [];

function renderGoals() {
    goalList.innerHTML = '';

    const completed = goals.filter(function (g) { return g.current >= g.target; }).length;
    goalsSubtitle.textContent = completed + '/' + goals.length + ' completed';

    if (goals.length === 0) {
        goalList.innerHTML = '<p class="empty">No goals yet. Add one above.</p>';
        return;
    }

    goals.forEach(function (goal) {
        const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
        const isComplete = goal.current >= goal.target;

        const goalDiv = document.createElement('div');
        goalDiv.className = 'goal-item' + (isComplete ? ' done' : '');
        goalDiv.innerHTML = `
            <div class="goal-top">
                <div class="goal-icon">${goal.icon}</div>
                <div class="goal-info">
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-progress-text">${goal.current} / ${goal.target} ${goal.unit}</div>
                </div>
                <button class="delete-btn" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="goal-controls">
                <button onclick="adjustGoal(${goal.id}, -1)">-</button>
                <button onclick="adjustGoal(${goal.id}, 1)">+</button>
            </div>
        `;
        goalList.appendChild(goalDiv);
    });
}

function adjustGoal(id, amount) {
    const goal = goals.find(function (g) { return g.id === id; });
    goal.current = Math.max(0, goal.current + amount);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
}

function deleteGoal(id) {
    goals = goals.filter(function (g) { return g.id !== id; });
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
}

goalForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newGoal = {
        id: Date.now(),
        icon: goalIconInput.value.trim() || '\u2022',
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

const habitForm = document.getElementById('habit-form');
const habitIconInput = document.getElementById('habit-icon');
const habitNameInput = document.getElementById('habit-name');
const habitsSubtitle = document.getElementById('habits-subtitle');
const habitList = document.getElementById('habit-list');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

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

    const today = getTodayString();
    const doneToday = habits.filter(function (h) { return h.completedDates.indexOf(today) !== -1; }).length;
    habitsSubtitle.textContent = doneToday + '/' + habits.length + ' done today';

    if (habits.length === 0) {
        habitList.innerHTML = '<p class="empty">No habits yet. Add one above.</p>';
        return;
    }

    habits.forEach(function (habit) {
        const isDone = habit.completedDates.indexOf(today) !== -1;
        const streak = calculateStreak(habit);

        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-item' + (isDone ? ' done' : '');
        habitDiv.innerHTML = `
            <button class="habit-check-btn" onclick="toggleHabit(${habit.id})">${isDone ? '\u2713' : ''}</button>
            <div class="habit-icon">${habit.icon}</div>
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-streak">${streak} day streak</div>
            </div>
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
    habits = habits.filter(function (h) { return h.id !== id; });
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
}

habitForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newHabit = {
        id: Date.now(),
        icon: habitIconInput.value.trim() || '\u2022',
        name: habitNameInput.value,
        completedDates: []
    };

    habits.push(newHabit);
    localStorage.setItem('habits', JSON.stringify(habits));

    renderHabits();
    habitForm.reset();
});

const timerModeEl = document.getElementById('timer-mode');
const timerDisplayEl = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const focusMinutesInput = document.getElementById('focus-minutes');
const breakMinutesInput = document.getElementById('break-minutes');
const timerSubtitle = document.getElementById('timer-subtitle');

let timerMode = 'focus';
let timerSecondsLeft = 25 * 60;
let timerRunning = false;
let timerInterval = null;
let sessionLog = JSON.parse(localStorage.getItem('sessionLog')) || {};

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function getMinutesValue(inputEl, fallback) {
    const value = Number(inputEl.value);
    return value > 0 ? value : fallback;
}

function updateTimerDisplay() {
    timerDisplayEl.textContent = formatTime(timerSecondsLeft);
    timerModeEl.textContent = timerMode === 'focus' ? 'Focus' : 'Break';
    timerStartBtn.textContent = timerRunning ? 'Pause' : 'Start';

    const today = getTodayString();
    const count = sessionLog[today] || 0;
    timerSubtitle.textContent = count + ' focus sessions today';
}

function switchTimerMode() {
    const today = getTodayString();

    if (timerMode === 'focus') {
        sessionLog[today] = (sessionLog[today] || 0) + 1;
        localStorage.setItem('sessionLog', JSON.stringify(sessionLog));
        timerMode = 'break';
        timerSecondsLeft = getMinutesValue(breakMinutesInput, 5) * 60;
    } else {
        timerMode = 'focus';
        timerSecondsLeft = getMinutesValue(focusMinutesInput, 25) * 60;
    }
}

function tickTimer() {
    timerSecondsLeft--;

    if (timerSecondsLeft < 0) {
        switchTimerMode();
    }

    updateTimerDisplay();
}

timerStartBtn.addEventListener('click', function () {
    timerRunning = !timerRunning;

    if (timerRunning) {
        timerInterval = setInterval(tickTimer, 1000);
    } else {
        clearInterval(timerInterval);
    }

    updateTimerDisplay();
});

timerResetBtn.addEventListener('click', function () {
    timerRunning = false;
    clearInterval(timerInterval);
    timerMode = 'focus';
    timerSecondsLeft = getMinutesValue(focusMinutesInput, 25) * 60;
    updateTimerDisplay();
});

const overallScoreEl = document.getElementById('overall-score');
const routineScoreEl = document.getElementById('routine-score');
const habitScoreEl = document.getElementById('habit-score');
const goalScoreEl = document.getElementById('goal-score');
const moodSlider = document.getElementById('mood-slider');
const energySlider = document.getElementById('energy-slider');
const moodValueEl = document.getElementById('mood-value');
const energyValueEl = document.getElementById('energy-value');

const moodEmojis = ['\u{1F61E}', '\u{1F610}', '\u{1F642}', '\u{1F60A}', '\u{1F929}'];
const energyEmojis = ['\u{1FAAB}', '\u{1F50B}', '\u{1F50B}', '\u26A1', '\u26A1'];

let dailyState = JSON.parse(localStorage.getItem('dailyState')) || {};
let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || {};

function getTodayState() {
    const today = getTodayString();
    if (!dailyState[today]) {
        dailyState[today] = { mood: 3, energy: 3 };
    }
    return dailyState[today];
}

function getOverallScore() {
    const today = getTodayString();
    const scores = [];

    let routinePercent = 0;
    if (tasks.length > 0) {
        const doneToday = tasks.filter(function (t) { return t.completedDates.indexOf(today) !== -1; }).length;
        routinePercent = Math.round((doneToday / tasks.length) * 100);
        scores.push(routinePercent);
    }

    let habitPercent = 0;
    if (habits.length > 0) {
        const doneToday = habits.filter(function (h) { return h.completedDates.indexOf(today) !== -1; }).length;
        habitPercent = Math.round((doneToday / habits.length) * 100);
        scores.push(habitPercent);
    }

    let goalPercent = 0;
    if (goals.length > 0) {
        const total = goals.reduce(function (sum, g) {
            return sum + Math.min(100, Math.round((g.current / g.target) * 100));
        }, 0);
        goalPercent = Math.round(total / goals.length);
        scores.push(goalPercent);
    }

    const overall = scores.length > 0 ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : 0;

    return { overall: overall, routinePercent: routinePercent, habitPercent: habitPercent, goalPercent: goalPercent };
}

function logTodayScore(overall) {
    const today = getTodayString();
    scoreHistory[today] = overall;
    localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
}

function renderOverview() {
    const result = getOverallScore();
    logTodayScore(result.overall);

    overallScoreEl.textContent = result.overall + '%';
    routineScoreEl.textContent = result.routinePercent + '%';
    habitScoreEl.textContent = result.habitPercent + '%';
    goalScoreEl.textContent = result.goalPercent + '%';

    const state = getTodayState();
    moodSlider.value = state.mood;
    energySlider.value = state.energy;
    moodValueEl.textContent = moodEmojis[state.mood - 1];
    energyValueEl.textContent = energyEmojis[state.energy - 1];
}

moodSlider.addEventListener('input', function () {
    const state = getTodayState();
    state.mood = Number(moodSlider.value);
    localStorage.setItem('dailyState', JSON.stringify(dailyState));
    moodValueEl.textContent = moodEmojis[state.mood - 1];
});

energySlider.addEventListener('input', function () {
    const state = getTodayState();
    state.energy = Number(energySlider.value);
    localStorage.setItem('dailyState', JSON.stringify(dailyState));
    energyValueEl.textContent = energyEmojis[state.energy - 1];
});

function renderHistory() {
    const bestDayEl = document.getElementById('best-day-value');
    const averageEl = document.getElementById('average-value');
    const trackedDaysEl = document.getElementById('tracked-days-value');
    const historyList = document.getElementById('history-list');

    const dates = Object.keys(scoreHistory).sort().reverse();

    if (dates.length === 0) {
        bestDayEl.textContent = '--';
        averageEl.textContent = '--';
        trackedDaysEl.textContent = '0';
        historyList.innerHTML = '<p class="empty">No history yet. Visit Home to log today.</p>';
        return;
    }

    let bestDate = dates[0];
    let total = 0;

    dates.forEach(function (date) {
        if (scoreHistory[date] > scoreHistory[bestDate]) {
            bestDate = date;
        }
        total += scoreHistory[date];
    });

    const average = Math.round(total / dates.length);

    bestDayEl.textContent = scoreHistory[bestDate] + '%';
    averageEl.textContent = average + '%';
    trackedDaysEl.textContent = dates.length;

    historyList.innerHTML = '';

    dates.forEach(function (date) {
        const row = document.createElement('div');
        row.className = 'history-row';
        row.innerHTML = `
            <span class="history-date">${date}</span>
            <span class="history-score">${scoreHistory[date]}%</span>
        `;
        historyList.appendChild(row);
    });
}

function renderJourney() {
    const journeyChart = document.getElementById('journey-chart');
    journeyChart.innerHTML = '';

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const label = d.toLocaleDateString('en', { weekday: 'short' });
        const score = scoreHistory[dateStr] || 0;

        const bar = document.createElement('div');
        bar.className = 'journey-bar';
        bar.innerHTML = `
            <div class="journey-bar-track">
                <div class="journey-bar-fill" style="height: ${score}%"></div>
            </div>
            <div class="journey-bar-value">${score}%</div>
            <div class="journey-bar-label">${label}</div>
        `;
        journeyChart.appendChild(bar);
    }
}

const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

exportBtn.addEventListener('click', function () {
    const data = {
        userName: userName,
        tasks: tasks,
        goals: goals,
        habits: habits,
        sessionLog: sessionLog,
        dailyState: dailyState,
        scoreHistory: scoreHistory
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'daily-life-tracker-backup.json';
    link.click();

    URL.revokeObjectURL(url);
});

importInput.addEventListener('change', function () {
    const file = importInput.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const data = JSON.parse(reader.result);

            userName = data.userName || userName;
            tasks = data.tasks || [];
            goals = data.goals || [];
            habits = data.habits || [];
            sessionLog = data.sessionLog || {};
            dailyState = data.dailyState || {};
            scoreHistory = data.scoreHistory || {};

            localStorage.setItem('userName', userName);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('goals', JSON.stringify(goals));
            localStorage.setItem('habits', JSON.stringify(habits));
            localStorage.setItem('sessionLog', JSON.stringify(sessionLog));
            localStorage.setItem('dailyState', JSON.stringify(dailyState));
            localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));

            document.getElementById('greeting').textContent = '\u{1F464} ' + userName + ' \u00b7 ' + getFormattedDate();
            renderRoutine();
            renderGoals();
            renderHabits();

            alert('Data imported successfully.');
        } catch (error) {
            alert('That file could not be read. Make sure it is a valid backup file.');
        }
    };

    reader.readAsText(file);
    importInput.value = '';
});

renderRoutine();
renderGoals();
renderHabits();
updateTimerDisplay();