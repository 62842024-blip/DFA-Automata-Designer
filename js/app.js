/* =========================================================
   DFA AUTOMATA
   INTERACTIVE FINITE AUTOMATON DESIGNER
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const canvas =
    document.getElementById("dfaCanvas");

const ctx =
    canvas.getContext("2d");


const stateCount =
    document.getElementById("stateCount");

const transitionCount =
    document.getElementById("transitionCount");

const startStateInfo =
    document.getElementById("startStateInfo");

const finalStateInfo =
    document.getElementById("finalStateInfo");

const alphabetInfo =
    document.getElementById("alphabetInfo");

const alphabetInfoCount =
    document.getElementById("alphabetInfoCount");


const alphabetInput =
    document.getElementById("alphabet");

const setAlphabetBtn =
    document.getElementById("setAlphabetBtn");

const alphabetDisplay =
    document.getElementById("alphabetDisplay");


const inputString =
    document.getElementById("inputString");

const runBtn =
    document.getElementById("runBtn");

const result =
    document.getElementById("result");

const executionResult =
    document.getElementById("executionResult");


const dfaStatus =
    document.getElementById("dfaStatus");


const transitionTable =
    document.getElementById("transitionTable");


const activityHistory =
    document.getElementById("activityHistory");


const themeBtn =
    document.getElementById("themeBtn");


const menuBtn =
    document.getElementById("menuBtn");

const closeMenuBtn =
    document.getElementById("closeMenuBtn");

const navigationDrawer =
    document.getElementById("navigationDrawer");

const menuOverlay =
    document.getElementById("menuOverlay");


const undoBtn =
    document.getElementById("undoBtn");

const redoBtn =
    document.getElementById("redoBtn");

const clearBtn =
    document.getElementById("clearBtn");


const drawerUndoBtn =
    document.getElementById("drawerUndoBtn");

const drawerRedoBtn =
    document.getElementById("drawerRedoBtn");

const drawerClearBtn =
    document.getElementById("drawerClearBtn");

const drawerThemeBtn =
    document.getElementById("drawerThemeBtn");


const stateNamingMode =
    document.getElementById("stateNamingMode");

const customStateName =
    document.getElementById("customStateName");


const toolStatus =
    document.getElementById("toolStatus");

const toolStatusDot =
    document.getElementById("toolStatusDot");

const canvasHint =
    document.getElementById("canvasHint");


const deleteSelectedBtn =
    document.getElementById("deleteSelectedBtn");


const systemStatusText =
    document.getElementById("systemStatusText");


/* =========================================================
   DATA
========================================================= */

let alphabet = [];

let states = [];

let transitions = [];

let stateNumber = 0;

let selectedState = null;

let selectedTransition = null;

let hoveredTransition = null;

let transitionStart = null;

let currentTool = "create";

let isDragging = false;

let isDraggingTransition = false;

let draggedTransition = null;

let wasDragging = false;

let justDragged = false;

let dragOffsetX = 0;

let dragOffsetY = 0;

let mouseDownTime = 0;



/* =========================================================
   HISTORY
========================================================= */

let undoStack = [];

let redoStack = [];

let activityLog = [];


/* =========================================================
   STATE NAMING
========================================================= */

let namingMode =
    "q";


/* =========================================================
   CONSTANTS
========================================================= */

const STATE_RADIUS = 32;

const ARROW_SIZE = 9;


/* =========================================================
   SNAPSHOT
========================================================= */

function createSnapshot() {

    return {
        alphabet:
            JSON.parse(
                JSON.stringify(alphabet)
            ),

        states:
            JSON.parse(
                JSON.stringify(states)
            ),

        transitions:
            JSON.parse(
                JSON.stringify(transitions)
            ),

        stateNumber,

        namingMode
    };

}


/* =========================================================
   RESTORE SNAPSHOT
========================================================= */

function restoreSnapshot(snapshot) {

    alphabet =
        JSON.parse(
            JSON.stringify(snapshot.alphabet)
        );

    states =
        JSON.parse(
            JSON.stringify(snapshot.states)
        );

    transitions =
        JSON.parse(
            JSON.stringify(snapshot.transitions)
        );

    stateNumber =
        snapshot.stateNumber;

    namingMode =
        snapshot.namingMode || "q";


    stateNamingMode.value =
        namingMode;

    syncCustomDropdown(namingMode);


    customStateName.disabled =
        namingMode !== "custom";

    selectedTransition = null;
    hoveredTransition = null;

    updateAll();

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory(actionName) {

    undoStack.push(
        createSnapshot()
    );

    if (undoStack.length > 100) {

        undoStack.shift();

    }

    redoStack = [];

    addActivity(actionName);

    updateHistoryButtons();

}


/* =========================================================
   UNDO
========================================================= */

function undoAction() {

    if (undoStack.length === 0) {

        return;

    }


    redoStack.push(
        createSnapshot()
    );


    const snapshot =
        undoStack.pop();


    restoreSnapshot(snapshot);


    addActivity(
        "Undid previous action"
    );


    updateHistoryButtons();

}


/* =========================================================
   REDO
========================================================= */

function redoAction() {

    if (redoStack.length === 0) {

        return;

    }


    undoStack.push(
        createSnapshot()
    );


    const snapshot =
        redoStack.pop();


    restoreSnapshot(snapshot);


    addActivity(
        "Redid previous action"
    );


    updateHistoryButtons();

}


/* =========================================================
   UPDATE HISTORY BUTTONS
========================================================= */

function updateHistoryButtons() {

    const disabledUndo =
        undoStack.length === 0;

    const disabledRedo =
        redoStack.length === 0;


    undoBtn.disabled =
        disabledUndo;

    redoBtn.disabled =
        disabledRedo;


    drawerUndoBtn.disabled =
        disabledUndo;

    drawerRedoBtn.disabled =
        disabledRedo;

}


/* =========================================================
   ACTIVITY LOG
========================================================= */

function addActivity(message) {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    activityLog.unshift({

        message,

        time

    });


    if (activityLog.length > 60) {

        activityLog =
            activityLog.slice(
                0,
                60
            );

    }


    renderActivity();

}


/* =========================================================
   RENDER ACTIVITY
========================================================= */

function renderActivity() {

    if (
        !activityHistory
    ) {

        return;

    }


    if (
        activityLog.length === 0
    ) {

        activityHistory.innerHTML = `
            <div class="empty-history">
                No activity yet.
            </div>
        `;

        return;

    }


    activityHistory.innerHTML =
        activityLog
            .map(
                item => `
                    <div class="activity-item">

                        <strong>
                            ${escapeHTML(item.message)}
                        </strong>

                        <time>
                            ${escapeHTML(item.time)}
                        </time>

                    </div>
                `
            )
            .join("");

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ALPHABET
========================================================= */

setAlphabetBtn.addEventListener(
    "click",
    function () {

        const input =
            alphabetInput.value.trim();


        if (input === "") {

            alert(
                "Please enter at least one alphabet symbol."
            );

            return;

        }


        const newAlphabet =
            input
                .split(",")
                .map(
                    symbol =>
                        symbol.trim()
                )
                .filter(
                    symbol =>
                        symbol !== ""
                );


        alphabet =
            [...new Set(newAlphabet)];


        addActivity(
            `Alphabet set to ${alphabet.join(", ")}`
        );


        updateAll();

    }
);


/* =========================================================
   DISPLAY ALPHABET
========================================================= */

function displayAlphabet() {

    alphabetDisplay.innerHTML = "";


    if (
        alphabet.length === 0
    ) {

        alphabetDisplay.textContent =
            "No alphabet defined.";

        return;

    }


    alphabet.forEach(
        symbol => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "alphabet-symbol";


            element.textContent =
                symbol;


            alphabetDisplay.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   STATE NAMING MODE
========================================================= */

stateNamingMode.addEventListener(
    "change",
    function () {

        namingMode =
            stateNamingMode.value;

        syncCustomDropdown(namingMode);


        customStateName.disabled =
            namingMode !== "custom";


        if (
            namingMode !== "custom"
        ) {

            customStateName.value =
                "";

        }


        addActivity(
            `State naming changed to ${getNamingLabel()}`
        );

    }
);


/* =========================================================
   CUSTOM STATE NAMING DROPDOWN
========================================================= */

function syncCustomDropdown(value) {

    const triggerLabel =
        document.getElementById("stateNamingLabel");

    const menu =
        document.getElementById("stateNamingMenu");

    if (!menu) {
        return;
    }


    const options =
        menu.querySelectorAll(".dropdown-option");

    options.forEach(opt => {

        const isSelected =
            opt.dataset.value === value;

        opt.classList.toggle("selected", isSelected);
        opt.setAttribute("aria-selected", isSelected ? "true" : "false");

        if (isSelected && triggerLabel) {

            const textSpan =
                opt.querySelector(".option-text");

            if (textSpan) {
                triggerLabel.textContent =
                    textSpan.textContent.trim();
            }

        }

    });

}


function setupCustomDropdown() {

    const dropdown =
        document.getElementById("stateNamingDropdown");

    const trigger =
        document.getElementById("stateNamingTrigger");

    const menu =
        document.getElementById("stateNamingMenu");

    if (!dropdown || !trigger || !menu) {
        return;
    }


    function toggleMenu() {

        if (dropdown.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }

    }


    function openMenu() {

        dropdown.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");

    }


    function closeMenu() {

        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");

    }


    trigger.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();
        toggleMenu();

    });


    const options =
        menu.querySelectorAll(".dropdown-option");

    options.forEach(opt => {

        function selectThisOption() {

            const val =
                opt.dataset.value;

            if (stateNamingMode.value !== val) {
                stateNamingMode.value = val;
                stateNamingMode.dispatchEvent(new Event("change"));
            } else {
                syncCustomDropdown(val);
            }

            closeMenu();
            trigger.focus();

        }


        opt.addEventListener("click", function (e) {

            e.preventDefault();
            e.stopPropagation();
            selectThisOption();

        });


        opt.addEventListener("keydown", function (e) {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectThisOption();
            }

        });

    });


    document.addEventListener("click", function (e) {

        if (!dropdown.contains(e.target)) {
            closeMenu();
        }

    });


    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape" && dropdown.classList.contains("open")) {
            closeMenu();
            trigger.focus();
        }

    });


    syncCustomDropdown(stateNamingMode.value || namingMode);

}


