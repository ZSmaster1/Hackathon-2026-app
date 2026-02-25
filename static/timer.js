let timers = [];
let currentTimerIndex = -1;
let intervalId = null;
let isRunning = false;
let isPaused = false;
let timerIdCounter = 0;

let queueEl = document.getElementById('timerQueue');
let emptyEl = document.getElementById('emptyState');
let controlsEl = document.getElementById('globalControls');
let startBtn = document.getElementById('startAllBtn');
let pauseBtn = document.getElementById('pauseBtn');
let startLabel = document.getElementById('startLabel');
let summaryEl = document.getElementById('completedSummary');

document.getElementById('addTimerBtn').addEventListener('click', function () {
    let nameInput = document.getElementById('timerName');
    let minInput = document.getElementById('timerMinutes');
    let secInput = document.getElementById('timerSeconds');
    let name = nameInput.value.trim() || 'Timer ' + (timers.length + 1);
    let mins = parseInt(minInput.value) || 0;
    let secs = parseInt(secInput.value) || 0;
    let totalSec = mins * 60 + secs;
    if (totalSec < 1) totalSec = 60;
    addTimer(name, totalSec);
    nameInput.value = '';
    minInput.value = '25';
    secInput.value = '0';
    nameInput.focus();
});

// Enter key support
document.getElementById('timerName').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('addTimerBtn').click(); });
document.getElementById('timerMinutes').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('addTimerBtn').click(); });
document.getElementById('timerSeconds').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('addTimerBtn').click(); });

function addPreset(name, mins, secs) {
    addTimer(name, mins * 60 + secs);
}

function addTimer(name, totalSeconds) {
    let id = ++timerIdCounter;
    timers.push({
        id: id,
        name: name,
        totalSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        status: 'pending' // pending | active | done | skipped
    });
    render();
}

// === Render ===
function render() {
    summaryEl.classList.add('hidden');

    if (timers.length === 0) {
        emptyEl.classList.remove('hidden');
        controlsEl.classList.add('hidden');
        queueEl.innerHTML = '';
        return;
    }

    emptyEl.classList.add('hidden');
    controlsEl.classList.remove('hidden');
    controlsEl.classList.add('flex');

    // Show/hide buttons based on state
    if (isRunning && !isPaused) {
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        pauseBtn.classList.add('flex');
    } else if (isPaused) {
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startLabel.textContent = 'Resume';
    } else {
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startLabel.textContent = 'Start All';
    }

    queueEl.innerHTML = '';

    timers.forEach(function (timer, index) {
        let card = document.createElement('div');
        card.className = 'timer-card';
        card.style.animationDelay = (index * 0.06) + 's';

        let isDone = timer.status === 'done' || timer.status === 'skipped';
        let isActive = timer.status === 'active';
        let isPending = timer.status === 'pending';

        // Card colors
        let borderClass = isActive ? 'border-primary' : isDone ? 'border-green-200' : 'border-border';
        let bgClass = isDone ? 'bg-green-50/50' : 'bg-card';
        let pulseClass = isActive ? 'timer-active' : '';

        card.innerHTML =
            '<div class="flex items-center gap-5 rounded-2xl border-2 ' + borderClass + ' ' + bgClass + ' ' + pulseClass + ' p-5 transition-all">' +
            '<!-- Ring -->' +
            '<div class="relative shrink-0">' +
            buildRingSVG(timer) +
            '<div class="absolute inset-0 flex items-center justify-center">' +
            '<span class="text-xs font-bold ' + (isDone ? 'text-green-600' : isActive ? 'text-primary' : 'text-foreground') + '">' +
            (isDone ? (timer.status === 'skipped' ? 'Skip' : 'Done') : formatTime(timer.remainingSeconds)) +
            '</span>' +
            '</div>' +
            '</div>' +
            '<!-- Info -->' +
            '<div class="flex-1 min-w-0">' +
            '<div class="flex items-center gap-2 mb-0.5">' +
            (isActive ? '<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span></span>' : '') +
            '<h3 class="text-base font-bold truncate ' + (isDone ? 'text-muted-foreground line-through' : 'text-foreground') + '">' + escapeHtml(timer.name) + '</h3>' +
            '</div>' +
            '<p class="text-xs text-muted-foreground">' +
            (isDone ? (timer.status === 'skipped' ? 'Skipped' : 'Completed') :
                isActive ? 'In progress' :
                    'Duration: ' + formatTimeFull(timer.totalSeconds)) +
            '</p>' +
            '</div>' +
            '<!-- Time display -->' +
            '<div class="text-right mr-2">' +
            '<p class="text-2xl font-extrabold tabular-nums ' + (isDone ? 'text-green-600' : isActive ? 'text-primary' : 'text-foreground') + '">' + formatTime(timer.remainingSeconds) + '</p>' +
            '<p class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">' + (isActive ? 'remaining' : isDone ? '' : 'duration') + '</p>' +
            '</div>' +
            '<!-- Actions -->' +
            '<div class="flex flex-col gap-2 shrink-0">' +
            (isActive ?
                '<button onclick="skipTimer(' + timer.id + ')" title="Skip" class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">' +
                '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>' +
                '</button>' :
                isPending ?
                    '<button onclick="skipTimer(' + timer.id + ')" title="Skip" class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">' +
                    '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>' +
                    '</button>' : '') +
            (!isRunning || isDone ?
                '<button onclick="removeTimer(' + timer.id + ')" title="Remove" class="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors">' +
                '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>' +
                '</button>' : '') +
            '</div>' +
            '</div>';

        queueEl.appendChild(card);
    });
}

