const STORAGE_KEY = "hesi-smoo-v0.1";
const TARGET_TEST = new Date("2026-09-24T08:30:00");

const capacityPlans = {
  5: {
    duration: "5 min",
    title: "Do a five-minute rescue.",
    start: "START 5-MIN SESSION",
    note: "Three useful retrievals. Then you are released.",
    pill: "DO THIS NOW",
    subject: "Vocabulary maintenance",
    labels: ["Vocab sprint", "Math block", "Reading passage"],
    route: ["3-word rescue · retrieval", "Next session", "Not today"],
    states: ["NOW", "LATER", "LATER"],
  },
  15: {
    duration: "15 min",
    title: "Start with vocabulary.",
    start: "START 15-MIN SESSION",
    note: "This round is enough. More work is available, not owed.",
    pill: "DO THIS NOW",
    subject: "Vocabulary retrieval",
    labels: ["Vocab sprint", "Math block", "Reading passage"],
    route: ["15 minutes · retrieval", "If more brain appears", "Not owed"],
    states: ["NOW", "BONUS", "OPTIONAL"],
  },
  30: {
    duration: "30 min",
    title: "Vocab, then one math set.",
    start: "START 30-MIN SESSION",
    note: "The app has already sequenced the whole half hour.",
    pill: "DO THIS NOW",
    subject: "Vocabulary + math",
    labels: ["Vocab sprint", "Math block", "Reading passage"],
    route: ["15 minutes · retrieval", "Roman numerals · short set", "If capacity remains"],
    states: ["NOW", "NEXT", "OPTIONAL"],
  },
  full: {
    duration: "open",
    title: "Start the full route.",
    start: "START FULL SESSION",
    note: "Vocab → math until tired → one reading passage if there’s gas.",
    pill: "DO THIS NOW",
    subject: "Full HESI route",
    labels: ["Vocab sprint", "Math block", "Reading passage"],
    route: ["15 minutes · retrieval", "Roman numerals · until tired", "Main idea · if capacity remains"],
    states: ["NOW", "NEXT", "OPTIONAL"],
  },
};

const apProtectionPlan = {
  duration: "5–10 min",
  title: "Take the HESI minimum dose.",
  start: "START MINIMUM DOSE",
  note: "Then close HESI Smoo and go study anatomy. The app means it.",
  pill: "A&P-PROTECTED",
  subject: "HESI maintenance",
  labels: ["HESI maintenance", "One bonus item", "Return to A&P"],
  route: ["3-word retrieval rescue", "Only if genuinely easy", "A&P gets the next block"],
  states: ["NOW", "OPTIONAL", "STOP"],
};

const defaultLogistics = () => ({
  sections: true,
  scheduling: false,
  retake: false,
  deadline: true,
});

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultDailyContext = () => ({
  date: localDateKey(),
  heavyAP: false,
});

const vocabDeck = [
  {
    id: "acute",
    word: "Acute",
    example: "“The symptoms had an acute onset.”",
    answer: "Sudden in onset and often short in duration.",
  },
  {
    id: "abstain",
    word: "Abstain",
    example: "“She was told to abstain from food before the procedure.”",
    answer: "To choose not to do or have something.",
  },
  {
    id: "insidious",
    word: "Insidious",
    example: "“The condition can have an insidious progression.”",
    answer: "Developing gradually or subtly, often with harmful effects.",
  },
];

const emptyState = () => ({
  version: 1,
  capacity: "15",
  logistics: defaultLogistics(),
  dailyContext: defaultDailyContext(),
  ratings: {},
  sessions: [],
  lastOpenedAt: null,
});