/* =========================================================
   NAMING LABEL
========================================================= */

function getNamingLabel() {

    if (
        namingMode === "letters"
    ) {

        return "A, B, C, D";

    }


    if (
        namingMode === "custom"
    ) {

        return "Custom";

    }


    return "q0, q1, q2";

}


/* =========================================================
   NEXT STATE NAME
========================================================= */

function getNextStateName() {

    if (
        namingMode === "letters"
    ) {

        let index =
            states.length;

        let name = "";


        do {

            name =
                numberToLetters(index);

            index++;

        } while (
            states.some(
                state =>
                    state.name === name
            )
        );


        return name;

    }


    if (
        namingMode === "custom"
    ) {

        const custom =
            customStateName.value.trim();


        if (custom !== "") {

            return custom;

        }


        return `State ${states.length + 1}`;

    }


    let index =
        stateNumber;


    let name;


    do {

        name =
            `q${index}`;

        index++;

    } while (
        states.some(
            state =>
                state.name === name
        )
    );


    stateNumber =
        index;


    return name;

}


/* =========================================================
   LETTER CONVERTER
========================================================= */

function numberToLetters(number) {

    let result = "";

    let n =
        number;


    do {

        result =
            String.fromCharCode(
                65 + (n % 26)
            ) + result;

        n =
            Math.floor(n / 26) - 1;

    } while (
        n >= 0
    );


    return result;

}


/* =========================================================
   CANVAS SIZE
========================================================= */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;


    canvas.height =
        rect.height * dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    draw();

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   MOUSE POSITION
========================================================= */

function getMousePosition(event) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top

    };

}


/* =========================================================
   FIND STATE
========================================================= */

function getStateAt(x, y) {

    for (
        let i = states.length - 1;
        i >= 0;
        i--
    ) {

        const state =
            states[i];


        const distance =
            Math.sqrt(
                Math.pow(
                    x - state.x,
                    2
                ) +
                Math.pow(
                    y - state.y,
                    2
                )
            );


        if (
            distance <=
            STATE_RADIUS + 8
        ) {

            return state;

        }

    }


    return null;

}


/* =========================================================
   GEOMETRY & TRANSITION UTILITIES
========================================================= */

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) {
        return Math.hypot(px - ax, py - ay);
    }
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * dx;
    const projY = ay + t * dy;
    return Math.hypot(px - projX, py - projY);
}

function isPointNearTransitionLabel(x, y, transition) {
    if (!transition || !transition._render) {
        return false;
    }
    const lx = transition._render.labelX;
    const ly = transition._render.labelY;
    if (lx === undefined || ly === undefined) {
        return false;
    }
    const labelWidth = Math.max(26, (transition.symbol ? transition.symbol.length : 1) * 10 + 16);
    const labelHeight = 24;
    return (
        Math.abs(x - lx) <= labelWidth / 2 + 6 &&
        Math.abs(y - ly) <= labelHeight / 2 + 6
    );
}

function getTransitionCurvature(transition) {
    if (typeof transition.curvature === "number") {
        return transition.curvature;
    }

    const fromId = transition.from;
    const toId = transition.to;

    if (fromId === toId) {
        const selfList = transitions.filter(
            t => t.from === fromId && t.to === toId
        );
        const idx = selfList.findIndex(t => t.id === transition.id);
        return 92 + Math.max(0, idx) * 36;
    }

    const fwdList = transitions.filter(
        t => t.from === fromId && t.to === toId
    );
    const revList = transitions.filter(
        t => t.from === toId && t.to === fromId
    );
    const fwdIndex = fwdList.findIndex(t => t.id === transition.id);
    const hasReverse = revList.length > 0;

    if (hasReverse) {
        // Curve to the right of direction of travel so opposite transitions bow away from each other
        return 38 + Math.max(0, fwdIndex) * 28;
    }

    if (fwdList.length <= 1) {
        return 0; // Single direction with 1 transition is straight
    }

    // Multiple transitions in the same direction: stagger them symmetrically
    const count = fwdList.length;
    const step = 32;
    return (fwdIndex - (count - 1) / 2) * step;
}

function adjustTransitionCurve(transition, mouseX, mouseY) {
    const from = states.find(s => s.id === transition.from);
    const to = states.find(s => s.id === transition.to);
    if (!from || !to) {
        return;
    }

    if (from.id === to.id) {
        const dy = from.y - mouseY;
        transition.curvature = Math.round(Math.max(45, Math.min(260, dy)));
        return;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) {
        return;
    }

    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const delta = (mouseX - midX) * nx + (mouseY - midY) * ny;
    // For quadratic bezier, apex offset is h / 2, so h = delta * 2
    let h = delta * 2;
    h = Math.max(-280, Math.min(280, h));
    transition.curvature = Math.round(h);
}

function getTransitionAt(x, y) {
    // 1. Check labels first (easier to target precisely)
    for (let i = transitions.length - 1; i >= 0; i--) {
        const t = transitions[i];
        if (isPointNearTransitionLabel(x, y, t)) {
            return t;
        }
    }

    // 2. Check transition paths / curves
    for (let i = transitions.length - 1; i >= 0; i--) {
        const t = transitions[i];
        const r = t._render;
        if (!r) {
            continue;
        }

        if (r.isSelfLoop) {
            let prevX = r.startX;
            let prevY = r.startY;
            let hit = false;
            const steps = 16;
            for (let s = 1; s <= steps; s++) {
                const u = s / steps;
                const cu = 1 - u;
                const px =
                    cu * cu * cu * r.startX +
                    3 * cu * cu * u * r.cp1x +
                    3 * cu * u * u * r.cp2x +
                    u * u * u * r.endX;
                const py =
                    cu * cu * cu * r.startY +
                    3 * cu * cu * u * r.cp1y +
                    3 * cu * u * u * r.cp2y +
                    u * u * u * r.endY;

                if (pointToSegmentDistance(x, y, prevX, prevY, px, py) <= 9) {
                    hit = true;
                    break;
                }
                prevX = px;
                prevY = py;
            }
            if (hit) {
                return t;
            }
        } else {
            if (Math.abs(r.h || 0) < 1) {
                if (pointToSegmentDistance(x, y, r.startX, r.startY, r.endX, r.endY) <= 9) {
                    return t;
                }
            } else {
                let prevX = r.startX;
                let prevY = r.startY;
                let hit = false;
                const steps = 16;
                for (let s = 1; s <= steps; s++) {
                    const u = s / steps;
                    const cu = 1 - u;
                    const px = cu * cu * r.startX + 2 * cu * u * r.cpx + u * u * r.endX;
                    const py = cu * cu * r.startY + 2 * cu * u * r.cpy + u * u * r.endY;

                    if (pointToSegmentDistance(x, y, prevX, prevY, px, py) <= 9) {
                        hit = true;
                        break;
                    }
                    prevX = px;
                    prevY = py;
                }
                if (hit) {
                    return t;
                }
            }
        }
    }

    return null;
}



