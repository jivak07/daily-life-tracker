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

function getShortDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
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
            renderGoalJourneys();
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
const taskCountProgressInput = document.getElementById('task-count-progress');
const taskSubmitBtn = document.getElementById('task-submit-btn');
const taskAddToggle = document.getElementById('task-add-toggle');
const taskCancelBtn = document.getElementById('task-cancel-btn');
const routineSubtitle = document.getElementById('routine-subtitle');
const routineProgressFill = document.getElementById('routine-progress-fill');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskId = null;

function openTaskForm() {
    taskForm.classList.remove('add-form-hidden');
    taskAddToggle.style.display = 'none';
}

function closeTaskForm() {
    taskForm.classList.add('add-form-hidden');
    taskAddToggle.style.display = 'block';
    taskForm.reset();
    editingTaskId = null;
    taskSubmitBtn.textContent = 'Add';
}

taskAddToggle.addEventListener('click', openTaskForm);
taskCancelBtn.addEventListener('click', closeTaskForm);

function renderRoutine() {
    taskList.innerHTML = '';

    const today = getTodayString();
    const doneToday = tasks.filter(function (t) { return t.completedDates.indexOf(today) !== -1; }).length;
    const percent = tasks.length > 0 ? Math.round((doneToday / tasks.length) * 100) : 0;

    routineSubtitle.textContent = doneToday + '/' + tasks.length + ' done \u00b7 ' + getShortDate();
    routineProgressFill.style.width = percent + '%';

    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="empty">No tasks yet. Add one above.</p>';
    } else {
        tasks.forEach(function (task) {
            const isDone = task.completedDates.indexOf(today) !== -1;
            const notCounted = task.countInProgress === false;

            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item' + (isDone ? ' done' : '');
            taskDiv.innerHTML = `
                <button class="check-btn" onclick="toggleTask(${task.id})">${isDone ? '\u2713' : ''}</button>
                <div class="task-icon">${task.icon}</div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-time">${task.time}${notCounted ? ' <span class="not-counted-tag">not counted</span>' : ''}</div>
                </div>
                <button class="icon-btn" onclick="editTask(${task.id})">\u270f\ufe0f</button>
                <button class="icon-btn" onclick="deleteTask(${task.id})">\u{1F5D1}\ufe0f</button>
            `;
            taskList.appendChild(taskDiv);
        });
    }

    updateHeaderScore();
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

function editTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    taskIconInput.value = task.icon;
    taskNameInput.value = task.name;
    taskTimeInput.value = task.time;
    taskCountProgressInput.checked = task.countInProgress !== false;
    editingTaskId = id;
    taskSubmitBtn.textContent = 'Save';
    openTaskForm();
    taskNameInput.focus();
}

function deleteTask(id) {
    const confirmed = confirm('Delete this task? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (t) { return t.id !== id; });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    if (editingTaskId === id) {
        closeTaskForm();
    }

    renderRoutine();
}

taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (editingTaskId !== null) {
        const task = tasks.find(function (t) { return t.id === editingTaskId; });
        task.icon = taskIconInput.value.trim() || '\u2022';
        task.name = taskNameInput.value;
        task.time = taskTimeInput.value;
        task.countInProgress = taskCountProgressInput.checked;
    } else {
        tasks.push({
            id: Date.now(),
            icon: taskIconInput.value.trim() || '\u2022',
            name: taskNameInput.value,
            time: taskTimeInput.value,
            countInProgress: taskCountProgressInput.checked,
            completedDates: []
        });
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderRoutine();
    closeTaskForm();
});

const goalForm = document.getElementById('goal-form');
const goalIconInput = document.getElementById('goal-icon');
const goalNameInput = document.getElementById('goal-name');
const goalTargetInput = document.getElementById('goal-target');
const goalUnitInput = document.getElementById('goal-unit');
const goalCountProgressInput = document.getElementById('goal-count-progress');
const goalTrackJourneyInput = document.getElementById('goal-track-journey');
const goalSubmitBtn = document.getElementById('goal-submit-btn');
const goalAddToggle = document.getElementById('goal-add-toggle');
const goalCancelBtn = document.getElementById('goal-cancel-btn');
const goalsSubtitle = document.getElementById('goals-subtitle');
const goalList = document.getElementById('goal-list');