let appState = loadState();
let currentCardIndex = 0;
let activeRatings = [];
let activeBlocks = [];
let mathCorrect = null;
let readingCorrect = null;
let selectedCapacity = appState.capacity || "15";
let heavyAP = Boolean(appState.dailyContext.heavyAP);
let deferredInstallPrompt = null;
let toastTimer = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || stored.version !== 1) return emptyState();
    const priorLogistics = stored.logistics || {};
    const migratedLogistics = {
      sections: priorLogistics.sections !== false,
      scheduling: priorLogistics.scheduling ?? Boolean(priorLogistics.schedule && priorLogistics.times),
      retake: Boolean(priorLogistics.retake),
      deadline: priorLogistics.deadline !== false,
    };
    const dailyContext = stored.dailyContext?.date === localDateKey()
      ? { ...defaultDailyContext(), ...stored.dailyContext }
      : defaultDailyContext();
    return {
      ...emptyState(),
      ...stored,
      capacity: stored.capacity || "15",
      logistics: migratedLogistics,
      dailyContext,
    };
  } catch {
    return emptyState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(date);
}

function setDateLabels() {
  const now = new Date();
  const difference = TARGET_TEST - now;
  const days = Math.max(0, Math.ceil(difference / 86_400_000));
  const confirmed = Boolean(appState.logistics.scheduling);
  $("#today-label").textContent = formatDate(now);
  $("#days-to-target").textContent = difference <= 0
    ? "planned test time reached"
    : `${days} ${days === 1 ? "day" : "days"} to ${confirmed ? "test" : "tentative test"}`;
  $("#test-date-note").textContent = `${confirmed ? "Confirmed test" : "Tentative test"} · Thu, Sep. 24 · 8:30 AM`;
}

function getActivePlan() {
  return heavyAP ? apProtectionPlan : capacityPlans[selectedCapacity];
}