/* =========================================================
   CREATE STATE
========================================================= */

function createState(x, y) {

    saveHistory(
        "Created state"
    );


    const name =
        getNextStateName();


    const state = {

        id:
            `state-${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`,

        name,

        x,

        y,

        isStart:
            states.length === 0,

        isFinal:
            false

    };


    states.push(
        state
    );


    selectedState =
        state;


    if (
        namingMode === "custom"
    ) {

        customStateName.value =
            "";

    }


    addActivity(
        `Created state ${name}`
    );


    updateAll();

}


/* =========================================================
   SET START STATE
========================================================= */

function setStartState(state) {

    saveHistory(
        `Set ${state.name} as start state`
    );


    states.forEach(
        item => {

            item.isStart =
                false;

        }
    );


    state.isStart =
        true;


    selectedState =
        state;


    addActivity(
        `${state.name} set as start state`
    );


    updateAll();

}


/* =========================================================
   SET FINAL STATE
========================================================= */

function toggleFinalState(state) {

    saveHistory(
        `${state.isFinal ? "Removed final state from" : "Set"} ${state.name}`
    );


    state.isFinal =
        !state.isFinal;


    selectedState =
        state;


    addActivity(
        state.isFinal
            ? `${state.name} set as final state`
            : `${state.name} removed from final states`
    );


    updateAll();

}


/* =========================================================
   CREATE TRANSITION
========================================================= */

function createTransition(
    fromState,
    toState
) {

    if (
        alphabet.length === 0
    ) {

        alert(
            "Define the alphabet first."
        );

        return;

    }


    const symbol =
        prompt(
            `Transition from ${fromState.name} to ${toState.name}\n\nEnter one alphabet symbol:\n${alphabet.join(", ")}`
        );


    if (
        symbol === null
    ) {

        return;

    }


    const cleanSymbol =
        symbol.trim();


    if (
        !alphabet.includes(
            cleanSymbol
        )
    ) {

        alert(
            `Invalid symbol.\nUse one of: ${alphabet.join(", ")}`
        );

        return;

    }


    const existing =
        transitions.find(
            transition =>
                transition.from ===
                    fromState.id
                &&
                transition.symbol ===
                    cleanSymbol
        );


    if (existing) {

        const existingTarget =
            states.find(
                state =>
                    state.id ===
                    existing.to
            );


        alert(
            `A DFA transition already exists for ${fromState.name} with "${cleanSymbol}".\n\nCurrent destination: ${existingTarget ? existingTarget.name : "unknown"}`
        );

        return;

    }


    saveHistory(
        `Created transition ${fromState.name} → ${toState.name} (${cleanSymbol})`
    );


    transitions.push({

        id:
            `transition-${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`,

        from:
            fromState.id,

        to:
            toState.id,

        symbol:
            cleanSymbol

    });


    addActivity(
        `Created transition ${fromState.name} --${cleanSymbol}--> ${toState.name}`
    );


    updateAll();

}


/* =========================================================
   DELETE STATE ACTION
========================================================= */

function deleteState(state) {

    if (!state) {
        return;
    }


    saveHistory(
        `Deleted state ${state.name}`
    );


    transitions =
        transitions.filter(
            transition =>
                transition.from !==
                    state.id
                &&
                transition.to !==
                    state.id
        );


    states =
        states.filter(
            item =>
                item.id !==
                state.id
        );


    if (
        selectedState &&
        selectedState.id === state.id
    ) {
        selectedState =
            null;
    }


    if (
        selectedTransition &&
        (selectedTransition.from === state.id ||
         selectedTransition.to === state.id)
    ) {
        selectedTransition =
            null;
    }


    if (
        transitionStart &&
        transitionStart.id === state.id
    ) {
        transitionStart =
            null;
    }


    addActivity(
        `Deleted state ${state.name}`
    );


    updateAll();

}


/* =========================================================
   DELETE TRANSITION ACTION
========================================================= */

function deleteTransition(transition) {

    if (!transition) {
        return;
    }


    const fromState =
        states.find(
            s => s.id === transition.from
        );

    const toState =
        states.find(
            s => s.id === transition.to
        );

    const fromName =
        fromState ? fromState.name : "?";

    const toName =
        toState ? toState.name : "?";


    saveHistory(
        `Deleted transition ${fromName} → ${toName} (${transition.symbol})`
    );


    transitions =
        transitions.filter(
            t => t.id !== transition.id
        );


    if (
        selectedTransition &&
        selectedTransition.id === transition.id
    ) {
        selectedTransition = null;
    }

    if (
        hoveredTransition &&
        hoveredTransition.id === transition.id
    ) {
        hoveredTransition = null;
    }


    addActivity(
        `Deleted transition ${fromName} --${transition.symbol}--> ${toName}`
    );


    updateAll();

}


function deleteSelectedState() {

    if (selectedState) {

        deleteState(
            selectedState
        );

    } else if (selectedTransition) {

        deleteTransition(
            selectedTransition
        );

    } else {

        alert(
            "Select a state or transition first."
        );

    }

}


deleteSelectedBtn.addEventListener(
    "click",
    deleteSelectedState
);


/* KEYBOARD SHORTCUT (DEL / BACKSPACE) */

document.addEventListener(
    "keydown",
    function (event) {

        const activeTag =
            document.activeElement
                ? document.activeElement.tagName
                : "";


        if (
            activeTag === "INPUT" ||
            activeTag === "TEXTAREA" ||
            activeTag === "SELECT" ||
            (document.activeElement &&
             document.activeElement.isContentEditable)
        ) {
            return;
        }


        if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            if (selectedState) {
                event.preventDefault();
                deleteState(selectedState);
            } else if (selectedTransition) {
                event.preventDefault();
                deleteTransition(selectedTransition);
            }

        }

    }
);


/* =========================================================
   CANVAS CLICK
========================================================= */

canvas.addEventListener(
    "click",
    function (event) {

        if (justDragged) {
            justDragged = false;
            return;
        }

        const position =
            getMousePosition(
                event
            );

        const state =
            getStateAt(
                position.x,
                position.y
            );

        const transition =
            getTransitionAt(
                position.x,
                position.y
            );


        /* -----------------------------------------------
           ALT + CLICK: DELETE STATE OR TRANSITION
        ------------------------------------------------ */

        if (event.altKey) {

            if (
                transition &&
                (!state || isPointNearTransitionLabel(position.x, position.y, transition))
            ) {
                deleteTransition(transition);
                return;
            }

            if (state) {
                deleteState(state);
                return;
            }

            if (transition) {
                deleteTransition(transition);
                return;
            }

            return;

        }


        /* -----------------------------------------------
           DELETE MODE
        ------------------------------------------------ */

        if (
            currentTool ===
            "delete"
        ) {

            if (
                transition &&
                (!state || isPointNearTransitionLabel(position.x, position.y, transition))
            ) {
                deleteTransition(transition);
                return;
            }

            if (state) {
                deleteState(state);
                return;
            }

            if (transition) {
                deleteTransition(transition);
                return;
            }

            return;

        }


        /* -----------------------------------------------
           TRANSITION MODE
        ------------------------------------------------ */

        if (
            currentTool ===
            "transition"
        ) {

            if (!state) {

                transitionStart =
                    null;

                draw();

                return;

            }


            if (
                !transitionStart
            ) {

                transitionStart =
                    state;

                selectedState =
                    state;

                selectedTransition =
                    null;

                updateToolStatus();

                draw();

                return;

            }


            createTransition(
                transitionStart,
                state
            );


            transitionStart =
                null;


            updateToolStatus();

            draw();

            return;

        }


        /* -----------------------------------------------
           START MODE
        ------------------------------------------------ */

        if (
            currentTool ===
            "start"
        ) {

            if (state) {

                setStartState(
                    state
                );

            }

            return;

        }


        /* -----------------------------------------------
           FINAL MODE
        ------------------------------------------------ */

        if (
            currentTool ===
            "final"
        ) {

            if (state) {

                toggleFinalState(
                    state
                );

            }

            return;

        }


        /* -----------------------------------------------
           MOVE MODE
        ------------------------------------------------ */

        if (
            currentTool ===
            "move"
        ) {

            if (state) {

                selectedState =
                    state;

                selectedTransition =
                    null;

                draw();

            } else if (transition) {

                selectedTransition =
                    transition;

                selectedState =
                    null;

                draw();

            } else {

                selectedState =
                    null;

                selectedTransition =
                    null;

                draw();

            }

            return;

        }


        /* -----------------------------------------------
           DEFAULT CREATE MODE
        ------------------------------------------------ */

        if (state) {

            selectedState =
                state;

            selectedTransition =
                null;

            draw();

        } else if (transition) {

            selectedTransition =
                transition;

            selectedState =
                null;

            draw();

        } else {

            selectedState =
                null;

            selectedTransition =
                null;

            createState(
                position.x,
                position.y
            );

        }

    }
);