let goals = JSON.parse(localStorage.getItem('goals')) || [];
let editingGoalId = null;

goals.forEach(function (g) {
    if (!g.type) {
        g.type = g.resetsDaily ? 'daily_quota' : 'lifetime';
    }
    if (!g.dailyAdded) {
        g.dailyAdded = {};
    }
    if (!g.dailyProgress) {
        g.dailyProgress = {};
    }
    if (!g.completedDates) {
        g.completedDates = [];
    }
    if (typeof g.current !== 'number') {
        g.current = 0;
    }
    if (typeof g.trackInJourney !== 'boolean') {
        g.trackInJourney = false;
    }
});

function openGoalForm() {
    goalForm.classList.remove('add-form-hidden');
    goalAddToggle.style.display = 'none';
}

function closeGoalForm() {
    goalForm.classList.add('add-form-hidden');
    goalAddToggle.style.display = 'block';
    goalForm.reset();
    setGoalTypeRadio('lifetime');
    editingGoalId = null;
    goalSubmitBtn.textContent = 'Add';
}

goalAddToggle.addEventListener('click', openGoalForm);
goalCancelBtn.addEventListener('click', closeGoalForm);

function getGoalType() {
    const checked = document.querySelector('input[name="goal-type"]:checked');
    return checked ? checked.value : 'lifetime';
}

function setGoalTypeRadio(type) {
    const radio = document.querySelector('input[name="goal-type"][value="' + type + '"]');
    if (radio) {
        radio.checked = true;
    }
}

function getGoalCurrentAmount(goal) {
    if (goal.type === 'daily_checkoff') {
        return goal.completedDates.length;
    }
    if (goal.type === 'daily_quota') {
        const today = getTodayString();
        return goal.dailyProgress[today] || 0;
    }
    return goal.current;
}

function getGoalPercent(goal) {
    const amount = getGoalCurrentAmount(goal);
    return Math.min(100, Math.round((amount / goal.target) * 100));
}

function getGoalTodayScore(goal) {
    const today = getTodayString();

    if (goal.type === 'daily_checkoff') {
        return goal.completedDates.indexOf(today) !== -1 ? 100 : 0;
    }

    if (goal.type === 'daily_quota') {
        return getGoalPercent(goal);
    }

    const addedToday = goal.dailyAdded[today] || 0;
    return addedToday > 0 ? 100 : 0;
}