function showView(name) {
  $$(".view").forEach((view) => {
    const active = view.dataset.view === name;
    view.hidden = !active;
    view.classList.toggle("active", active);
  });

  $$(".nav-button").forEach((button) => {
    const active = button.dataset.nav === name;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  history.replaceState(null, "", `#${name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSession() {
  currentCardIndex = 0;
  activeRatings = [];
  activeBlocks = [];
  mathCorrect = null;
  readingCorrect = null;
  configurePostVocabActions();
  resetQuestionButtons();
  renderVocabCard();
  showSessionPanel("vocab");
  $("#session-shell").hidden = false;
  document.body.classList.add("session-open");
  $("#close-session").focus();
}

function closeSession() {
  $("#session-shell").hidden = true;
  document.body.classList.remove("session-open");
  $("#start-session").focus();
}

function showSessionPanel(name) {
  $$(".session-panel").forEach((panel) => {
    const active = panel.dataset.sessionPanel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });

  const activePlan = getActivePlan();
  const headers = {
    vocab: [`VOCAB · ${activePlan.duration.toUpperCase()} PLAN`, "Try it before you reveal it.", `${currentCardIndex + 1} / ${vocabDeck.length}`, ((currentCardIndex + 0.25) / 7) * 100],
    "vocab-complete": ["VOCAB · COMPLETE", "First block closed.", "1 / 3", 34],
    math: ["MATH · ROMAN NUMERALS", "Work the item, then check it.", "2 / 3", 48],
    capacity: ["CHECK CAPACITY", "Choose the truthful stopping point.", "2 / 3", 67],
    reading: ["READING · MAIN IDEA", "Accuracy first. Timing later.", "3 / 3", 78],
    complete: ["SESSION · COMPLETE", "The next move can wait.", "DONE", 100],
  };

  const [kind, title, counter, width] = headers[name];
  $("#session-kind").textContent = kind;
  $("#session-title").textContent = title;
  $("#session-counter").textContent = counter;
  $("#session-progress-bar").style.width = `${Math.min(100, width)}%`;
}

function renderVocabCard() {
  const card = vocabDeck[currentCardIndex];
  $("#vocab-word").textContent = card.word;
  $("#vocab-example").textContent = card.example;
  $("#vocab-answer").textContent = card.answer;
  $("#answer-area").hidden = true;
  $("#rating-area").hidden = true;
  $("#reveal-answer").hidden = false;
  $("#session-counter").textContent = `${currentCardIndex + 1} / ${vocabDeck.length}`;
  $("#session-progress-bar").style.width = `${((currentCardIndex + 0.25) / 7) * 100}%`;
}

function revealAnswer() {
  $("#reveal-answer").hidden = true;
  $("#answer-area").hidden = false;
  $("#rating-area").hidden = false;
  $("[data-rating='again']").focus();
}

function rateCard(rating) {
  const card = vocabDeck[currentCardIndex];
  activeRatings.push({ itemId: card.id, word: card.word, rating });

  currentCardIndex += 1;
  if (currentCardIndex < vocabDeck.length) {
    renderVocabCard();
    return;
  }

  activeBlocks.push("Vocabulary");
  renderVocabCompletion();
  showSessionPanel("vocab-complete");
}

function renderVocabCompletion() {
  const counts = countRatings(activeRatings);
  const needsReturn = counts.again + counts.hard;
  $("#vocab-completion-title").textContent = needsReturn
    ? `Nice—we found ${needsReturn} ${needsReturn === 1 ? "word" : "words"} worth learning.`
    : "Clean retrieval. These can get out of your way.";
  $("#vocab-result-copy").textContent = needsReturn
    ? `${needsReturn} ${needsReturn === 1 ? "word is" : "words are"} now queued to return sooner. The search worked.`
    : "All three felt retrievable. The full engine would now increase their spacing.";
  $("#vocab-stats").innerHTML = [
    statTile(counts.again, "Again"),
    statTile(counts.hard, "Hard"),
    statTile(counts.gotIt, "Got it"),
  ].join("");
}

function countRatings(ratings) {
  return ratings.reduce(
    (counts, item) => {
      const key = item.rating === "got-it" ? "gotIt" : item.rating;
      counts[key] += 1;
      return counts;
    },
    { again: 0, hard: 0, gotIt: 0 },
  );
}

function statTile(value, label) {
  return `<div class="stat-tile"><strong>${value}</strong><small>${label}</small></div>`;
}

function startMath() {
  showSessionPanel("math");
}

function configurePostVocabActions() {
  const shortSession = heavyAP || selectedCapacity === "5" || selectedCapacity === "15";
  const primaryLabel = $("#continue-math span:first-child");
  const primaryIcon = $("#continue-math span:last-child");
  primaryLabel.textContent = heavyAP ? "FINISH HESI · GO TO A&P" : shortSession ? "FINISH TODAY" : "CONTINUE TO MATH";
  primaryIcon.textContent = shortSession ? "✓" : "→";
  $("#stop-after-vocab").textContent = heavyAP
    ? "I truly have more brain → one math item"
    : shortSession ? "I found more brain → Math" : "Stop here—this still counts";
}

function handlePostVocabPrimary() {
  if (heavyAP || selectedCapacity === "5" || selectedCapacity === "15") finishSession("vocab");
  else startMath();
}

function handlePostVocabSecondary() {
  if (heavyAP || selectedCapacity === "5" || selectedCapacity === "15") startMath();
  else finishSession("vocab");
}

function answerMath(button) {
  if (mathCorrect === true) return;
  const answer = button.dataset.mathAnswer;
  const correct = answer === "4";
  mathCorrect = correct;

  $$("#math-choices button").forEach((choice) => {
    choice.classList.remove("selected-correct", "selected-wrong");
    if (choice.dataset.mathAnswer === "4") choice.classList.add("selected-correct");
  });
  if (!correct) button.classList.add("selected-wrong");

  const feedback = $("#math-feedback");
  feedback.hidden = false;
  feedback.textContent = correct
    ? "Correct. A smaller numeral before a larger one is subtracted: V − I = 4."
    : "Useful—we found the rule to reinforce. I comes before V, so subtract it: V − I = 4.";
  $("#math-next").hidden = false;
}

function finishMathBlock() {
  activeBlocks.push("Math");
  if (heavyAP) finishSession("math");
  else showSessionPanel("capacity");
}

function startReading() {
  showSessionPanel("reading");
}

function answerReading(button) {
  if (readingCorrect === true) return;
  const answer = button.dataset.readingAnswer;
  const correct = answer === "orchestration";
  readingCorrect = correct;

  $$("#reading-choices button").forEach((choice) => {
    choice.classList.remove("selected-correct", "selected-wrong");
    if (choice.dataset.readingAnswer === "orchestration") choice.classList.add("selected-correct");
  });
  if (!correct) button.classList.add("selected-wrong");

  const feedback = $("#reading-feedback");
  feedback.hidden = false;
  feedback.textContent = correct
    ? "Correct. Every sentence supports orchestration guided by evidence."
    : "Useful—we found the distinction to practice. Look for the claim supported by the whole passage: the system should orchestrate work using evidence.";
  $("#reading-next").hidden = false;
}

function finishReadingBlock() {
  activeBlocks.push("Reading");
  finishSession("reading");
}

function finishSession(stoppedAfter) {
  const counts = countRatings(activeRatings);
  activeRatings.forEach((rating) => {
    appState.ratings[rating.itemId] = appState.ratings[rating.itemId] || { again: 0, hard: 0, gotIt: 0 };
    const key = rating.rating === "got-it" ? "gotIt" : rating.rating;
    appState.ratings[rating.itemId][key] += 1;
  });
  const session = {
    id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
    completedAt: new Date().toISOString(),
    prototype: true,
    capacity: selectedCapacity,
    heavyAP,
    stoppedAfter,
    blocks: [...activeBlocks],
    vocab: {
      cards: activeRatings,
      counts,
    },
    math: activeBlocks.includes("Math") ? { topic: "Roman numerals", correct: mathCorrect } : null,
    reading: activeBlocks.includes("Reading") ? { skill: "Main idea", correct: readingCorrect } : null,
  };

  appState.sessions.unshift(session);
  appState.sessions = appState.sessions.slice(0, 30);
  saveState();
  renderFinalSummary(session);
  renderStoredState();
  showSessionPanel("complete");
}

function renderFinalSummary(session) {
  const blockCount = session.blocks.length;
  const counts = session.vocab.counts;
  $("#final-title").textContent = session.heavyAP
    ? "HESI minimum dose: complete."
    : blockCount === 1 ? "One useful block: complete." : `${blockCount} useful blocks: complete.`;
  $("#final-copy").textContent = session.heavyAP
    ? "Close HESI Smoo. A&P gets the next block; protecting the 4.0 is part of the strategy."
    : "The evidence is saved on this device and ready for Nichole mode.";
  $("#final-summary").innerHTML = [
    statTile(blockCount, blockCount === 1 ? "Block" : "Blocks"),
    statTile(counts.again + counts.hard, "Words to return"),
    statTile(session.reading ? "Yes" : "No", "Reading"),
  ].join("");
}

function renderStoredState() {
  const latest = appState.sessions[0];
  const empty = $("#recent-session-empty");
  const list = $("#recent-session-list");

  if (!latest) {
    empty.hidden = false;
    list.hidden = true;
    $("#share-title").textContent = "Nothing to send yet.";
    $("#share-summary").textContent = "Complete the demo round and this becomes a clean, copyable study report.";
    $("#vocab-readiness").textContent = "No estimate yet";
    return;
  }

  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = appState.sessions.slice(0, 4).map((session) => {
    const when = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(session.completedAt));
    const returnCount = session.vocab.counts.again + session.vocab.counts.hard;
    return `<li><div><strong>${session.blocks.join(" + ")}</strong><small>${when} · ${returnCount} vocab ${returnCount === 1 ? "item" : "items"} to revisit</small></div><span class="session-score">${session.blocks.length} ${session.blocks.length === 1 ? "block" : "blocks"}</span></li>`;
  }).join("");

  const counts = latest.vocab.counts;
  $("#share-title").textContent = `${latest.blocks.length} ${latest.blocks.length === 1 ? "block" : "blocks"} completed.`;
  $("#share-summary").textContent = summaryText(latest);
  $("#vocab-readiness").textContent = `${counts.gotIt} / ${vocabDeck.length} retrieved once`;
}

function summaryText(session) {
  const ratings = session.vocab.counts;
  const math = session.math ? ` Math: Roman numeral demo ${session.math.correct ? "correct" : "needed correction"}.` : "";
  const reading = session.reading ? ` Reading: main-idea demo ${session.reading.correct ? "correct" : "needed correction"}.` : "";
  const capacity = capacityPlans[session.capacity || "15"].duration;
  const protection = session.heavyAP ? " A&P-protected minimum-dose day." : "";
  return `HESI Smoo demo — ${capacity} plan; ${session.blocks.join(", ")}. Vocab: ${ratings.gotIt} got it, ${ratings.hard} hard, ${ratings.again} again.${math}${reading}${protection}`;
}

function selectCapacity(capacity) {
  selectedCapacity = capacity;
  appState.capacity = capacity;
  saveState();
  renderCapacityPlan();
}

function renderCapacityPlan() {
  const plan = getActivePlan();
  $$("[data-capacity]").forEach((button) => {
    const selected = button.dataset.capacity === selectedCapacity;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(selected));
  });
  $("#now-pill").textContent = plan.pill;
  $("#next-subject-label").textContent = plan.subject;
  $("#session-duration").textContent = plan.duration;
  $("#next-title").textContent = plan.title;
  $("#start-label").textContent = plan.start;
  $("#after-note").textContent = plan.note;
  $$(".route-item").forEach((item, index) => {
    item.classList.remove("complete", "current");
    if (index === 0) item.classList.add("current");
    item.querySelector(".route-number").textContent = String(index + 1);
    item.querySelector(".route-copy strong").textContent = plan.labels[index];
    item.querySelector(".route-copy small").textContent = plan.route[index];
    item.querySelector(".route-state").textContent = plan.states[index];
  });
  markRouteCompletion();
}

function toggleHeavyAP() {
  heavyAP = !heavyAP;
  appState.dailyContext = { date: localDateKey(), heavyAP };
  saveState();
  renderCapacityPlan();
  renderHeavyAPState();
}

function renderHeavyAPState() {
  const button = $("#ap-load-toggle");
  button.classList.toggle("active", heavyAP);
  button.setAttribute("aria-pressed", String(heavyAP));
  button.querySelector(".ap-toggle-box").textContent = heavyAP ? "✓" : "";
  $("#ap-toggle-state").textContent = heavyAP ? "Yes" : "No";
}

function toggleLogistics(key) {
  appState.logistics[key] = !appState.logistics[key];
  saveState();
  renderLogistics();
  setDateLabels();
}

function renderLogistics() {
  const completed = Object.values(appState.logistics).filter(Boolean).length;
  const pending = appState.logistics.scheduling ? 0 : 1;
  $("#logistics-count").textContent = `${completed} / 4 known${pending ? " · 1 pending" : ""}`;
  $$("[data-logistics]").forEach((button) => {
    const key = button.dataset.logistics;
    const done = Boolean(appState.logistics[key]);
    const isPending = key === "scheduling" && !done;
    button.classList.toggle("complete", done);
    button.classList.toggle("pending", isPending);
    button.setAttribute("aria-pressed", String(done));
    button.querySelector(".check-box").textContent = done ? "✓" : isPending ? "…" : "";
  });
}

async function copySummary() {
  const latest = appState.sessions[0];
  const text = latest ? summaryText(latest) : "HESI Smoo: no completed session yet.";
  try {
    await navigator.clipboard.writeText(text);
    showToast("Summary copied.");
  } catch {
    showToast("Copy was blocked. Try Download data instead.");
  }
}

function downloadResults() {
  const payload = {
    app: "HESI Smoo",
    version: "0.2-prototype",
    exportedAt: new Date().toISOString(),
    data: appState,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hesi-smoo-results-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Results downloaded.");
}

function resetPrototype() {
  const confirmed = window.confirm("Reset all HESI Smoo prototype data on this device?");
  if (!confirmed) return;
  appState = emptyState();
  selectedCapacity = appState.capacity;
  heavyAP = false;
  saveState();
  renderCapacityPlan();
  renderHeavyAPState();
  renderLogistics();
  renderStoredState();
  setDateLabels();
  showToast("Prototype data reset.");
}

function resetQuestionButtons() {
  $$("#math-choices button, #reading-choices button").forEach((button) => {
    button.classList.remove("selected-correct", "selected-wrong");
  });
  $("#math-feedback").hidden = true;
  $("#math-next").hidden = true;
  $("#reading-feedback").hidden = true;
  $("#reading-next").hidden = true;
}

function markRouteCompletion() {
  const latest = appState.sessions[0];
  if (!latest || new Date(latest.completedAt).toDateString() !== new Date().toDateString()) return;
  $$(".route-item").forEach((item) => {
    const map = { vocab: "Vocabulary", math: "Math", reading: "Reading" };
    if (latest.blocks.includes(map[item.dataset.routeStep])) {
      item.classList.add("complete");
      item.classList.remove("current");
      item.querySelector(".route-number").textContent = "✓";
      item.querySelector(".route-state").textContent = "DONE";
    }
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function bindEvents() {
  $$(".nav-button").forEach((button) => button.addEventListener("click", () => showView(button.dataset.nav)));
  $(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    showView("today");
  });
  $("#start-session").addEventListener("click", openSession);
  $$("[data-capacity]").forEach((button) => button.addEventListener("click", () => selectCapacity(button.dataset.capacity)));
  $("#ap-load-toggle").addEventListener("click", toggleHeavyAP);
  $$("[data-logistics]").forEach((button) => button.addEventListener("click", () => toggleLogistics(button.dataset.logistics)));
  $("#close-session").addEventListener("click", closeSession);
  $("#reveal-answer").addEventListener("click", revealAnswer);
  $$("[data-rating]").forEach((button) => button.addEventListener("click", () => rateCard(button.dataset.rating)));
  $("#continue-math").addEventListener("click", handlePostVocabPrimary);
  $("#stop-after-vocab").addEventListener("click", handlePostVocabSecondary);
  $$("#math-choices button").forEach((button) => button.addEventListener("click", () => answerMath(button)));
  $("#math-next").addEventListener("click", finishMathBlock);
  $("#continue-reading").addEventListener("click", startReading);
  $("#finish-after-math").addEventListener("click", () => finishSession("math"));
  $$("#reading-choices button").forEach((button) => button.addEventListener("click", () => answerReading(button)));
  $("#reading-next").addEventListener("click", finishReadingBlock);
  $("#return-today").addEventListener("click", () => {
    closeSession();
    markRouteCompletion();
    showView("today");
  });
  $("#copy-summary").addEventListener("click", copySummary);
  $("#download-results").addEventListener("click", downloadResults);
  $("#reset-prototype").addEventListener("click", resetPrototype);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#session-shell").hidden) closeSession();
  });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $("#install-button").hidden = false;
  });

  $("#install-button").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $("#install-button").hidden = true;
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {
      // Offline installation is an enhancement; the study UI remains usable without it.
    });
  });
}

function init() {
  appState.lastOpenedAt = new Date().toISOString();
  saveState();
  setDateLabels();
  bindEvents();
  setupInstallPrompt();
  renderCapacityPlan();
  renderHeavyAPState();
  renderLogistics();
  renderStoredState();
  markRouteCompletion();
  const initialView = ["today", "progress", "coach"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "today";
  showView(initialView);
  registerServiceWorker();
}

init();