/* =========================================================
   DOUBLE CLICK = FINAL STATE / RESET CURVE
========================================================= */

canvas.addEventListener(
    "dblclick",
    function (event) {

        event.preventDefault();


        const position =
            getMousePosition(
                event
            );


        const state =
            getStateAt(
                position.x,
                position.y
            );


        if (state) {

            toggleFinalState(
                state
            );

            return;

        }


        const transition =
            getTransitionAt(
                position.x,
                position.y
            );


        if (transition && typeof transition.curvature === "number") {

            delete transition.curvature;

            saveHistory(
                "Reset transition curve"
            );

            addActivity(
                `Reset curve for transition (${transition.symbol})`
            );

            draw();

        }

    }
);


/* =========================================================
   RIGHT CLICK = START STATE
========================================================= */

canvas.addEventListener(
    "contextmenu",
    function (event) {

        event.preventDefault();


        const position =
            getMousePosition(
                event
            );


        const state =
            getStateAt(
                position.x,
                position.y
            );


        if (state) {

            setStartState(
                state
            );

        }

    }
);


/* =========================================================
   SHIFT + CLICK SUPPORT
========================================================= */

canvas.addEventListener(
    "mousedown",
    function (event) {

        mouseDownTime =
            Date.now();


        if (
            event.button !== 0
        ) {

            return;

        }


        /*
         * Guard: only handle Shift+mousedown if the
         * direct target is the canvas itself, so that
         * Shift-selecting text in result panels or other
         * elements does not accidentally switch the tool
         * to transition mode.
         */

        if (
            !event.shiftKey ||
            event.target !== canvas
        ) {

            return;

        }


        const position =
            getMousePosition(
                event
            );


        const state =
            getStateAt(
                position.x,
                position.y
            );


        if (!state) {

            return;

        }


        transitionStart =
            state;


        currentTool =
            "transition";


        updateToolStatus();

        draw();

    }
);


/* =========================================================
   MOUSE DOWN FOR DRAG (STATE OR TRANSITION CURVE)
========================================================= */

canvas.addEventListener(
    "mousedown",
    function (event) {

        if (
            event.button !== 0 ||
            event.shiftKey ||
            event.altKey
        ) {

            return;

        }


        const position =
            getMousePosition(
                event
            );


        const state =
            getStateAt(
                position.x,
                position.y
            );


        const transition =
            getTransitionAt(
                position.x,
                position.y
            );


        if (
            currentTool !==
            "move"
            &&
            currentTool !==
            "create"
        ) {

            return;

        }


        if (
            transition &&
            isPointNearTransitionLabel(position.x, position.y, transition)
        ) {

            selectedTransition =
                transition;

            selectedState =
                null;

            isDraggingTransition =
                true;

            draggedTransition =
                transition;

            wasDragging =
                false;

            draw();

            return;

        }


        if (state) {

            selectedState =
                state;

            selectedTransition =
                null;

            isDragging =
                true;

            wasDragging =
                false;

            dragOffsetX =
                position.x -
                state.x;

            dragOffsetY =
                position.y -
                state.y;

            draw();

            return;

        }


        if (transition) {

            selectedTransition =
                transition;

            selectedState =
                null;

            isDraggingTransition =
                true;

            draggedTransition =
                transition;

            wasDragging =
                false;

            draw();

            return;

        }

    }
);


/* =========================================================
   MOUSE MOVE
========================================================= */

canvas.addEventListener(
    "mousemove",
    function (event) {

        const position =
            getMousePosition(
                event
            );


        if (
            isDragging &&
            selectedState
        ) {

            wasDragging =
                true;

            selectedState.x =
                position.x -
                dragOffsetX;

            selectedState.y =
                position.y -
                dragOffsetY;

            clampStateToCanvas(
                selectedState
            );

            draw();

            return;

        }


        if (
            isDraggingTransition &&
            draggedTransition
        ) {

            wasDragging =
                true;

            adjustTransitionCurve(
                draggedTransition,
                position.x,
                position.y
            );

            draw();

            return;

        }


        /* Hover detection & cursor styling */

        const stateUnderMouse =
            getStateAt(
                position.x,
                position.y
            );

        const transitionUnderMouse =
            getTransitionAt(
                position.x,
                position.y
            );


        if (
            transitionUnderMouse !==
            hoveredTransition
        ) {

            hoveredTransition =
                transitionUnderMouse;

            draw();

        }


        if (
            event.altKey ||
            currentTool === "delete"
        ) {

            if (stateUnderMouse || transitionUnderMouse) {

                canvas.style.cursor =
                    "pointer";

            } else {

                canvas.style.cursor =
                    "default";

            }

        } else if (stateUnderMouse) {

            canvas.style.cursor =
                "move";

        } else if (transitionUnderMouse) {

            canvas.style.cursor =
                "grab";

        } else {

            canvas.style.cursor =
                currentTool === "create"
                    ? "crosshair"
                    : "default";

        }

    }
);


/* =========================================================
   MOUSE UP
========================================================= */

canvas.addEventListener(
    "mouseup",
    function () {

        if (
            isDraggingTransition &&
            draggedTransition
        ) {

            const t =
                draggedTransition;

            isDraggingTransition =
                false;

            draggedTransition =
                null;


            if (wasDragging) {

                justDragged =
                    true;

                setTimeout(
                    () => {
                        justDragged =
                            false;
                    },
                    70
                );

                const fromState =
                    states.find(
                        s => s.id === t.from
                    );

                const toState =
                    states.find(
                        s => s.id === t.to
                    );

                const fromName =
                    fromState ? fromState.name : "?";

                const toName =
                    toState ? toState.name : "?";

                saveHistory(
                    `Adjusted transition curve ${fromName} → ${toName} (${t.symbol})`
                );

                addActivity(
                    `Adjusted curve for transition ${fromName} --${t.symbol}--> ${toName}`
                );

                updateAll();

            }

            return;

        }


        if (
            !isDragging
        ) {

            return;

        }


        isDragging =
            false;


        if (wasDragging) {

            justDragged =
                true;

            setTimeout(
                () => {
                    justDragged =
                        false;
                },
                70
            );

            saveHistory(
                `Moved state ${selectedState ? selectedState.name : ""}`
            );

            addActivity(
                `Moved state ${selectedState ? selectedState.name : ""}`
            );

            updateAll();

        }

    }
);


/* =========================================================
   MOUSE LEAVE
========================================================= */

canvas.addEventListener(
    "mouseleave",
    function () {

        isDragging =
            false;

        isDraggingTransition =
            false;

        draggedTransition =
            null;

        if (hoveredTransition) {

            hoveredTransition =
                null;

            draw();

        }

    }
);


/* =========================================================
   DOCUMENT MOUSE UP – failsafe
========================================================= */

document.addEventListener(
    "mouseup",
    function () {

        if (
            isDragging
        ) {

            isDragging =
                false;

        }

        if (
            isDraggingTransition
        ) {

            isDraggingTransition =
                false;

            draggedTransition =
                null;

        }

    }
);