function renderGoals() {
    goalList.innerHTML = '';

    const countedGoals = goals.filter(function (g) { return g.countInProgress !== false; });

    if (goals.length === 0) {
        goalsSubtitle.textContent = 'Average: 0% today';
    } else if (countedGoals.length === 0) {
        goalsSubtitle.textContent = 'No goals counted in progress';
    } else {
        const totalScore = countedGoals.reduce(function (sum, g) { return sum + getGoalTodayScore(g); }, 0);
        goalsSubtitle.textContent = 'Average: ' + Math.round(totalScore / countedGoals.length) + '% today';
    }

    if (goals.length === 0) {
        goalList.innerHTML = '<p class="empty">No goals yet. Add one above.</p>';
        updateHeaderScore();
        return;
    }

    const today = getTodayString();

    goals.forEach(function (goal) {
        const amount = getGoalCurrentAmount(goal);
        const percent = getGoalPercent(goal);
        const isComplete = amount >= goal.target;
        const notCounted = goal.countInProgress === false;

        let typeLabel = 'lifetime total';
        let progressLabel = amount + '/' + goal.target + ' ' + goal.unit + ' (' + percent + '%)';
        let controlsHtml = `
            <button onclick="adjustGoal(${goal.id}, -1)">-1</button>
            <button onclick="adjustGoal(${goal.id}, 1)">+1</button>
            <button onclick="adjustGoal(${goal.id}, 5)">+5</button>
            <button onclick="adjustGoal(${goal.id}, 10)">+10</button>
        `;

        if (goal.type === 'daily_checkoff') {
            typeLabel = 'daily check-off';
            progressLabel = amount + '/' + goal.target + ' days (' + percent + '%)';
            const doneToday = goal.completedDates.indexOf(today) !== -1;
            controlsHtml = `<button class="goal-check-btn${doneToday ? ' checked' : ''}" onclick="toggleGoalDay(${goal.id})">${doneToday ? '\u2713 Done today' : 'Mark today done'}</button>`;
        } else if (goal.type === 'daily_quota') {
            typeLabel = 'daily quota';
            progressLabel = amount + '/' + goal.target + ' ' + goal.unit + ' today (' + percent + '%)';
        }

        const goalDiv = document.createElement('div');
        goalDiv.className = 'goal-item' + (isComplete ? ' done' : '');
        goalDiv.innerHTML = `
            <div class="goal-top">
                <div class="goal-icon">${goal.icon}</div>
                <div class="goal-info">
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-target-text">Target: ${goal.target} \u00b7 ${typeLabel}${notCounted ? ' <span class="not-counted-tag">not counted</span>' : ''}</div>
                </div>
                <button class="icon-btn" onclick="editGoal(${goal.id})">\u270f\ufe0f</button>
                <button class="icon-btn" onclick="deleteGoal(${goal.id})">\u{1F5D1}\ufe0f</button>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="goal-bottom">
                <div class="goal-progress-text">${progressLabel}</div>
                <div class="goal-controls">${controlsHtml}</div>
            </div>
        `;
        goalList.appendChild(goalDiv);
    });

    updateHeaderScore();
}

function adjustGoal(id, amount) {
    const goal = goals.find(function (g) { return g.id === id; });
    const today = getTodayString();

    if (goal.type === 'daily_quota') {
        const current = goal.dailyProgress[today] || 0;
        goal.dailyProgress[today] = Math.max(0, current + amount);
    } else {
        goal.current = Math.max(0, goal.current + amount);
        const addedToday = goal.dailyAdded[today] || 0;
        goal.dailyAdded[today] = Math.max(0, addedToday + amount);
    }

    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
}

function toggleGoalDay(id) {
    const goal = goals.find(function (g) { return g.id === id; });
    const today = getTodayString();
    const index = goal.completedDates.indexOf(today);

    if (index === -1) {
        goal.completedDates.push(today);
    } else {
        goal.completedDates.splice(index, 1);
    }

    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
}

function editGoal(id) {
    const goal = goals.find(function (g) { return g.id === id; });
    goalIconInput.value = goal.icon;
    goalNameInput.value = goal.name;
    goalTargetInput.value = goal.target;
    goalUnitInput.value = goal.unit;
    setGoalTypeRadio(goal.type);
    goalCountProgressInput.checked = goal.countInProgress !== false;
    goalTrackJourneyInput.checked = goal.trackInJourney === true;
    editingGoalId = id;
    goalSubmitBtn.textContent = 'Save';
    openGoalForm();
    goalNameInput.focus();
}

function deleteGoal(id) {
    const confirmed = confirm('Delete this goal? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    goals = goals.filter(function (g) { return g.id !== id; });
    localStorage.setItem('goals', JSON.stringify(goals));

    if (editingGoalId === id) {
        closeGoalForm();
    }

    renderGoals();
}

goalForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedType = getGoalType();
    let activeGoal;

    if (editingGoalId !== null) {
        activeGoal = goals.find(function (g) { return g.id === editingGoalId; });
        activeGoal.icon = goalIconInput.value.trim() || '\u2022';
        activeGoal.name = goalNameInput.value;
        activeGoal.target = Number(goalTargetInput.value);
        activeGoal.unit = goalUnitInput.value;
        activeGoal.countInProgress = goalCountProgressInput.checked;
        activeGoal.trackInJourney = goalTrackJourneyInput.checked;

        if (activeGoal.type !== selectedType) {
            activeGoal.type = selectedType;
            activeGoal.current = 0;
            activeGoal.dailyAdded = {};
            activeGoal.dailyProgress = {};
            activeGoal.completedDates = [];
        }
    } else {
        activeGoal = {
            id: Date.now(),
            icon: goalIconInput.value.trim() || '\u2022',
            name: goalNameInput.value,
            target: Number(goalTargetInput.value),
            unit: goalUnitInput.value,
            type: selectedType,
            countInProgress: goalCountProgressInput.checked,
            trackInJourney: goalTrackJourneyInput.checked,
            current: 0,
            dailyAdded: {},
            dailyProgress: {},
            completedDates: []
        };
        goals.push(activeGoal);
    }

    ensureGoalJourneyEntry(activeGoal);

    localStorage.setItem('goals', JSON.stringify(goals));

    renderGoals();
    closeGoalForm();
});

