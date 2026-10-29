// ===============================
// Course Syllabus Tracking System
// ===============================

const STORAGE_KEY = "syllabusTracker";

// Read saved data from the browser
function loadData() {
try {
const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
return data || { checked: {}, totalTopics: 0, course: null };
} catch (error) {
return { checked: {}, totalTopics: 0, course: null };
}
}

// Save data to the browser
function saveData(data) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Work out how many topics are done and the percentage
function getProgress() {
const data = loadData();
const done = Object.values(data.checked).filter(Boolean).length;
const total = data.totalTopics;
const percent = total ? Math.round((done / total) * 100) : 0;
return { done, total, percent, course: data.course };
}

// ---------- Create Course page ----------
function showMessage(text, isError) {
const box = document.getElementById("form-message");
if (!box) return;
box.textContent = text;
box.className = isError ? "message error" : "message success";
}

function initCreateCoursePage() {
const form = document.getElementById("course-form");
if (!form) return;

form.addEventListener("submit", (event) => {
event.preventDefault(); // stop the page from reloading

const name = document.getElementById("course-name").value.trim();
const code = document.getElementById("course-code").value.trim();
const teacher = document.getElementById("teacher").value.trim();

if (!name) {
showMessage("Please enter a course name.", true);
return;
}

const units = [];
for (let i = 1; i <= 5; i++) {
const unitName = document.getElementById(`unit${i}`).value.trim();
const subtopics = document.getElementById(`subtopics${i}`).value
.split(",")
.map((topic) => topic.trim())
.filter(Boolean);
if (unitName) {
units.push({ name: unitName, subtopics });
}
}

if (units.length === 0) {
showMessage("Please add at least one unit name.", true);
return;
}

const data = loadData();
data.course = { name, code, teacher, units };
data.checked = {}; // a new course starts with no topics ticked
saveData(data);

showMessage(`Course "${name}" saved with ${units.length} unit(s). Open the Units page to see your checklist.`, false);
});
}

// ---------- Units page ----------
// Builds the unit cards from the saved course (if one exists)
function buildUnitsFromCourse(course) {
const grid = document.getElementById("unit-grid");
if (!grid || !course || course.units.length === 0) return;

grid.innerHTML = "";

course.units.forEach((unit, ui) => {
const card = document.createElement("div");
card.className = "card unit";

const heading = document.createElement("h3");
heading.textContent = unit.name;
card.appendChild(heading);

const topics = unit.subtopics.length ? unit.subtopics : ["Topic to be added"];
topics.forEach((topicName, ti) => {
const id = `u${ui}t${ti}`;

const row = document.createElement("div");
row.className = "topic";

const box = document.createElement("input");
box.type = "checkbox";
box.id = id;

const label = document.createElement("label");
label.htmlFor = id;
label.textContent = topicName;

row.append(box, label);
card.appendChild(row);
});

grid.appendChild(card);
});
}

function refreshUnitCounts() {
document.querySelectorAll(".unit").forEach((unit) => {
const boxes = unit.querySelectorAll('input[type="checkbox"]');
const done = [...boxes].filter((box) => box.checked).length;

let label = unit.querySelector(".unit-count");
if (!label) {
label = document.createElement("p");
label.className = "unit-count";
unit.appendChild(label);
}
label.textContent = `${done} of ${boxes.length} topics done`;
});
}

function initUnitsPage() {
const boxes = document.querySelectorAll('.topic input[type="checkbox"]');
if (boxes.length === 0) return;

// Remember how many topics exist so the Progress page can calculate the percentage
const data = loadData();
data.totalTopics = boxes.length;
saveData(data);

boxes.forEach((box) => {
box.checked = Boolean(data.checked[box.id]); // restore saved state

box.addEventListener("change", () => {
const current = loadData();
current.checked[box.id] = box.checked;
saveData(current);
refreshUnitCounts();
});
});

refreshUnitCounts();
}

// ---------- Progress and home displays ----------
function updateProgressDisplays() {
const p = getProgress();

const fill = document.getElementById("fill");
if (fill) fill.style.width = p.percent + "%";

const percentText = document.getElementById("percent");
if (percentText) percentText.textContent = p.percent + "%";

const summary = document.getElementById("summary");
if (summary) {
summary.textContent = p.total
? `${p.done} of ${p.total} topics completed`
: "Open the Units page to load your topics.";
}

const courseDisplay = document.getElementById("course-name-display");
if (courseDisplay) {
courseDisplay.textContent = p.course ? p.course.name : "No course created yet";
}

const homeProgress = document.getElementById("home-progress");
if (homeProgress) homeProgress.textContent = p.percent + "%";
}

function initResetButton() {
const button = document.getElementById("reset-btn");
if (!button) return;

button.addEventListener("click", () => {
const data = loadData();
data.checked = {};
saveData(data);
updateProgressDisplays();
});
}

// ---------- Delete the created course ----------
function deleteCourse() {
const confirmed = confirm("Are you sure you want to delete this course? All ticked topics will also be cleared.");
if (!confirmed) return;

const data = loadData();
data.course = null;
data.checked = {};
data.totalTopics = 0;
saveData(data);

location.reload();
}

function initDeleteCourseButton() {
const button = document.getElementById("delete-course-btn");
if (!button) return;

button.addEventListener("click", deleteCourse);
}

// ---------- Start everything when the page loads ----------
document.addEventListener("DOMContentLoaded", () => {
  const data = loadData();
  buildUnitsFromCourse(data.course);
  initUnitsPage();
  initCreateCoursePage();
  initResetButton();
  initDeleteCourseButton();
  updateProgressDisplays();
});

// Update the numbers whenever a page is shown, including with the Back button
window.addEventListener("pageshow", updateProgressDisplays);

// Update the numbers if the data changes in another browser tab
window.addEventListener("storage", updateProgressDisplays);