/* =========================================================
   CLAMP STATE
========================================================= */

function clampStateToCanvas(state) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    state.x =
        Math.max(
            STATE_RADIUS + 10,
            Math.min(
                width -
                    STATE_RADIUS -
                    10,
                state.x
            )
        );


    state.y =
        Math.max(
            STATE_RADIUS + 10,
            Math.min(
                height -
                    STATE_RADIUS -
                    10,
                state.y
            )
        );

}


/* =========================================================
   SET TOOL
========================================================= */

function setTool(tool) {

    currentTool =
        tool;


    transitionStart =
        null;


    document
        .querySelectorAll(
            ".designer-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tool ===
                        tool
                );

            }
        );


    updateToolStatus();

    draw();

}


/* =========================================================
   TOOL BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".designer-button[data-tool]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    setTool(
                        button.dataset.tool
                    );

                }
            );

        }
    );


/* =========================================================
   TOOL STATUS
========================================================= */

function updateToolStatus() {

    const labels = {

        create:
            "Create State — click empty canvas",

        start:
            "Set Start — click a state",

        final:
            "Set Final — click a state",

        transition:
            transitionStart
                ? `Transition source: ${transitionStart.name}`
                : "Create Transition — click source then target",

        move:
            "Move — drag a state or transition curve",

        delete:
            "Delete — click a state or transition to remove"

    };


    toolStatus.textContent =
        labels[currentTool] ||
        "Select a tool";


    if (
        transitionStart
    ) {

        toolStatusDot.style.background =
            "var(--yellow)";

        toolStatusDot.style.boxShadow =
            "0 0 12px var(--yellow)";

    } else if (
        currentTool === "delete"
    ) {

        toolStatusDot.style.background =
            "var(--red)";

        toolStatusDot.style.boxShadow =
            "0 0 12px var(--red)";

    } else {

        toolStatusDot.style.background =
            "var(--green)";

        toolStatusDot.style.boxShadow =
            "0 0 12px var(--green)";

    }

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawTransitions();


    states.forEach(
        state => {

            drawState(
                state
            );

        }
    );


    if (
        canvasHint
    ) {

        canvasHint.classList.toggle(
            "hidden",
            states.length > 0
        );

    }

}


/* =========================================================
   DRAW TRANSITIONS
========================================================= */

function drawTransitions() {

    const normalList = [];
    const activeList = [];

    transitions.forEach(
        transition => {
            if (
                (selectedTransition && selectedTransition.id === transition.id) ||
                (hoveredTransition && hoveredTransition.id === transition.id)
            ) {
                activeList.push(transition);
            } else {
                normalList.push(transition);
            }
        }
    );

    function renderSingleTransition(transition) {

        const from =
            states.find(
                state =>
                    state.id ===
                    transition.from
            );

        const to =
            states.find(
                state =>
                    state.id ===
                    transition.to
            );

        if (
            !from ||
            !to
        ) {
            return;
        }

        if (
            from.id ===
            to.id
        ) {
            drawSelfLoop(
                from,
                transition
            );
        } else {
            drawNormalTransition(
                from,
                to,
                transition
            );
        }

    }

    normalList.forEach(renderSingleTransition);
    activeList.forEach(renderSingleTransition);

}


/* =========================================================
   DRAW NORMAL TRANSITION (WITH AUTO-CURVE & MANUAL DRAG)
========================================================= */

function drawNormalTransition(
    from,
    to,
    transition
) {

    const dx =
        to.x -
        from.x;

    const dy =
        to.y -
        from.y;

    const distance =
        Math.hypot(
            dx,
            dy
        );

    if (
        distance < 1
    ) {
        return;
    }

    const ux =
        dx / distance;

    const uy =
        dy / distance;

    const nx =
        -uy;

    const ny =
        ux;

    const midX =
        (from.x + to.x) / 2;

    const midY =
        (from.y + to.y) / 2;

    const h =
        getTransitionCurvature(
            transition
        );

    const cpx =
        midX + nx * h;

    const cpy =
        midY + ny * h;

    let startX;
    let startY;
    let endX;
    let endY;
    let arrowAngle;
    let labelX;
    let labelY;

    if (Math.abs(h) < 1) {

        startX =
            from.x +
            ux * STATE_RADIUS;

        startY =
            from.y +
            uy * STATE_RADIUS;

        endX =
            to.x -
            ux * (STATE_RADIUS + 4);

        endY =
            to.y -
            uy * (STATE_RADIUS + 4);

        arrowAngle =
            Math.atan2(
                endY - startY,
                endX - startX
            );

        labelX =
            (startX + endX) / 2;

        labelY =
            (startY + endY) / 2;

    } else {

        const startAngle =
            Math.atan2(
                cpy - from.y,
                cpx - from.x
            );

        startX =
            from.x +
            Math.cos(startAngle) * STATE_RADIUS;

        startY =
            from.y +
            Math.sin(startAngle) * STATE_RADIUS;

        const endAngle =
            Math.atan2(
                cpy - to.y,
                cpx - to.x
            );

        endX =
            to.x +
            Math.cos(endAngle) * (STATE_RADIUS + 4);

        endY =
            to.y +
            Math.sin(endAngle) * (STATE_RADIUS + 4);

        arrowAngle =
            Math.atan2(
                endY - cpy,
                endX - cpx
            );

        labelX =
            0.25 * startX +
            0.5 * cpx +
            0.25 * endX;

        labelY =
            0.25 * startY +
            0.5 * cpy +
            0.25 * endY;

    }

    transition._render = {
        isSelfLoop: false,
        startX,
        startY,
        cpx,
        cpy,
        endX,
        endY,
        labelX,
        labelY,
        h,
        arrowAngle
    };

    const isSelected =
        selectedTransition &&
        selectedTransition.id === transition.id;

    const isHovered =
        hoveredTransition &&
        hoveredTransition.id === transition.id;

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    if (Math.abs(h) < 1) {
        ctx.lineTo(
            endX,
            endY
        );
    } else {
        ctx.quadraticCurveTo(
            cpx,
            cpy,
            endX,
            endY
        );
    }

    if (isSelected) {
        ctx.strokeStyle =
            "#ff70cb";
        ctx.lineWidth =
            3.2;
        ctx.shadowColor =
            "rgba(255,112,203,0.75)";
        ctx.shadowBlur =
            12;
    } else if (isHovered) {
        ctx.strokeStyle =
            "#d896ff";
        ctx.lineWidth =
            2.6;
        ctx.shadowColor =
            "rgba(216,150,255,0.6)";
        ctx.shadowBlur =
            9;
    } else {
        ctx.strokeStyle =
            "#b875ff";
        ctx.lineWidth =
            2.2;
        ctx.shadowColor =
            "rgba(184,117,255,0.45)";
        ctx.shadowBlur =
            7;
    }

    ctx.stroke();

    ctx.shadowBlur =
        0;


    /* ARROWHEAD */

    ctx.beginPath();

    ctx.moveTo(
        endX,
        endY
    );

    ctx.lineTo(
        endX -
            ARROW_SIZE *
                Math.cos(
                    arrowAngle -
                    Math.PI / 6
                ),
        endY -
            ARROW_SIZE *
                Math.sin(
                    arrowAngle -
                    Math.PI / 6
                )
    );

    ctx.lineTo(
        endX -
            ARROW_SIZE *
                Math.cos(
                    arrowAngle +
                    Math.PI / 6
                ),
        endY -
            ARROW_SIZE *
                Math.sin(
                    arrowAngle +
                    Math.PI / 6
                )
    );

    ctx.closePath();

    ctx.fillStyle =
        isSelected
            ? "#ffffff"
            : "#e48cff";

    ctx.fill();


    /* DRAG / CURVE CONTROL HALO INDICATOR */

    if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(
            labelX,
            labelY,
            16,
            0,
            Math.PI * 2
        );
        ctx.fillStyle =
            isSelected
                ? "rgba(255,112,203,0.18)"
                : "rgba(184,117,255,0.14)";
        ctx.fill();
        ctx.strokeStyle =
            isSelected
                ? "rgba(255,112,203,0.85)"
                : "rgba(216,150,255,0.5)";
        ctx.lineWidth =
            1;
        ctx.stroke();
    }


    /* LABEL */

    drawTransitionLabel(
        transition.symbol,
        labelX,
        labelY,
        isSelected,
        isHovered
    );

    ctx.restore();

}


