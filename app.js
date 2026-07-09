(function () {
  'use strict';

  var STORAGE_KEY = 'fittrack_v1';

  var UNIT_WORDS = {
    piece: 1, pieces: 1, slice: 1, slices: 1, cup: 1, cups: 1,
    tbsp: 1, tablespoon: 1, tablespoons: 1, tsp: 1, teaspoon: 1, teaspoons: 1,
    scoop: 1, scoops: 1, can: 1, cans: 1, bowl: 1, bowls: 1, bar: 1, bars: 1,
    glass: 1, glasses: 1, handful: 1, handfuls: 1, serving: 1, servings: 1,
    roll: 1, rolls: 1, strip: 1, strips: 1,
  };
  Object.keys(GLOBAL_UNITS).forEach(function (k) { UNIT_WORDS[k] = 1; });

  var EXERCISES = [
    'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
    'Pull Up', 'Push Up', 'Lat Pulldown', 'Leg Press', 'Bicep Curl',
    'Tricep Extension', 'Lunges', 'Plank', 'Running', 'Cycling',
    'Shoulder Press', 'Dumbbell Fly', 'Leg Curl', 'Leg Extension',
    'Calf Raise', 'Hip Thrust', 'Face Pull',
  ];

  // ---------- State / storage ----------

  function defaultSettings() {
    return {
      sex: 'male', age: 30, heightCm: 175, weightKg: 75,
      activity: 1.55, goal: 'maintain',
      calOverride: null, proteinOverride: null, waterGoalMl: null,
      stepGoal: 10000,
    };
  }

  function defaultDay() {
    return { steps: 0, stepLog: [], water: 0, waterLog: [], food: [], workouts: [] };
  }

  var isFirstRun = !localStorage.getItem(STORAGE_KEY);

  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { settings: defaultSettings(), days: {} };
      var parsed = JSON.parse(raw);
      parsed.settings = Object.assign(defaultSettings(), parsed.settings || {});
      parsed.days = parsed.days || {};
      return parsed;
    } catch (e) {
      return { settings: defaultSettings(), days: {} };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getDay(dateStr) {
    if (!state.days[dateStr]) state.days[dateStr] = defaultDay();
    var d = state.days[dateStr];
    if (!d.stepLog) d.stepLog = [];
    if (!d.waterLog) d.waterLog = [];
    if (!d.food) d.food = [];
    if (!d.workouts) d.workouts = [];
    return d;
  }

  // ---------- Date helpers ----------

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return fmtDate(new Date()); }
  function weekdayShort(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
  }
  function getRecentDates(n) {
    var arr = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(fmtDate(d));
    }
    return arr;
  }
  function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function round1(n) { return Math.round(n * 10) / 10; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  // ---------- Nutrition math ----------

  function bmr(settings) {
    var base = 10 * settings.weightKg + 6.25 * settings.heightCm - 5 * settings.age;
    return settings.sex === 'female' ? base - 161 : base + 5;
  }
  function tdee(settings) { return bmr(settings) * parseFloat(settings.activity); }
  function calorieTarget(settings) {
    if (settings.calOverride) return Math.round(settings.calOverride);
    var t = tdee(settings);
    if (settings.goal === 'lose') t -= 500;
    if (settings.goal === 'gain') t += 300;
    return Math.round(t / 10) * 10;
  }
  function proteinTarget(settings) {
    if (settings.proteinOverride) return Math.round(settings.proteinOverride);
    return Math.round(settings.weightKg * 1.6);
  }
  function waterGoal(settings) {
    if (settings.waterGoalMl) return Math.round(settings.waterGoalMl);
    return Math.round((settings.weightKg * 35) / 50) * 50;
  }

  // ---------- Food text parsing ----------

  function parseQuantityAndUnit(segment) {
    var s = segment.replace(/(\d)([a-zA-Z])/g, '$1 $2').trim();
    var words = s.split(/\s+/).filter(Boolean);
    var idx = 0;
    var qty = null;

    if (words.length) {
      var w0 = words[0].toLowerCase();
      if (/^\d+\.\d+$/.test(w0) || /^\d+$/.test(w0)) {
        qty = parseFloat(w0); idx = 1;
      } else if (/^\d+\/\d+$/.test(w0)) {
        var parts = w0.split('/'); qty = parseFloat(parts[0]) / parseFloat(parts[1]); idx = 1;
      } else if (NUMBER_WORDS.hasOwnProperty(w0)) {
        qty = NUMBER_WORDS[w0]; idx = 1;
      }
    }

    var unit = null;
    if (idx < words.length) {
      var w1 = words[idx].toLowerCase().replace(/[.,]$/, '');
      if (UNIT_WORDS.hasOwnProperty(w1)) { unit = w1; idx++; }
    }
    if (idx < words.length && words[idx].toLowerCase() === 'of') idx++;

    var foodQuery = words.slice(idx).join(' ').toLowerCase().replace(/[.!?]+$/, '').trim();
    return { qty: qty, unit: unit, foodQuery: foodQuery };
  }

  function matchFood(query) {
    query = query.replace(/^(a|an|some|the)\s+/, '').trim();
    if (!query) return null;
    var best = null, bestScore = 0;
    for (var i = 0; i < FOOD_DB.length; i++) {
      var food = FOOD_DB[i];
      for (var j = 0; j < food.aliases.length; j++) {
        var alias = food.aliases[j];
        var score = 0;
        if (query === alias) score = 1000;
        else if (query.indexOf(alias) !== -1) score = alias.length;
        else if (alias.indexOf(query) !== -1 && query.length >= 3) score = query.length * 0.5;
        if (score > bestScore) { bestScore = score; best = food; }
      }
    }
    return bestScore > 0 ? best : null;
  }

  function resolveGrams(food, qty, unit) {
    if (unit) {
      if (food.units && food.units.hasOwnProperty(unit)) return (qty == null ? 1 : qty) * food.units[unit];
      if (GLOBAL_UNITS.hasOwnProperty(unit)) return (qty == null ? 1 : qty) * GLOBAL_UNITS[unit];
      return (qty == null ? 1 : qty) * food.defaultGrams;
    }
    if (qty == null) return food.defaultGrams;
    if (food.primaryUnit === 'g') {
      return qty < 12 ? qty * food.defaultGrams : qty;
    }
    return qty * food.defaultGrams;
  }

  function parseFoodText(text) {
    var segments = text.split(/,|\band\b|\bwith\b|\bplus\b|\n|\+/gi)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
    var items = [], unmatched = [];
    segments.forEach(function (seg) {
      var q = parseQuantityAndUnit(seg);
      var query = q.foodQuery || seg.toLowerCase();
      var food = matchFood(query);
      if (!food) { unmatched.push(seg); return; }
      var grams = resolveGrams(food, q.qty, q.unit);
      var factor = grams / 100;
      items.push({
        name: food.name,
        grams: Math.round(grams),
        cal: Math.round(food.cal * factor),
        protein: round1(food.protein * factor),
        carbs: round1(food.carbs * factor),
        fat: round1(food.fat * factor),
      });
    });
    return { items: items, unmatched: unmatched };
  }

  // ---------- Mutations ----------

  function addSteps(amount, type) {
    var day = getDay(todayStr());
    day.steps = Math.max(0, day.steps + amount);
    day.stepLog.push({ time: Date.now(), amount: amount, type: type });
    save(); renderSteps(); renderDashboard();
  }

  function setStepsTotal(amount) {
    var day = getDay(todayStr());
    var diff = amount - day.steps;
    day.steps = Math.max(0, amount);
    day.stepLog.push({ time: Date.now(), amount: diff, type: 'sync-set' });
    save(); renderSteps(); renderDashboard();
  }

  function addWater(ml) {
    var day = getDay(todayStr());
    day.water += ml;
    day.waterLog.push({ id: uid(), time: Date.now(), ml: ml });
    save(); renderWater(); renderDashboard();
  }

  function removeWaterEntry(id) {
    var day = getDay(todayStr());
    var entry = day.waterLog.find(function (e) { return e.id === id; });
    if (!entry) return;
    day.water = Math.max(0, day.water - entry.ml);
    day.waterLog = day.waterLog.filter(function (e) { return e.id !== id; });
    save(); renderWater(); renderDashboard();
  }

  function addFoodEntry(entry) {
    var day = getDay(todayStr());
    day.food.push(entry);
    save(); renderFood(); renderDashboard();
  }

  function removeFoodEntry(id) {
    var day = getDay(todayStr());
    day.food = day.food.filter(function (e) { return e.id !== id; });
    save(); renderFood(); renderDashboard();
  }

  function addWorkout(workout) {
    var day = getDay(todayStr());
    day.workouts.push(workout);
    save(); renderTraining(); renderDashboard();
  }

  function removeWorkout(dateStr, id) {
    var day = getDay(dateStr);
    day.workouts = day.workouts.filter(function (w) { return w.id !== id; });
    save(); renderTraining(); renderDashboard();
  }

  // ---------- Rendering ----------

  var $ = function (id) { return document.getElementById(id); };

  function renderTopbar(viewName) {
    var titles = { dashboard: 'Dashboard', food: 'Food', steps: 'Steps', water: 'Water', training: 'Training', settings: 'Settings' };
    $('topbarTitle').textContent = titles[viewName] || 'FitTrack';
    $('topbarDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function statCard(label, value, sub, pct, color) {
    return '<div class="stat-card">' +
      '<div class="label">' + label + '</div>' +
      '<div class="value">' + value + '</div>' +
      '<div class="sub">' + sub + '</div>' +
      '<div class="bar"><div style="width:' + Math.round(clamp(pct, 0, 1) * 100) + '%;background:' + color + '"></div></div>' +
      '</div>';
  }

  function renderDashboard() {
    var day = getDay(todayStr());
    var settings = state.settings;
    var calTarget = calorieTarget(settings);
    var proTarget = proteinTarget(settings);
    var wGoal = waterGoal(settings);
    var stepGoalN = settings.stepGoal || 10000;

    var caloriesEaten = day.food.reduce(function (s, e) { return s + e.totalCal; }, 0);
    var proteinEaten = day.food.reduce(function (s, e) { return s + e.totalProtein; }, 0);
    var remaining = calTarget - caloriesEaten;

    var cards = '';
    cards += statCard('Calories', (remaining >= 0 ? remaining.toLocaleString() : 0) + ' left',
      caloriesEaten.toLocaleString() + ' / ' + calTarget.toLocaleString() + ' kcal',
      caloriesEaten / calTarget, 'var(--calories)');
    cards += statCard('Protein', round1(proteinEaten) + 'g',
      round1(proteinEaten) + 'g of ' + proTarget + 'g target',
      proteinEaten / proTarget, 'var(--protein)');
    cards += statCard('Steps', day.steps.toLocaleString(),
      day.steps.toLocaleString() + ' of ' + stepGoalN.toLocaleString(),
      day.steps / stepGoalN, 'var(--steps)');
    cards += statCard('Water', day.water.toLocaleString() + 'ml',
      day.water.toLocaleString() + ' of ' + wGoal.toLocaleString() + 'ml',
      day.water / wGoal, 'var(--water)');
    $('dashCards').innerHTML = cards;

    var wo = $('dashWorkouts');
    if (day.workouts.length === 0) {
      wo.className = 'empty-hint';
      wo.textContent = 'No workouts logged yet today.';
    } else {
      wo.className = 'entry-list';
      wo.innerHTML = day.workouts.map(function (w) { return workoutCardHtml(w, todayStr(), false); }).join('');
      bindWorkoutRemoveButtons(wo);
    }
  }

  // --- Food ---

  function foodEntryBotBubble(entry) {
    return entry.botReply;
  }

  function renderFood() {
    var day = getDay(todayStr());
    var log = $('chatLog');
    if (day.food.length === 0) {
      log.innerHTML = '<div class="chat-bubble bot">Tell me what you ate, e.g. "2 eggs and a banana" or "150g chicken breast with rice".</div>';
    } else {
      log.innerHTML = day.food.map(function (e) {
        return '<div class="chat-bubble user">' + escapeHtml(e.text) + '</div>' +
          '<div class="chat-bubble bot">' + escapeHtml(foodEntryBotBubble(e)) + '</div>';
      }).join('');
    }
    log.scrollTop = log.scrollHeight;

    var list = $('foodEntryList');
    if (day.food.length === 0) {
      list.className = 'empty-hint';
      list.textContent = 'Nothing logged yet.';
    } else {
      list.className = 'entry-list';
      list.innerHTML = day.food.slice().reverse().map(function (e) {
        var names = e.items.length ? e.items.map(function (i) { return i.name; }).join(', ') : e.text;
        return '<div class="entry-item" data-id="' + e.id + '">' +
          '<div><div class="entry-main">' + escapeHtml(names) + '</div>' +
          '<div class="entry-sub">' + fmtTime(e.time) + ' • ' + Math.round(e.totalCal) + ' kcal • ' + round1(e.totalProtein) + 'g protein</div></div>' +
          '<button class="entry-remove" data-remove-food="' + e.id + '">✕</button>' +
          '</div>';
      }).join('');
      Array.prototype.forEach.call(list.querySelectorAll('[data-remove-food]'), function (btn) {
        btn.addEventListener('click', function () { removeFoodEntry(btn.getAttribute('data-remove-food')); });
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function handleChatSubmit(text) {
    var parsed = parseFoodText(text);
    var entry = {
      id: uid(), time: Date.now(), text: text,
      items: parsed.items, unmatched: parsed.unmatched,
      totalCal: parsed.items.reduce(function (s, i) { return s + i.cal; }, 0),
      totalProtein: parsed.items.reduce(function (s, i) { return s + i.protein; }, 0),
      totalCarbs: parsed.items.reduce(function (s, i) { return s + i.carbs; }, 0),
      totalFat: parsed.items.reduce(function (s, i) { return s + i.fat; }, 0),
    };

    var lines = [];
    if (parsed.items.length) {
      parsed.items.forEach(function (i) {
        lines.push(i.name + ' (' + i.grams + 'g) — ' + i.cal + ' kcal, ' + round1(i.protein) + 'g protein');
      });
      lines.push('Total: ' + Math.round(entry.totalCal) + ' kcal, ' + round1(entry.totalProtein) + 'g protein.');
    }
    if (parsed.unmatched.length) {
      lines.push((parsed.items.length ? "Couldn't recognize: " : "I couldn't recognize: ") + parsed.unmatched.join(', ') + '. Try the manual form below, or rephrase like "150g chicken breast".');
    }
    entry.botReply = lines.join('\n');

    addFoodEntry(entry);
  }

  function handleManualFood(name, cal, protein) {
    var entry = {
      id: uid(), time: Date.now(), text: name,
      items: [{ name: name, grams: null, cal: cal, protein: protein, carbs: 0, fat: 0 }],
      unmatched: [],
      totalCal: cal, totalProtein: protein, totalCarbs: 0, totalFat: 0,
    };
    entry.botReply = 'Logged ' + name + ' — ' + Math.round(cal) + ' kcal, ' + round1(protein) + 'g protein.';
    addFoodEntry(entry);
  }

  // --- Steps ---

  var RING_CIRC = 326.7;

  function renderSteps() {
    var day = getDay(todayStr());
    var goal = state.settings.stepGoal || 10000;
    $('stepsValue').textContent = day.steps.toLocaleString();
    $('stepsGoalText').textContent = 'Goal: ' + goal.toLocaleString();
    var pct = clamp(day.steps / goal, 0, 1);
    $('stepsRing').style.strokeDashoffset = RING_CIRC * (1 - pct);
    renderHistoryBars('stepsHistory', getRecentDates(7).map(function (d) {
      return { date: d, value: (state.days[d] || {}).steps || 0 };
    }), goal);
  }

  // --- Water ---

  function renderWater() {
    var day = getDay(todayStr());
    var goal = waterGoal(state.settings);
    $('waterValue').textContent = day.water.toLocaleString();
    $('waterGoalText').textContent = 'Goal: ' + goal.toLocaleString() + ' ml';
    var pct = clamp(day.water / goal, 0, 1);
    $('waterRing').style.strokeDashoffset = RING_CIRC * (1 - pct);

    var list = $('waterEntryList');
    if (day.waterLog.length === 0) {
      list.className = 'empty-hint';
      list.textContent = 'No water logged yet.';
    } else {
      list.className = 'entry-list';
      list.innerHTML = day.waterLog.slice().reverse().map(function (e) {
        return '<div class="entry-item" data-id="' + e.id + '">' +
          '<div><div class="entry-main">' + e.ml + ' ml</div><div class="entry-sub">' + fmtTime(e.time) + '</div></div>' +
          '<button class="entry-remove" data-remove-water="' + e.id + '">✕</button></div>';
      }).join('');
      Array.prototype.forEach.call(list.querySelectorAll('[data-remove-water]'), function (btn) {
        btn.addEventListener('click', function () { removeWaterEntry(btn.getAttribute('data-remove-water')); });
      });
    }

    renderHistoryBars('waterHistory', getRecentDates(7).map(function (d) {
      return { date: d, value: (state.days[d] || {}).water || 0 };
    }), goal);
  }

  function renderHistoryBars(containerId, values, goal) {
    var el = $(containerId);
    el.innerHTML = values.map(function (v) {
      var pct = goal ? clamp(v.value / goal, 0, 1) : 0;
      var h = Math.max(4, Math.round(pct * 100));
      var isToday = v.date === todayStr();
      return '<div class="bh-col">' +
        '<div class="bh-bar" style="height:' + h + '%;' + (isToday ? '' : 'opacity:0.55;') + '"></div>' +
        '<div class="bh-label">' + weekdayShort(v.date) + '</div>' +
        '</div>';
    }).join('');
  }

  // --- Training ---

  function workoutCardHtml(w, dateStr, removable) {
    var setsHtml = w.sets.map(function (s, i) {
      return 'Set ' + (i + 1) + ': ' + s.reps + ' reps × ' + s.weight + 'kg';
    }).join('<br>');
    return '<div class="workout-card" style="margin-bottom:8px">' +
      '<div class="wo-title"><span>' + escapeHtml(w.exercise) + '</span>' +
      '<button class="entry-remove" data-remove-workout="' + w.id + '" data-date="' + dateStr + '">✕</button></div>' +
      '<div class="wo-sets">' + setsHtml + '</div></div>';
  }

  function bindWorkoutRemoveButtons(container) {
    Array.prototype.forEach.call(container.querySelectorAll('[data-remove-workout]'), function (btn) {
      btn.addEventListener('click', function () {
        removeWorkout(btn.getAttribute('data-date'), btn.getAttribute('data-remove-workout'));
      });
    });
  }

  function renderTraining() {
    var today = todayStr();
    var day = getDay(today);
    var list = $('workoutList');
    if (day.workouts.length === 0) {
      list.className = 'empty-hint';
      list.textContent = 'No workouts logged yet today.';
    } else {
      list.className = 'entry-list';
      list.innerHTML = day.workouts.slice().reverse().map(function (w) { return workoutCardHtml(w, today, true); }).join('');
      bindWorkoutRemoveButtons(list);
    }

    var histDates = Object.keys(state.days).filter(function (d) { return d !== today && state.days[d].workouts && state.days[d].workouts.length; }).sort().reverse().slice(0, 14);
    var hist = $('workoutHistory');
    if (histDates.length === 0) {
      hist.className = 'empty-hint';
      hist.textContent = 'No past workouts.';
    } else {
      hist.className = 'entry-list';
      hist.innerHTML = histDates.map(function (d) {
        var dayData = state.days[d];
        var dateLabel = new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return '<div><div class="entry-sub" style="margin-bottom:6px">' + dateLabel + '</div>' +
          dayData.workouts.map(function (w) { return workoutCardHtml(w, d, true); }).join('') + '</div>';
      }).join('');
      bindWorkoutRemoveButtons(hist);
    }
  }

  function createSetRow(index) {
    var row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = '<span class="set-index">' + index + '</span>' +
      '<input type="number" class="set-reps" placeholder="Reps" min="0" />' +
      '<input type="number" class="set-weight" placeholder="Weight (kg)" min="0" step="0.5" />' +
      '<button type="button" class="set-remove">✕</button>';
    row.querySelector('.set-remove').addEventListener('click', function () {
      var rows = $('setRows');
      if (rows.children.length > 1) { row.remove(); reindexSetRows(); }
    });
    return row;
  }

  function reindexSetRows() {
    var rows = $('setRows');
    Array.prototype.forEach.call(rows.children, function (row, i) {
      row.querySelector('.set-index').textContent = i + 1;
    });
  }

  function resetSetRows() {
    var rows = $('setRows');
    rows.innerHTML = '';
    rows.appendChild(createSetRow(1));
  }

  // --- Settings ---

  function renderSettings() {
    var s = state.settings;
    $('stSex').value = s.sex;
    $('stAge').value = s.age;
    $('stHeight').value = s.heightCm;
    $('stWeight').value = s.weightKg;
    $('stActivity').value = s.activity;
    $('stGoal').value = s.goal;
    $('stCalOverride').value = s.calOverride || '';
    $('stProteinOverride').value = s.proteinOverride || '';
    $('stWaterGoal').value = s.waterGoalMl || '';
    $('stStepGoal').value = s.stepGoal || '';

    $('bmrOut').textContent = Math.round(bmr(s)).toLocaleString() + ' kcal';
    $('tdeeOut').textContent = Math.round(tdee(s)).toLocaleString() + ' kcal';
    $('calOut').textContent = calorieTarget(s).toLocaleString() + ' kcal';
    $('proteinOut').textContent = proteinTarget(s) + ' g';
    $('waterOut').textContent = waterGoal(s).toLocaleString() + ' ml';
  }

  // ---------- Tabs ----------

  function switchView(name) {
    Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) { v.classList.remove('active'); });
    Array.prototype.forEach.call(document.querySelectorAll('.tab-btn'), function (b) { b.classList.remove('active'); });
    $('view-' + name).classList.add('active');
    document.querySelector('.tab-btn[data-view="' + name + '"]').classList.add('active');
    renderTopbar(name);
  }

  function renderAll() {
    renderDashboard();
    renderFood();
    renderSteps();
    renderWater();
    renderTraining();
    renderSettings();
  }

  // ---------- Live pedometer ----------

  var sensorActive = false;
  var sensorHandler = null;
  var sessionSteps = 0;

  function startLivePedometer() {
    if (typeof DeviceMotionEvent === 'undefined') {
      $('liveStepsStatus').textContent = 'Motion sensors are not supported on this browser/device.';
      return;
    }
    var begin = function () {
      var buf = [];
      var lastStepTime = 0;
      sessionSteps = 0;
      sensorHandler = function (e) {
        var a = e.accelerationIncludingGravity || e.acceleration;
        if (!a || a.x == null) return;
        var mag = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0));
        buf.push(mag);
        if (buf.length > 6) buf.shift();
        var avg = buf.reduce(function (s, v) { return s + v; }, 0) / buf.length;
        var delta = mag - avg;
        var now = Date.now();
        if (delta > 3 && now - lastStepTime > 300) {
          lastStepTime = now;
          sessionSteps++;
          addSteps(1, 'sensor');
          $('liveStepsStatus').textContent = 'Listening… ' + sessionSteps + ' steps this session.';
        }
      };
      window.addEventListener('devicemotion', sensorHandler);
      sensorActive = true;
      $('liveStepsToggle').textContent = 'Stop live counting';
      $('liveStepsStatus').textContent = 'Listening for steps…';
    };

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(function (result) {
        if (result === 'granted') begin();
        else $('liveStepsStatus').textContent = 'Motion permission denied.';
      }).catch(function () {
        $('liveStepsStatus').textContent = 'Could not request motion permission.';
      });
    } else {
      begin();
    }
  }

  function stopLivePedometer() {
    if (sensorHandler) window.removeEventListener('devicemotion', sensorHandler);
    sensorActive = false;
    $('liveStepsToggle').textContent = 'Start live counting';
    $('liveStepsStatus').textContent = 'Stopped. Counted ' + sessionSteps + ' steps this session.';
  }

  // ---------- Wiring ----------

  function init() {
    // Tabs
    Array.prototype.forEach.call(document.querySelectorAll('.tab-btn'), function (btn) {
      btn.addEventListener('click', function () { switchView(btn.getAttribute('data-view')); });
    });

    // Chat / food
    $('chatForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('chatInput');
      var text = input.value.trim();
      if (!text) return;
      handleChatSubmit(text);
      input.value = '';
    });

    $('manualFoodForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = $('mfName').value.trim();
      var cal = parseFloat($('mfCal').value) || 0;
      var protein = parseFloat($('mfProtein').value) || 0;
      if (!name) return;
      handleManualFood(name, cal, protein);
      ev.target.reset();
    });

    // Steps
    Array.prototype.forEach.call(document.querySelectorAll('[data-steps]'), function (btn) {
      btn.addEventListener('click', function () { addSteps(parseInt(btn.getAttribute('data-steps'), 10), 'manual'); });
    });
    $('stepsCustomForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = parseInt($('stepsCustomInput').value, 10);
      if (v > 0) addSteps(v, 'manual');
      ev.target.reset();
    });
    $('stepsSyncForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = parseInt($('stepsSyncInput').value, 10);
      if (v >= 0) setStepsTotal(v);
      ev.target.reset();
    });
    $('liveStepsToggle').addEventListener('click', function () {
      if (sensorActive) stopLivePedometer(); else startLivePedometer();
    });

    // Water
    Array.prototype.forEach.call(document.querySelectorAll('[data-water]'), function (btn) {
      btn.addEventListener('click', function () { addWater(parseInt(btn.getAttribute('data-water'), 10)); });
    });
    $('waterCustomForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = parseInt($('waterCustomInput').value, 10);
      if (v > 0) addWater(v);
      ev.target.reset();
    });

    // Training
    var exerciseList = $('exerciseList');
    exerciseList.innerHTML = EXERCISES.map(function (e) { return '<option value="' + e + '"></option>'; }).join('');
    resetSetRows();
    $('addSetRow').addEventListener('click', function () {
      $('setRows').appendChild(createSetRow($('setRows').children.length + 1));
    });
    $('workoutForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var exercise = $('woExercise').value.trim();
      if (!exercise) return;
      var sets = [];
      Array.prototype.forEach.call($('setRows').querySelectorAll('.set-row'), function (row) {
        var reps = parseFloat(row.querySelector('.set-reps').value) || 0;
        var weight = parseFloat(row.querySelector('.set-weight').value) || 0;
        if (reps > 0) sets.push({ reps: reps, weight: weight });
      });
      if (sets.length === 0) return;
      addWorkout({ id: uid(), time: Date.now(), exercise: exercise, sets: sets });
      ev.target.reset();
      resetSetRows();
    });

    // Settings
    $('settingsForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      state.settings = {
        sex: $('stSex').value,
        age: parseFloat($('stAge').value) || 30,
        heightCm: parseFloat($('stHeight').value) || 175,
        weightKg: parseFloat($('stWeight').value) || 75,
        activity: parseFloat($('stActivity').value) || 1.55,
        goal: $('stGoal').value,
        calOverride: $('stCalOverride').value ? parseFloat($('stCalOverride').value) : null,
        proteinOverride: $('stProteinOverride').value ? parseFloat($('stProteinOverride').value) : null,
        waterGoalMl: $('stWaterGoal').value ? parseFloat($('stWaterGoal').value) : null,
        stepGoal: $('stStepGoal').value ? parseInt($('stStepGoal').value, 10) : 10000,
      };
      save();
      renderAll();
      var btn = ev.target.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Saved ✓';
      setTimeout(function () { btn.textContent = original; }, 1200);
    });

    $('resetDataBtn').addEventListener('click', function () {
      if (confirm('This will erase all logged data and settings on this device. Continue?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });

    renderAll();
    switchView(isFirstRun ? 'settings' : 'dashboard');

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