function buildRingSVG(timer) {
    let size = 60;
    let strokeW = 5;
    let radius = (size - strokeW) / 2;
    let circ = 2 * Math.PI * radius;
    let progress = timer.totalSeconds > 0 ? (timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds : 0;
    if (timer.status === 'done' || timer.status === 'skipped') progress = 1;
    let offset = circ - progress * circ;
    let color = (timer.status === 'done' || timer.status === 'skipped') ? '#22c55e' : timer.status === 'active' ? '#7c5cfc' : '#d4ccf0';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
        '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + radius + '" fill="none" stroke="#e3dff0" stroke-width="' + strokeW + '" />' +
        '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="' + strokeW + '" ' +
        'stroke-linecap="round" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '" ' +
        'style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 0.4s ease;" />' +
        '</svg>';
}

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function formatTimeFull(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    if (s === 0) return m + 'm';
    return m + 'm ' + s + 's';
}

function escapeHtml(str) {
    let div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Queue controls ===
function startQueue() {
    if (isPaused) {
        isPaused = false;
        isRunning = true;
        tick();
        render();
        return;
    }

    // Find first pending timer
    let idx = timers.findIndex(function (t) { return t.status === 'pending'; });
    if (idx === -1) return;

    isRunning = true;
    isPaused = false;
    currentTimerIndex = idx;
    timers[idx].status = 'active';
    render();
    tick();
}

function tick() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(function () {
        if (!isRunning || isPaused) return;

        let timer = timers[currentTimerIndex];
        if (!timer) { stopAll(); return; }

        timer.remainingSeconds--;
        render();

        if (timer.remainingSeconds <= 0) {
            timer.remainingSeconds = 0;
            timer.status = 'done';
            advanceToNext();
        }
    }, 1000);
}

function advanceToNext() {
    let nextIdx = timers.findIndex(function (t) { return t.status === 'pending'; });
    if (nextIdx === -1) {
        stopAll();
        showSummary();
        return;
    }
    currentTimerIndex = nextIdx;
    timers[nextIdx].status = 'active';
    render();
}

function pauseQueue() {
    isPaused = true;
    render();
}

function skipTimer(id) {
    let idx = timers.findIndex(function (t) { return t.id === id; });
    if (idx === -1) return;

    timers[idx].status = 'skipped';
    timers[idx].remainingSeconds = 0;

    if (isRunning && idx === currentTimerIndex) {
        advanceToNext();
    }
    render();
}

function removeTimer(id) {
    timers = timers.filter(function (t) { return t.id !== id; });
    render();
}

function resetAll() {
    if (intervalId) clearInterval(intervalId);
    isRunning = false;
    isPaused = false;
    currentTimerIndex = -1;
    timers.forEach(function (t) {
        t.remainingSeconds = t.totalSeconds;
        t.status = 'pending';
    });
    summaryEl.classList.add('hidden');
    render();
}

function stopAll() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    isPaused = false;
    currentTimerIndex = -1;
    render();
}

function showSummary() {
    let total = timers.reduce(function (acc, t) { return acc + t.totalSeconds; }, 0);
    let m = Math.floor(total / 60);
    let s = total % 60;
    document.getElementById('totalTime').textContent = m + 'm ' + s + 's';
    summaryEl.classList.remove('hidden');
}

// Initial render
render();

fetch('/user', { method: 'GET' }).then((res) => {
    res.json().then((data) => {

        const avgs = [];

        for (let course of data.courses) {
            const mark = course?.categories?.avg;
            if (mark != null) {
                avgs.push(mark);
                /*const schedule = [
                    ['Study', 30],
                    ['break', 30],
                    ['study', 10]
                ]*/


                delete course.categories.avg;

                const sections = {...course.categories};
                const sorted = Object.entries(sections).sort((a, b) => b[1] - a[1]);
                const times = [45, 30, 25, 15];

                let i = 0;
                const schedule = sorted.map((sector) => {
                    console.log(sector);
                    sector[0] = 'Study ' + sector[0].charAt(0).toUpperCase() + sector[0].slice(1);
                    sector[1] = times[i];
                    i++;
                    return sector;
                });

                console.log(schedule);

                const breaks = [
                    'Water Break',
                    'Walking Break',
                    'Active Recall',
                    'Misc Break'
                ]

                let onclick = '';
                for(const time of schedule) {
                    onclick += `
                    addPreset('${time[0]}', ${time[1]}, 0);
                    addPreset('${breaks[Math.floor(Math.random()*breaks.length)]}', 15, 0);
                    `
                }

                document.querySelector('#presets').innerHTML += `
                <button onclick="${onclick}"
                    class="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">${course.course}
                </button>
                `
            }
        }

    })
})