/* =========================================================
   DRAW SELF LOOP (WITH MULTI-LOOP SPREAD & MANUAL DRAG)
========================================================= */

function drawSelfLoop(
    state,
    transition
) {

    const loopTop =
        state.y -
        STATE_RADIUS;

    const selfTransitions =
        transitions.filter(
            t => t.from === state.id && t.to === state.id
        );

    const selfIndex =
        selfTransitions.findIndex(
            t => t.id === transition.id
        );

    let cpHeight;
    let cpOffset;

    if (typeof transition.curvature === "number") {
        cpHeight =
            transition.curvature;
        cpOffset =
            Math.max(50, cpHeight * 0.78);
    } else {
        cpHeight =
            92 + Math.max(0, selfIndex) * 36;
        cpOffset =
            72 + Math.max(0, selfIndex) * 24;
    }

    const startX =
        state.x - 22;

    const startY =
        loopTop;

    const endX =
        state.x + 22;

    const endY =
        loopTop;

    const cp1x =
        state.x - cpOffset;

    const cp1y =
        state.y - cpHeight;

    const cp2x =
        state.x + cpOffset;

    const cp2y =
        state.y - cpHeight;

    const labelX =
        state.x;

    const labelY =
        state.y - cpHeight + 10;

    transition._render = {
        isSelfLoop: true,
        startX,
        startY,
        endX,
        endY,
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        labelX,
        labelY,
        cpHeight
    };

    const isSelected =
        selectedTransition &&
        selectedTransition.id === transition.id;

    const isHovered =
        hoveredTransition &&
        hoveredTransition.id === transition.id;

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    ctx.bezierCurveTo(
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        endX,
        endY
    );

    if (isSelected) {
        ctx.strokeStyle =
            "#ff70cb";
        ctx.lineWidth =
            3.2;
        ctx.shadowColor =
            "rgba(255,112,203,0.75)";
        ctx.shadowBlur =
            12;
    } else if (isHovered) {
        ctx.strokeStyle =
            "#ff9bd7";
        ctx.lineWidth =
            2.6;
        ctx.shadowColor =
            "rgba(255,155,215,0.6)";
        ctx.shadowBlur =
            9;
    } else {
        ctx.strokeStyle =
            "#ff6bc5";
        ctx.lineWidth =
            2.2;
        ctx.shadowColor =
            "rgba(255,107,197,0.45)";
        ctx.shadowBlur =
            8;
    }

    ctx.stroke();

    ctx.shadowBlur =
        0;


    /* ARROWHEAD AT RIGHT SIDE OF LOOP */

    const arrowAngle =
        Math.atan2(
            endY - cp2y,
            endX - cp2x
        );

    ctx.beginPath();

    ctx.moveTo(
        endX,
        endY
    );

    ctx.lineTo(
        endX -
            ARROW_SIZE *
                Math.cos(
                    arrowAngle -
                    Math.PI / 6
                ),
        endY -
            ARROW_SIZE *
                Math.sin(
                    arrowAngle -
                    Math.PI / 6
                )
    );

    ctx.lineTo(
        endX -
            ARROW_SIZE *
                Math.cos(
                    arrowAngle +
                    Math.PI / 6
                ),
        endY -
            ARROW_SIZE *
                Math.sin(
                    arrowAngle +
                    Math.PI / 6
                )
    );

    ctx.closePath();

    ctx.fillStyle =
        isSelected
            ? "#ffffff"
            : "#ff9bd7";

    ctx.fill();


    /* DRAG / CURVE CONTROL HALO INDICATOR */

    if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(
            labelX,
            labelY,
            16,
            0,
            Math.PI * 2
        );
        ctx.fillStyle =
            isSelected
                ? "rgba(255,112,203,0.18)"
                : "rgba(255,107,197,0.14)";
        ctx.fill();
        ctx.strokeStyle =
            isSelected
                ? "rgba(255,112,203,0.85)"
                : "rgba(255,155,215,0.5)";
        ctx.lineWidth =
            1;
        ctx.stroke();
    }


    /* LABEL */

    drawTransitionLabel(
        transition.symbol,
        labelX,
        labelY,
        isSelected,
        isHovered
    );

    ctx.restore();

}


/* =========================================================
   TRANSITION LABEL
========================================================= */

function drawTransitionLabel(
    symbol,
    x,
    y,
    isSelected = false,
    isHovered = false
) {

    ctx.save();

    ctx.font =
        "700 12px Inter";

    const textWidth =
        ctx.measureText(
            symbol
        ).width;

    const width =
        Math.max(
            24,
            textWidth + 14
        );

    const height =
        22;

    ctx.fillStyle =
        isSelected
            ? "rgba(34,14,48,0.96)"
            : isHovered
                ? "rgba(25,12,36,0.95)"
                : "rgba(13,9,21,0.92)";

    roundRect(
        ctx,
        x -
            width / 2,
        y -
            height / 2,
        width,
        height,
        7
    );

    ctx.fill();

    if (isSelected) {
        ctx.strokeStyle =
            "#ff70cb";
        ctx.lineWidth =
            1.8;
        ctx.shadowColor =
            "rgba(255,112,203,0.6)";
        ctx.shadowBlur =
            8;
    } else if (isHovered) {
        ctx.strokeStyle =
            "rgba(255,107,197,0.75)";
        ctx.lineWidth =
            1.3;
    } else {
        ctx.strokeStyle =
            "rgba(255,107,197,0.30)";
        ctx.lineWidth =
            1;
    }

    ctx.stroke();

    ctx.shadowBlur =
        0;

    ctx.fillStyle =
        isSelected
            ? "#ffffff"
            : "#ff9bd7";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        symbol,
        x,
        y
    );

    ctx.restore();

}


/* =========================================================
   ROUNDED RECT
========================================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.beginPath();

    context.moveTo(
        x + radius,
        y
    );

    context.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        radius
    );

    context.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        radius
    );

    context.arcTo(
        x,
        y + height,
        x,
        y,
        radius
    );

    context.arcTo(
        x,
        y,
        x + width,
        y,
        radius
    );

    context.closePath();

}


/* =========================================================
   DRAW STATE
========================================================= */