const habitForm = document.getElementById('habit-form');
const habitIconInput = document.getElementById('habit-icon');
const habitNameInput = document.getElementById('habit-name');
const habitCountProgressInput = document.getElementById('habit-count-progress');
const habitSubmitBtn = document.getElementById('habit-submit-btn');
const habitAddToggle = document.getElementById('habit-add-toggle');
const habitCancelBtn = document.getElementById('habit-cancel-btn');
const habitsSubtitle = document.getElementById('habits-subtitle');
const habitList = document.getElementById('habit-list');

let habits = JSON.parse(localStorage.getItem('habits')) || [];
let editingHabitId = null;

function openHabitForm() {
    habitForm.classList.remove('add-form-hidden');
    habitAddToggle.style.display = 'none';
}

function closeHabitForm() {
    habitForm.classList.add('add-form-hidden');
    habitAddToggle.style.display = 'block';
    habitForm.reset();
    editingHabitId = null;
    habitSubmitBtn.textContent = 'Add';
}

habitAddToggle.addEventListener('click', openHabitForm);
habitCancelBtn.addEventListener('click', closeHabitForm);

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
    } else {
        habits.forEach(function (habit) {
            const isDone = habit.completedDates.indexOf(today) !== -1;
            const streak = calculateStreak(habit);
            const streakText = streak > 0 ? '\u{1F525} ' + streak + ' day streak!' : 'No streak yet';
            const notCounted = habit.countInProgress === false;

            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit-item' + (isDone ? ' done' : '');
            habitDiv.innerHTML = `
                <button class="habit-check-btn" onclick="toggleHabit(${habit.id})">${isDone ? '\u2713' : ''}</button>
                <div class="habit-icon">${habit.icon}</div>
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-streak">${streakText}${notCounted ? ' <span class="not-counted-tag">not counted</span>' : ''}</div>
                </div>
                <button class="icon-btn" onclick="editHabit(${habit.id})">\u270f\ufe0f</button>
                <button class="icon-btn" onclick="deleteHabit(${habit.id})">\u{1F5D1}\ufe0f</button>
            `;
            habitList.appendChild(habitDiv);
        });
    }

    updateHeaderScore();
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

function editHabit(id) {
    const habit = habits.find(function (h) { return h.id === id; });
    habitIconInput.value = habit.icon;
    habitNameInput.value = habit.name;
    habitCountProgressInput.checked = habit.countInProgress !== false;
    editingHabitId = id;
    habitSubmitBtn.textContent = 'Save';
    openHabitForm();
    habitNameInput.focus();
}

