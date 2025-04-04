// ========== Markdown Editor ==========
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const wordCountDisplay = document.getElementById("word-count");
const statusMessage = document.getElementById("status-message");
const titleInput = document.getElementById("note-title");

editor.addEventListener("input", () => {
    const markdownText = editor.value;
    preview.innerHTML = marked.parse(markdownText);
    hljs.highlightAll();
    updateWordCount();
    saveCurrentNote();
});

titleInput.addEventListener("input", saveCurrentNote);

function updateWordCount() {
    const words = editor.value.trim().split(/\s+/).filter(word => word.length > 0);
    wordCountDisplay.textContent = `${words.length} words`;
}

// ========== Notes Handling ==========
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let activeNoteId = null;

function saveCurrentNote() {
    if (!activeNoteId) return;

    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.title = titleInput.value;
        note.content = editor.value;
        localStorage.setItem("notes", JSON.stringify(notes));
        renderNotesList();
        statusMessage.textContent = "All changes saved";
    }
}

function renderNotesList() {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "";

    notes.forEach(note => {
        const div = document.createElement("div");
        div.textContent = note.title || "Untitled Note";
        div.className = "note-item";
        div.onclick = () => loadNote(note.id);
        notesList.appendChild(div);
    });

    updateStats();
}

function loadNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    activeNoteId = id;
    editor.value = note.content;
    titleInput.value = note.title;
    preview.innerHTML = marked.parse(note.content);
    hljs.highlightAll();
    updateWordCount();
}

document.getElementById("new-note-btn").onclick = () => {
    const newNote = {
        id: Date.now(),
        title: "",
        content: ""
    };
    notes.push(newNote);
    activeNoteId = newNote.id;
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotesList();
    loadNote(newNote.id);
};

document.getElementById("delete-note-btn").onclick = () => {
    if (!activeNoteId) return;
    notes = notes.filter(n => n.id !== activeNoteId);
    activeNoteId = null;
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotesList();
    titleInput.value = "";
    editor.value = "";
    preview.innerHTML = "";
    updateWordCount();
};

document.getElementById("export-note-btn").onclick = () => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    const blob = new Blob([note.content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${note.title || "note"}.txt`;
    a.click();
};

// Initial Load
renderNotesList();

// ========== Toolbar Formatting ==========
document.querySelectorAll(".toolbar-btn").forEach(button => {
    button.addEventListener("click", () => {
        const format = button.dataset.format;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.slice(start, end);

        let wrapped = selected;
        switch (format) {
            case "bold":
                wrapped = `**${selected}**`;
                break;
            case "italic":
                wrapped = `*${selected}*`;
                break;
            case "heading":
                wrapped = `# ${selected}`;
                break;
            case "link":
                wrapped = `[${selected}](http://)`;
                break;
            case "list-ul":
                wrapped = `- ${selected}`;
                break;
            case "list-ol":
                wrapped = `1. ${selected}`;
                break;
            case "code":
                wrapped = `\`\`\`\n${selected}\n\`\`\``;
                break;
            case "quote":
                wrapped = `> ${selected}`;
                break;
            case "table":
                wrapped = `| Column 1 | Column 2 |\n|----------|----------|\n| Value 1  | Value 2  |`;
                break;
        }

        editor.setRangeText(wrapped, start, end, "end");
        editor.dispatchEvent(new Event("input"));
    });
});

// ========== Tab Switching ==========
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add("active");
    });
});

// ========== Calendar ==========
function generateCalendar(monthOffset = 0) {
    const now = new Date();
    now.setMonth(now.getMonth() + monthOffset);
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.querySelector(".calendar-grid");
    grid.innerHTML = `
        <div class="calendar-day">Sun</div>
        <div class="calendar-day">Mon</div>
        <div class="calendar-day">Tue</div>
        <div class="calendar-day">Wed</div>
        <div class="calendar-day">Thu</div>
        <div class="calendar-day">Fri</div>
        <div class="calendar-day">Sat</div>
    `;

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        grid.innerHTML += `<div>${i}</div>`;
    }

    document.getElementById("calendar-title").textContent = `${now.toLocaleString("default", { month: "long" })} ${year}`;
}
let currentMonthOffset = 0;
document.getElementById("prev-month").onclick = () => generateCalendar(--currentMonthOffset);
document.getElementById("next-month").onclick = () => generateCalendar(++currentMonthOffset);
generateCalendar();

// ========== Calculator ==========
const exprDisplay = document.getElementById("calculator-expression");
const resultDisplay = document.getElementById("calculator-result");
let expression = "";

document.querySelectorAll(".calculator-key").forEach(btn => {
    btn.onclick = () => {
        const action = btn.dataset.action;
        const value = btn.textContent;

        if (action === "calculate") {
            try {
                resultDisplay.textContent = eval(expression.replace(/π/g, Math.PI));
            } catch {
                resultDisplay.textContent = "Error";
            }
        } else if (action === "clear") {
            expression = "";
            exprDisplay.textContent = "";
            resultDisplay.textContent = "0";
        } else if (action === "backspace") {
            expression = expression.slice(0, -1);
            exprDisplay.textContent = expression;
        } else if (action === "bracket") {
            expression += "()";
            exprDisplay.textContent = expression;
        } else if (action) {
            const map = {
                sin: "Math.sin(",
                cos: "Math.cos(",
                tan: "Math.tan(",
                log: "Math.log10(",
                sqrt: "Math.sqrt(",
                square: "**2",
                power: "**",
                pi: "π"
            };
            expression += map[action] || "";
            exprDisplay.textContent = expression;
        } else {
            expression += value;
            exprDisplay.textContent = expression;
        }
    };
});

// ========== Statistics ==========
function updateStats() {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((acc, note) => acc + note.content.trim().split(/\s+/).length, 0);
    const avg = totalNotes ? Math.round(totalWords / totalNotes) : 0;

    document.getElementById("total-notes").textContent = totalNotes;
    document.getElementById("total-words").textContent = totalWords;
    document.getElementById("avg-length").textContent = avg;

    const ctx = document.getElementById("notes-chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: notes.map(n => n.title || "Untitled"),
            datasets: [{
                label: "Word Count",
                data: notes.map(n => n.content.trim().split(/\s+/).length),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