function drawState(state) {

    const selected =
        selectedState &&
        selectedState.id ===
            state.id;


    /* SELECTED OUTER RING */

    if (
        selected
    ) {

        ctx.beginPath();

        ctx.arc(
            state.x,
            state.y,
            41,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#ffbf4d";

        ctx.lineWidth =
            2;

        ctx.shadowColor =
            "rgba(255,191,77,0.6)";

        ctx.shadowBlur =
            12;

        ctx.stroke();

        ctx.shadowBlur =
            0;

    }


    /* START ARROW */

    if (
        state.isStart
    ) {

        drawStartArrow(
            state
        );

    }


    /* STATE */

    ctx.beginPath();

    ctx.arc(
        state.x,
        state.y,
        STATE_RADIUS,
        0,
        Math.PI * 2
    );


    const gradient =
        ctx.createRadialGradient(
            state.x - 10,
            state.y - 12,
            5,
            state.x,
            state.y,
            STATE_RADIUS
        );


    gradient.addColorStop(
        0,
        "#261738"
    );

    gradient.addColorStop(
        1,
        "#0f0b17"
    );


    ctx.fillStyle =
        gradient;

    ctx.fill();


    ctx.strokeStyle =
        state.isFinal
            ? "#ff5fc2"
            : "#9a67ff";

    ctx.lineWidth =
        2.5;


    ctx.shadowColor =
        state.isFinal
            ? "rgba(255,95,194,0.45)"
            : "rgba(154,103,255,0.40)";

    ctx.shadowBlur =
        10;


    ctx.stroke();


    ctx.shadowBlur =
        0;


    /* FINAL DOUBLE CIRCLE */

    if (
        state.isFinal
    ) {

        ctx.beginPath();

        ctx.arc(
            state.x,
            state.y,
            STATE_RADIUS - 7,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#ff78ca";

        ctx.lineWidth =
            2;

        ctx.stroke();

    }


    /* STATE NAME */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "700 14px Space Grotesk";


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        state.name,
        state.x,
        state.y
    );

}


/* =========================================================
   START ARROW
========================================================= */

function drawStartArrow(state) {

    const startX =
        state.x -
        STATE_RADIUS -
        55;


    const endX =
        state.x -
        STATE_RADIUS -
        4;


    const y =
        state.y;


    ctx.save();


    ctx.beginPath();

    ctx.moveTo(
        startX,
        y
    );

    ctx.lineTo(
        endX,
        y
    );


    ctx.strokeStyle =
        "#ff38a8";

    ctx.lineWidth =
        2.5;

    ctx.shadowColor =
        "rgba(255,56,168,0.50)";

    ctx.shadowBlur =
        8;

    ctx.stroke();


    ctx.shadowBlur =
        0;


    ctx.beginPath();

    ctx.moveTo(
        endX,
        y
    );

    ctx.lineTo(
        endX - 10,
        y - 6
    );

    ctx.lineTo(
        endX - 10,
        y + 6
    );

    ctx.closePath();


    ctx.fillStyle =
        "#ff72c5";

    ctx.fill();


    ctx.restore();

}


/* =========================================================
   TRANSITION TABLE
========================================================= */

function updateTransitionTable() {

    if (
        alphabet.length === 0
    ) {

        transitionTable.innerHTML = `
            <div class="empty-table">
                Define an alphabet first.
            </div>
        `;

        return;

    }


    if (
        states.length === 0
    ) {

        transitionTable.innerHTML = `
            <div class="empty-table">
                Create at least one state.
            </div>
        `;

        return;

    }


    let html = `
        <table>

            <thead>

                <tr>

                    <th>
                        State
                    </th>
    `;


    alphabet.forEach(
        symbol => {

            html += `
                <th>
                    ${escapeHTML(symbol)}
                </th>
            `;

        }
    );


    html += `
                </tr>

            </thead>

            <tbody>
    `;


    states.forEach(
        state => {

            const isSelected =
                selectedState &&
                selectedState.id === state.id;


            html += `
                <tr class="${isSelected ? "selected-row" : ""}">

                    <td class="state-cell">

                        ${
                            state.isStart
                                ? '<span class="start-marker">→</span> '
                                : ""
                        }

                        ${
                            state.isFinal
                                ? '<span class="final-marker">◎</span> '
                                : ""
                        }

                        ${escapeHTML(state.name)}

                    </td>
            `;


            alphabet.forEach(
                symbol => {

                    const transition =
                        transitions.find(
                            item =>
                                item.from ===
                                    state.id
                                &&
                                item.symbol ===
                                    symbol
                        );


                    if (
                        transition
                    ) {

                        const destination =
                            states.find(
                                item =>
                                    item.id ===
                                    transition.to
                            );


                        html += `
                            <td>
                                ${
                                    destination
                                        ? escapeHTML(
                                            destination.name
                                        )
                                        : "—"
                                }
                            </td>
                        `;

                    } else {

                        html += `
                            <td class="missing">
                                —
                            </td>
                        `;

                    }

                }
            );


            html += `
                </tr>
            `;

        }
    );


    html += `
            </tbody>

        </table>
    `;


    transitionTable.innerHTML =
        html;

}


/* =========================================================
   DFA STATUS
========================================================= */

function updateDFAStatus() {

    if (
        states.length === 0
    ) {

        setStatus(
            "ready",
            "READY",
            "Ready to build"
        );

        return;

    }


    if (
        alphabet.length === 0
    ) {

        setStatus(
            "warning",
            "WARNING",
            "Define an alphabet"
        );

        return;

    }


    const startState =
        states.find(
            state =>
                state.isStart
        );


    const finalStates =
        states.filter(
            state =>
                state.isFinal
        );


    if (
        !startState
    ) {

        setStatus(
            "warning",
            "WARNING",
            "Start state required"
        );

        return;

    }


    if (
        finalStates.length === 0
    ) {

        setStatus(
            "warning",
            "WARNING",
            "Add a final state"
        );

        return;

    }


    const transitionKeys =
        new Set();


    for (
        const transition of transitions
    ) {

        const key =
            `${transition.from}-${transition.symbol}`;


        if (
            transitionKeys.has(key)
        ) {

            setStatus(
                "error",
                "ERROR",
                "Duplicate transition detected"
            );

            return;

        }


        transitionKeys.add(
            key
        );

    }


    /*
     * A proper DFA needs exactly one
     * destination for each state/symbol.
     */

    for (
        const state of states
    ) {

        for (
            const symbol of alphabet
        ) {

            const transition =
                transitions.find(
                    item =>
                        item.from ===
                            state.id
                        &&
                        item.symbol ===
                            symbol
                );


            if (
                !transition
            ) {

                setStatus(
                    "warning",
                    "INCOMPLETE",
                    `${state.name} needs "${symbol}"`
                );

                return;

            }

        }

    }


    setStatus(
        "success",
        "VALID",
        "DFA structure valid"
    );

}


/* =========================================================
   STATUS UI
========================================================= */

function setStatus(
    type,
    title,
    message
) {

    dfaStatus.className =
        `dfa-status ${type}`;


    dfaStatus.innerHTML = `

        <span class="status-dot"></span>

        <div>

            <strong>
                ${escapeHTML(title)}
            </strong>

            <small>
                ${escapeHTML(message)}
            </small>

        </div>

    `;


    if (
        systemStatusText
    ) {

        systemStatusText.textContent =
            message;

    }

}


/* =========================================================
   UPDATE COUNTERS
========================================================= */

function updateStateCount() {

    stateCount.textContent =
        states.length;


    transitionCount.textContent =
        transitions.length;


    const start =
        states.find(
            state =>
                state.isStart
        );


    startStateInfo.textContent =
        start
            ? start.name
            : "—";


    const finals =
        states.filter(
            state =>
                state.isFinal
        );


    finalStateInfo.textContent =
        finals.length
            ? finals
                .map(
                    state =>
                        state.name
                )
                .join(", ")
            : "—";


    alphabetInfo.textContent =
        alphabet.length
            ? alphabet.join(", ")
            : "—";


    alphabetInfoCount.textContent =
        `${alphabet.length} input symbol${
            alphabet.length === 1
                ? ""
                : "s"
        }`;

}


/* =========================================================
   RUN DFA
========================================================= */

runBtn.addEventListener(
    "click",
    runDFA
);


function runDFA() {

    /*
     * Always restore design mode when the user presses
     * Run DFA — regardless of whether the run succeeds,
     * fails validation, or encounters missing transitions.
     * This ensures the canvas remains fully interactive
     * after every test, without requiring a page reload.
     */

    setTool(
        "create"
    );


    if (
        alphabet.length === 0
    ) {

        showError(
            "Please define the alphabet first."
        );

        return;

    }


    if (
        states.length === 0
    ) {

        showError(
            "Please create at least one state."
        );

        return;

    }


    const startState =
        states.find(
            state =>
                state.isStart
        );


    if (
        !startState
    ) {

        showError(
            "Please set a start state first."
        );

        return;

    }


    const input =
        inputString.value.trim();


    if (
        input === ""
    ) {

        showError(
            "Please enter an input string."
        );

        return;

    }


    const symbols =
        [...input];


    for (
        const symbol of symbols
    ) {

        if (
            !alphabet.includes(symbol)
        ) {

            showError(
                `Invalid input symbol "${symbol}".`
            );

            return;

        }

    }


    let current =
        startState;


    const steps = [

        {
            type:
                "start",

            to:
                current.name

        }

    ];


    let failed =
        false;


    for (
        let i = 0;
        i < symbols.length;
        i++
    ) {

        const symbol =
            symbols[i];


        const transition =
            transitions.find(
                item =>
                    item.from ===
                        current.id
                    &&
                    item.symbol ===
                        symbol
            );


        if (
            !transition
        ) {

            failed =
                true;


            steps.push({

                type:
                    "missing",

                from:
                    current.name,

                symbol,

                to:
                    "undefined"

            });


            break;

        }


        const next =
            states.find(
                state =>
                    state.id ===
                    transition.to
            );


        if (
            !next
        ) {

            failed =
                true;

            break;

        }


        steps.push({

            type:
                "transition",

            from:
                current.name,

            symbol,

            to:
                next.name

        });


        current =
            next;

    }


    const accepted =
        !failed &&
        current.isFinal;


    const message =
        failed
            ? "No transition was defined for one of the input symbols."
            : accepted
                ? "Input accepted."
                : "Input ended in a non-final state.";


    showSimulationResult(
        accepted,
        current,
        steps,
        message
    );


    showExecutionResult(
        accepted,
        input,
        current,
        steps
    );


    addActivity(
        `Input "${input}" ${
            accepted
                ? "accepted"
                : "rejected"
        }`
    );

}


/* =========================================================
   ERROR RESULT
========================================================= */

function showError(message) {

    result.innerHTML = `

        <div class="result-error">

            <div class="result-status">

                <span class="result-icon">
                    !
                </span>

                <span>
                    ERROR
                </span>

            </div>

            <div class="result-message">
                ${escapeHTML(message)}
            </div>

        </div>

    `;


    executionResult.innerHTML = `

        <div class="execution-empty">

            <div class="execution-icon">
                !
            </div>

            <strong>
                Execution stopped
            </strong>

            <small>
                ${escapeHTML(message)}
            </small>

        </div>

    `;

}


/* =========================================================
   SHOW SIMULATION RESULT
========================================================= */

function showSimulationResult(
    accepted,
    finalState,
    steps,
    message
) {

    const statusClass =
        accepted
            ? "result-accepted"
            : "result-rejected";


    let stepsHTML = "";


    steps.forEach(
        (step, index) => {

            if (
                step.type ===
                "start"
            ) {

                stepsHTML += `

                    <div class="simulation-step">

                        <span class="step-number">
                            START
                        </span>

                        <strong>
                            ${escapeHTML(step.to)}
                        </strong>

                    </div>

                `;

                return;

            }


            stepsHTML += `

                <div class="simulation-step">

                    <span class="step-number">
                        ${index}
                    </span>

                    <span>
                        ${escapeHTML(step.from)}
                    </span>

                    <span class="step-arrow">
                        -- ${escapeHTML(step.symbol)} →
                    </span>

                    <strong>
                        ${escapeHTML(step.to)}
                    </strong>

                </div>

            `;

        }
    );


    result.innerHTML = `

        <div class="${statusClass}">

            <div class="result-status">

                <span class="result-icon">

                    ${
                        accepted
                            ? "✓"
                            : "×"
                    }

                </span>

                <span>
                    ${
                        accepted
                            ? "ACCEPTED"
                            : "REJECTED"
                    }
                </span>

            </div>


            <div class="result-message">

                ${escapeHTML(message)}

            </div>


            <div class="simulation-title">
                DFA Trace
            </div>


            <div class="simulation-steps">

                ${stepsHTML}

            </div>


            <div class="final-state-info">

                Final State:

                <strong>
                    ${escapeHTML(finalState.name)}
                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   EXECUTION ENGINE
========================================================= */

function showExecutionResult(
    accepted,
    input,
    finalState,
    steps
) {

    let html = "";


    steps.forEach(
        (step, index) => {

            if (
                step.type ===
                "start"
            ) {

                html += `

                    <div class="execution-step">

                        <span class="step-index">
                            START
                        </span>

                        <strong>
                            ${escapeHTML(step.to)}
                        </strong>

                    </div>

                `;

                return;

            }


            html += `

                <div class="execution-step">

                    <span class="step-index">
                        ${index}
                    </span>

                    <span>
                        ${escapeHTML(step.from)}
                    </span>

                    <span>
                        --${escapeHTML(step.symbol)}→
                    </span>

                    <strong>
                        ${escapeHTML(step.to)}
                    </strong>

                </div>

            `;

        }
    );


    executionResult.innerHTML = `

        <div
            class="execution-card ${
                accepted
                    ? ""
                    : "rejected"
            }"
        >

            <div class="execution-card-header">

                <strong>

                    ${
                        accepted
                            ? "✓ ACCEPTED"
                            : "× REJECTED"
                    }

                </strong>

            </div>


            <div class="execution-input">

                Input:
                ${escapeHTML(input)}

            </div>


            <div class="execution-trace">

                <div class="execution-trace-title">
                    DFA Trace
                </div>

                ${html}

            </div>


            <div class="execution-final">

                Final State:

                <strong>
                    ${escapeHTML(finalState.name)}
                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   CLEAR AUTOMATON
========================================================= */

function clearAutomaton() {

    if (
        states.length === 0 &&
        transitions.length === 0 &&
        alphabet.length === 0
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Clear the entire automaton?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    saveHistory(
        "Cleared automaton"
    );


    states = [];

    transitions = [];

    alphabet = [];

    stateNumber = 0;

    selectedState = null;

    selectedTransition = null;

    hoveredTransition = null;

    transitionStart = null;


    alphabetInput.value =
        "";

    inputString.value =
        "";


    result.innerHTML = `

        <div class="empty-result">
            No input tested yet.
        </div>

    `;


    executionResult.innerHTML = `

        <div class="execution-empty">

            <div class="execution-icon">
                ⌁
            </div>

            <strong>
                No input tested yet
            </strong>

            <small>
                Enter an input string and click Run DFA.
            </small>

        </div>

    `;


    addActivity(
        "Cleared entire automaton"
    );


    updateAll();

}


/* =========================================================
   UNDO / REDO BUTTONS
========================================================= */

undoBtn.addEventListener(
    "click",
    undoAction
);


redoBtn.addEventListener(
    "click",
    redoAction
);


drawerUndoBtn.addEventListener(
    "click",
    undoAction
);


drawerRedoBtn.addEventListener(
    "click",
    redoAction
);


clearBtn.addEventListener(
    "click",
    clearAutomaton
);


drawerClearBtn.addEventListener(
    "click",
    clearAutomaton
);


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const light =
        document.body.classList.contains(
            "light-mode"
        );


    themeBtn.textContent =
        light
            ? "☀"
            : "☾";


    drawerThemeBtn.textContent =
        light
            ? "☀ Light Mode"
            : "☾ Dark Mode";


    addActivity(
        light
            ? "Light mode enabled"
            : "Dark mode enabled"
    );

    draw();

}


themeBtn.addEventListener(
    "click",
    toggleTheme
);


drawerThemeBtn.addEventListener(
    "click",
    toggleTheme
);


/* =========================================================
   HAMBURGER MENU
========================================================= */

function openMenu() {

    navigationDrawer.classList.add(
        "open"
    );

    menuOverlay.classList.add(
        "open"
    );

}


function closeMenu() {

    navigationDrawer.classList.remove(
        "open"
    );

    menuOverlay.classList.remove(
        "open"
    );

}


menuBtn.addEventListener(
    "click",
    openMenu
);


closeMenuBtn.addEventListener(
    "click",
    closeMenu
);


menuOverlay.addEventListener(
    "click",
    closeMenu
);


/* =========================================================
   NAVIGATION ITEMS
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.target;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    closeMenu();


                    if (
                        target
                    ) {

                        target.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }
    );


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
         * Ctrl/Cmd + Z
         */

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            !event.shiftKey &&
            event.key.toLowerCase() ===
                "z"
        ) {

            event.preventDefault();

            undoAction();

            return;

        }


        /*
         * Ctrl/Cmd + Shift + Z
         */

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.shiftKey &&
            event.key.toLowerCase() ===
                "z"
        ) {

            event.preventDefault();

            redoAction();

            return;

        }


        /*
         * Ctrl/Cmd + Y
         */

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() ===
                "y"
        ) {

            event.preventDefault();

            redoAction();

            return;

        }


        /*
         * Escape
         */

        if (
            event.key ===
            "Escape"
        ) {

            transitionStart =
                null;

            setTool(
                "create"
            );

        }

    }
);


/* =========================================================
   UPDATE ALL
========================================================= */

function updateAll() {

    displayAlphabet();

    updateStateCount();

    updateTransitionTable();

    updateDFAStatus();

    updateHistoryButtons();

    updateToolStatus();

    draw();

}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    setupCustomDropdown();

    stateNamingMode.value =
        namingMode;

    syncCustomDropdown(
        namingMode
    );


    customStateName.disabled =
        namingMode !== "custom";


    setTool(
        "create"
    );


    displayAlphabet();

    updateAll();

    renderActivity();


    setTimeout(
        function () {

            resizeCanvas();

        },
        100
    );

}


initialize();