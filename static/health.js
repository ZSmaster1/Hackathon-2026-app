let gender = 'male';
let goal = 'maintain';
let mealCount = 1;
let proteinLevel = 1;

let result = null;

let activityDescriptions = [
    'Sedentary: Little to no exercise, desk job.',
    'Light: Light exercise 1-3 days per week.',
    'Moderate: Burns an additional 400-650 calories for females or 500-800 calories for males.',
    'Active: Hard exercise 6-7 days per week.',
    'Very Active: Very hard exercise, physical job or training twice a day.'
];
let activityMultipliers = [1.2, 1.375, 1.55, 1.725, 1.9];

function setGender(g) {
    gender = g;
    document.getElementById('genderMale').className = 'flex-1 py-3 text-sm font-bold transition-colors ' +
        (g === 'male' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent');
    document.getElementById('genderFemale').className = 'flex-1 py-3 text-sm font-bold transition-colors ' +
        (g === 'female' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent');
}

function updateActivity() {
    let val = parseInt(document.getElementById('activitySlider').value);
    document.getElementById('activityDesc').textContent = activityDescriptions[val];
}

function setGoal(g) {
    goal = g;
    document.querySelectorAll('.goal-btn').forEach(function (btn) {
        let isActive = btn.getAttribute('data-goal') === g;
        btn.className = 'goal-btn flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wide transition-colors ' +
            (isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-accent');
    });
}

function setMeals(count) {
    mealCount = count;
    document.querySelectorAll('.meal-btn').forEach(function (btn) {
        let isActive = parseInt(btn.getAttribute('data-meals')) === count;
        btn.className = 'meal-btn flex-1 py-2.5 text-xs font-bold transition-colors ' +
            (isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent');
    });
    if (result) updateMealBreakdown();
}

function adjustProtein() {
    proteinLevel = parseInt(document.getElementById('proteinSlider').value);
    if (result) recalcMacros();
}

function calculate() {
    let age = parseInt(document.getElementById('inputAge').value) || 24;
    let weight = parseFloat(document.getElementById('inputWeight').value) || 72;
    let height = parseFloat(document.getElementById('inputHeight').value) || 182;
    let activityIdx = parseInt(document.getElementById('activitySlider').value);

    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let tdee = bmr * activityMultipliers[activityIdx];

    let goalMultipliers = {
        'lose': -500,
        'lose10': -0.1 * tdee,
        'maintain': 0,
        'gain': 400
    };
    let kcal = Math.round(tdee + (goalMultipliers[goal] || 0));
    if (kcal < 1200) kcal = 1200;

    result = { kcal: kcal, weight: weight };
    recalcMacros();

    document.getElementById('resultEmpty').classList.add('hidden');
    document.getElementById('resultFilled').classList.remove('hidden');
}

function recalcMacros() {
    if (!result) return;

    let kcal = result.kcal;
    let weight = result.weight;

    let proteinPerKg = [0.8, 1.2, 1.8][proteinLevel];
    let proteinG = Math.round(weight * proteinPerKg);
    let proteinCal = proteinG * 4;

    let fatCal = Math.round((kcal - proteinCal) * 0.3);
    let fatG = Math.round(fatCal / 9);

    let carbsCal = kcal - proteinCal - fatCal;
    let carbsG = Math.round(carbsCal / 4);

    let carbsPct = ((carbsCal / kcal) * 100).toFixed(1);
    let proteinPct = ((proteinCal / kcal) * 100).toFixed(1);
    let fatPct = ((fatCal / kcal) * 100).toFixed(1);

    result.carbs = carbsG;
    result.protein = proteinG;
    result.fat = fatG;
    result.carbsPct = carbsPct;
    result.proteinPct = proteinPct;
    result.fatPct = fatPct;

    document.getElementById('kcalNumber').textContent = kcal;
    document.getElementById('carbsSummary').textContent = carbsG + 'g / ' + carbsPct + '%';
    document.getElementById('proteinSummary').textContent = proteinG + 'g / ' + proteinPct + '%';
    document.getElementById('fatSummary').textContent = fatG + 'g / ' + fatPct + '%';

    updateDonut(parseFloat(carbsPct), parseFloat(proteinPct), parseFloat(fatPct));

    updateMealBreakdown();
}

function updateDonut(carbsPct, proteinPct, fatPct) {
    let circumference = 2 * Math.PI * 48;

    let carbLen = (carbsPct / 100) * circumference;
    let proteinLen = (proteinPct / 100) * circumference;
    let fatLen = (fatPct / 100) * circumference;

    let gap = 4;

    let carbEl = document.getElementById('donutCarb');
    carbEl.setAttribute('stroke-dasharray', (carbLen - gap) + ' ' + (circumference - carbLen + gap));
    carbEl.setAttribute('stroke-dashoffset', '0');

    let proteinEl = document.getElementById('donutProtein');
    proteinEl.setAttribute('stroke-dasharray', (proteinLen - gap) + ' ' + (circumference - proteinLen + gap));
    proteinEl.setAttribute('stroke-dashoffset', '-' + carbLen);

    let fatEl = document.getElementById('donutFat');
    fatEl.setAttribute('stroke-dasharray', (fatLen - gap) + ' ' + (circumference - fatLen + gap));
    fatEl.setAttribute('stroke-dashoffset', '-' + (carbLen + proteinLen));
}

function updateMealBreakdown() {
    if (!result) return;
    let m = mealCount < 1 ? 1 : mealCount;
    document.getElementById('mealKcal').textContent = Math.round(result.kcal / m);
    document.getElementById('mealCarbs').textContent = Math.round(result.carbs / m) + 'g';
    document.getElementById('mealProtein').textContent = Math.round(result.protein / m) + 'g';
    document.getElementById('mealFat').textContent = Math.round(result.fat / m) + 'g';
}

function clearForm() {
    document.getElementById('inputAge').value = '24';
    document.getElementById('inputWeight').value = '72';
    document.getElementById('inputHeight').value = '182';
    document.getElementById('activitySlider').value = '2';
    updateActivity();
    setGender('male');
    setGoal('maintain');
    result = null;
    document.getElementById('resultEmpty').classList.remove('hidden');
    document.getElementById('resultFilled').classList.add('hidden');
}

updateActivity();