function deleteHabit(id) {
    const confirmed = confirm('Delete this habit? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    habits = habits.filter(function (h) { return h.id !== id; });
    localStorage.setItem('habits', JSON.stringify(habits));

    if (editingHabitId === id) {
        closeHabitForm();
    }

    renderHabits();
}

habitForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (editingHabitId !== null) {
        const habit = habits.find(function (h) { return h.id === editingHabitId; });
        habit.icon = habitIconInput.value.trim() || '\u2022';
        habit.name = habitNameInput.value;
        habit.countInProgress = habitCountProgressInput.checked;
    } else {
        habits.push({
            id: Date.now(),
            icon: habitIconInput.value.trim() || '\u2022',
            name: habitNameInput.value,
            countInProgress: habitCountProgressInput.checked,
            completedDates: []
        });
    }

    localStorage.setItem('habits', JSON.stringify(habits));

    renderHabits();
    closeHabitForm();
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

const headerScoreEl = document.getElementById('header-score');
const headerTimeEl = document.getElementById('header-time');
const powerValueEl = document.getElementById('power-value');
const powerMessageEl = document.getElementById('power-message');
const routineScoreEl = document.getElementById('routine-score');
const habitScoreEl = document.getElementById('habit-score');
const goalScoreEl = document.getElementById('goal-score');
const moodSlider = document.getElementById('mood-slider');
const energySlider = document.getElementById('energy-slider');
const moodDisplayEl = document.getElementById('mood-display');
const energyDisplayEl = document.getElementById('energy-display');
const shareBtn = document.getElementById('share-btn');

let dailyState = JSON.parse(localStorage.getItem('dailyState')) || {};
let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || {};

function getTodayState() {
    const today = getTodayString();
    if (!dailyState[today]) {
        dailyState[today] = { mood: 5, energy: 5 };
    }
    return dailyState[today];
}

function getOverallScore() {
    const today = getTodayString();
    const scores = [];

    let routinePercent = 0;
    const countedTasks = tasks.filter(function (t) { return t.countInProgress !== false; });
    if (countedTasks.length > 0) {
        const doneToday = countedTasks.filter(function (t) { return t.completedDates.indexOf(today) !== -1; }).length;
        routinePercent = Math.round((doneToday / countedTasks.length) * 100);
        scores.push(routinePercent);
    }

    let habitPercent = 0;
    const countedHabits = habits.filter(function (h) { return h.countInProgress !== false; });
    if (countedHabits.length > 0) {
        const doneToday = countedHabits.filter(function (h) { return h.completedDates.indexOf(today) !== -1; }).length;
        habitPercent = Math.round((doneToday / countedHabits.length) * 100);
        scores.push(habitPercent);
    }

    let goalPercent = 0;
    const countedGoals = goals.filter(function (g) { return g.countInProgress !== false; });
    if (countedGoals.length > 0) {
        const total = countedGoals.reduce(function (sum, g) { return sum + getGoalTodayScore(g); }, 0);
        goalPercent = Math.round(total / countedGoals.length);
        scores.push(goalPercent);
    }

    const overall = scores.length > 0 ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : 0;

    return { overall: overall, routinePercent: routinePercent, habitPercent: habitPercent, goalPercent: goalPercent };
}

function getPowerMessage(score) {
    if (score >= 76) {
        return 'ABSOLUTE LEGEND! \u{1F3C6}';
    }
    if (score >= 51) {
        return 'ON FIRE TODAY \u{1F525}';
    }
    if (score >= 26) {
        return 'KEEP PUSHING!';
    }
    return 'LET\u2019S GOOO, START NOW!';
}

function getScoreColorClass(score) {
    if (score >= 76) {
        return 'score-green';
    }
    if (score >= 51) {
        return 'score-cyan';
    }
    if (score >= 26) {
        return 'score-amber';
    }
    return 'score-red';
}

function updateHeaderScore() {
    const result = getOverallScore();
    const colorClass = getScoreColorClass(result.overall);

    headerScoreEl.textContent = result.overall + '%';
    headerScoreEl.className = 'header-score ' + colorClass;
    headerTimeEl.textContent = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

    logTodayScore(result.overall);
    updatePinnedGoalJourneys();
}

function logTodayScore(overall) {
    const today = getTodayString();
    scoreHistory[today] = overall;
    localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
}

function getUrgentNudge() {
    const today = getTodayString();
    const notDoneToday = habits.filter(function (h) { return h.completedDates.indexOf(today) === -1; });

    if (notDoneToday.length === 0) {
        return null;
    }

    let weakest = notDoneToday[0];
    notDoneToday.forEach(function (h) {
        if (calculateStreak(h) < calculateStreak(weakest)) {
            weakest = h;
        }
    });

    return weakest;
}

function renderUrgentCard() {
    const container = document.getElementById('urgent-card-container');
    const nudge = getUrgentNudge();

    if (!nudge) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="urgent-card">
            <div class="urgent-badge">Not Done Yet</div>
            <div class="urgent-text">${nudge.icon} <strong>${nudge.name}</strong> is still pending today.</div>
            <div class="urgent-fix">Fix: Do a 2 minute version right now. That still counts.</div>
        </div>
    `;
}

function renderOverview() {
    const result = getOverallScore();
    const colorClass = getScoreColorClass(result.overall);

    powerValueEl.textContent = result.overall + '%';
    powerValueEl.className = 'power-value ' + colorClass;
    powerMessageEl.textContent = getPowerMessage(result.overall);

    routineScoreEl.textContent = result.routinePercent + '%';
    habitScoreEl.textContent = result.habitPercent + '%';
    goalScoreEl.textContent = result.goalPercent + '%';

    const state = getTodayState();
    moodSlider.value = state.mood;
    energySlider.value = state.energy;
    moodDisplayEl.textContent = state.mood;
    energyDisplayEl.textContent = state.energy;

    renderUrgentCard();
    updateHeaderScore();
}

moodSlider.addEventListener('input', function () {
    const state = getTodayState();
    state.mood = Number(moodSlider.value);
    localStorage.setItem('dailyState', JSON.stringify(dailyState));
    moodDisplayEl.textContent = state.mood;
});

energySlider.addEventListener('input', function () {
    const state = getTodayState();
    state.energy = Number(energySlider.value);
    localStorage.setItem('dailyState', JSON.stringify(dailyState));
    energyDisplayEl.textContent = state.energy;
});

shareBtn.addEventListener('click', function () {
    const result = getOverallScore();
    const summary = 'My Daily Life Tracker report \u2014 ' + getShortDate() + '\nOverall: ' + result.overall + '%\nRoutine: ' + result.routinePercent + '%\nHabits: ' + result.habitPercent + '%\nGoals: ' + result.goalPercent + '%';

    if (navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(function () {
            alert('Copied to clipboard. Paste it wherever you want to share it.');
        });
    } else {
        alert(summary);
    }
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
        const state = dailyState[date];
        const moodText = state ? state.mood + '/10' : '\u2013';
        const energyText = state ? state.energy + '/10' : '\u2013';
        const sessionsText = sessionLog[date] || 0;

        const row = document.createElement('div');
        row.className = 'history-row';
        row.innerHTML = `
            <div class="history-row-top">
                <span class="history-date">${date}</span>
                <span class="history-score">${scoreHistory[date]}%</span>
            </div>
            <div class="history-row-detail">
                <span>\u{1F60A} ${moodText}</span>
                <span>\u26a1 ${energyText}</span>
                <span>\u23f1\ufe0f ${sessionsText} sessions</span>
            </div>
        `;
        historyList.appendChild(row);
    });
}

let journeyPeriod = '7d';

const journeyToggleBtns = document.querySelectorAll('.journey-toggle-btn');

journeyToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        journeyToggleBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        journeyPeriod = btn.getAttribute('data-period');
        renderJourney();
    });
});

function buildDailyBars(numDays, labelType) {
    const bars = [];

    for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const label = labelType === 'weekday' ? d.toLocaleDateString('en', { weekday: 'short' }) : d.getDate();
        const score = scoreHistory[dateStr] !== undefined ? scoreHistory[dateStr] : 0;
        bars.push({ label: label, score: score });
    }

    return bars;
}

function buildTrackedSeries(numDays) {
    const series = [];

    for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const tracked = scoreHistory[dateStr] !== undefined;
        series.push({ date: d, tracked: tracked, score: tracked ? scoreHistory[dateStr] : 0 });
    }

    return series;
}

function formatDayMonth(d) {
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

function formatMonthOnly(d) {
    return d.toLocaleDateString('en', { month: 'short' });
}

function renderWaveformChart(container, series) {
    let barsHtml = '';

    series.forEach(function (point) {
        const height = point.tracked ? Math.max(point.score, 3) : 3;
        const cls = 'waveform-bar-fill' + (point.tracked ? '' : ' untracked');
        barsHtml += '<div class="waveform-bar"><div class="' + cls + '" style="height: ' + height + '%"></div></div>';
    });

    container.innerHTML = barsHtml;
}

function renderJourney() {
    const journeyChart = document.getElementById('journey-chart');

    if (journeyPeriod === '7d') {
        journeyChart.className = 'journey-chart';
        journeyChart.innerHTML = '';

        const bars = buildDailyBars(7, 'weekday');
        bars.forEach(function (bar) {
            const barDiv = document.createElement('div');
            barDiv.className = 'journey-bar';
            barDiv.innerHTML = `
                <div class="journey-bar-track">
                    <div class="journey-bar-fill" style="height: ${bar.score}%"></div>
                </div>
                <div class="journey-bar-value">${bar.score}%</div>
                <div class="journey-bar-label">${bar.label}</div>
            `;
            journeyChart.appendChild(barDiv);
        });
        return;
    }

    let numDays = 30;
    let labelCount = 5;
    let formatFn = formatDayMonth;

    if (journeyPeriod === '3m') {
        numDays = 90;
    } else if (journeyPeriod === '6m') {
        numDays = 182;
        labelCount = 6;
        formatFn = formatMonthOnly;
    } else if (journeyPeriod === '1y') {
        numDays = 365;
        labelCount = 6;
        formatFn = formatMonthOnly;
    }

    const series = buildTrackedSeries(numDays);

    journeyChart.className = 'journey-chart-container';
    journeyChart.innerHTML = '<div class="waveform-chart"></div><div class="waveform-labels"></div>';

    renderWaveformChart(journeyChart.querySelector('.waveform-chart'), series);

    const labelsEl = journeyChart.querySelector('.waveform-labels');
    const lastIndex = series.length - 1;
    let labelsHtml = '';

    for (let i = 0; i < labelCount; i++) {
        const index = Math.round((i / (labelCount - 1)) * lastIndex);
        const x = (index / lastIndex) * 100;
        labelsHtml += '<span style="left: ' + x.toFixed(1) + '%">' + formatFn(series[index].date) + '</span>';
    }

    labelsEl.innerHTML = labelsHtml;
}

let goalJourneys = JSON.parse(localStorage.getItem('goalJourneys')) || [];

function ensureGoalJourneyEntry(goal) {
    if (!goal.trackInJourney) {
        return;
    }

    const exists = goalJourneys.find(function (e) { return e.id === goal.id; });
    if (!exists) {
        goalJourneys.push({
            id: goal.id,
            icon: goal.icon,
            name: goal.name,
            target: goal.target,
            unit: goal.unit,
            type: goal.type,
            amount: getGoalCurrentAmount(goal),
            active: true
        });
    }
}

function updatePinnedGoalJourneys() {
    goalJourneys.forEach(function (entry) {
        const liveGoal = goals.find(function (g) { return g.id === entry.id; });
        const stillPinned = liveGoal && liveGoal.trackInJourney;

        if (stillPinned) {
            entry.icon = liveGoal.icon;
            entry.name = liveGoal.name;
            entry.target = liveGoal.target;
            entry.unit = liveGoal.unit;
            entry.type = liveGoal.type;
            entry.amount = getGoalCurrentAmount(liveGoal);
            entry.active = true;
        } else {
            entry.active = false;
        }
    });

    localStorage.setItem('goalJourneys', JSON.stringify(goalJourneys));
}

function removeGoalJourneyEntry(id) {
    const confirmed = confirm('Remove this goal from Journey? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    goalJourneys = goalJourneys.filter(function (e) { return e.id !== id; });
    localStorage.setItem('goalJourneys', JSON.stringify(goalJourneys));

    const liveGoal = goals.find(function (g) { return g.id === id; });
    if (liveGoal) {
        liveGoal.trackInJourney = false;
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    renderGoalJourneys();
}

function renderGoalJourneys() {
    const container = document.getElementById('goal-journey-list');
    container.innerHTML = '';

    if (goalJourneys.length === 0) {
        container.innerHTML = '<p class="empty">No goals pinned yet. Open a goal and turn on "Track in Journey".</p>';
        return;
    }

    goalJourneys.forEach(function (entry) {
        const percent = Math.min(100, Math.round((entry.amount / entry.target) * 100));
        const isAchieved = percent >= 100;
        const remaining = Math.max(0, entry.target - entry.amount);

        let subtitle = entry.amount + ' of ' + entry.target;
        if (entry.type === 'daily_checkoff') {
            subtitle += ' days';
        } else if (entry.type === 'daily_quota') {
            subtitle = 'Today: ' + entry.amount + ' of ' + entry.target + ' ' + entry.unit;
        } else if (entry.unit) {
            subtitle += ' ' + entry.unit;
        }

        const checkpoints = [0, 25, 50, 75, 100];
        let dotsHtml = '';
        let labelsHtml = '';

        checkpoints.forEach(function (cp, index) {
            const filled = percent >= cp;
            let posClass = '';
            if (index === 0) {
                posClass = ' dot-first';
            } else if (index === checkpoints.length - 1) {
                posClass = ' dot-last';
            }
            dotsHtml += '<div class="milestone-dot' + posClass + (filled ? ' filled' : '') + '" style="left: ' + cp + '%"></div>';
            labelsHtml += '<span>' + (cp === 100 ? '\u{1F3C6}' : cp + '%') + '</span>';
        });

        const card = document.createElement('div');
        card.className = 'milestone-card' + (isAchieved ? ' achieved' : '');
        card.innerHTML = `
            <div class="milestone-top">
                <div class="milestone-icon">${entry.icon}</div>
                <div class="milestone-info">
                    <div class="milestone-name">${entry.name}${entry.active ? '' : ' <span class="not-counted-tag">goal removed</span>'}</div>
                    <div class="milestone-sub">${subtitle}</div>
                </div>
                <button class="icon-btn milestone-remove" onclick="removeGoalJourneyEntry(${entry.id})">\u{1F5D1}\ufe0f</button>
                <div class="milestone-percent">${percent}%</div>
            </div>
            <div class="milestone-track">
                <div class="milestone-track-fill" style="width: ${percent}%"></div>
                ${dotsHtml}
            </div>
            <div class="milestone-labels">${labelsHtml}</div>
            ${isAchieved
                ? '<div class="milestone-achieved">\u{1F389} GOAL ACHIEVED!</div>'
                : '<div class="milestone-bottom"><span class="milestone-remaining">' + remaining + ' more to go</span></div>'}
        `;
        container.appendChild(card);
    });
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
        scoreHistory: scoreHistory,
        goalJourneys: goalJourneys
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
            goalJourneys = data.goalJourneys || [];

            goals.forEach(function (g) {
                if (!g.type) {
                    g.type = g.resetsDaily ? 'daily_quota' : 'lifetime';
                }
                g.dailyAdded = g.dailyAdded || {};
                g.dailyProgress = g.dailyProgress || {};
                g.completedDates = g.completedDates || [];
                if (typeof g.trackInJourney !== 'boolean') {
                    g.trackInJourney = false;
                }
            });

            localStorage.setItem('userName', userName);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('goals', JSON.stringify(goals));
            localStorage.setItem('habits', JSON.stringify(habits));
            localStorage.setItem('sessionLog', JSON.stringify(sessionLog));
            localStorage.setItem('dailyState', JSON.stringify(dailyState));
            localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
            localStorage.setItem('goalJourneys', JSON.stringify(goalJourneys));

            document.getElementById('greeting').textContent = '\u{1F464} ' + userName + ' \u00b7 ' + getFormattedDate();
            renderRoutine();
            renderGoals();
            renderHabits();
            renderOverview();

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
renderOverview();