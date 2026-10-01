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

let transitionStart = null;

let currentTool = "create";

let isDragging = false;

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


    customStateName.disabled =
        namingMode !== "custom";


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
   DELETE SELECTED STATE
========================================================= */

function deleteSelectedState() {

    if (
        !selectedState
    ) {

        alert(
            "Select a state first."
        );

        return;

    }


    const state =
        selectedState;


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


    selectedState =
        null;


    transitionStart =
        null;


    addActivity(
        `Deleted state ${state.name}`
    );


    updateAll();

}


deleteSelectedBtn.addEventListener(
    "click",
    deleteSelectedState
);


/* =========================================================
   CANVAS CLICK
========================================================= */

canvas.addEventListener(
    "click",
    function (event) {

        const position =
            getMousePosition(
                event
            );


        const state =
            getStateAt(
                position.x,
                position.y
            );


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

                draw();

            }

            return;

        }


        /* -----------------------------------------------
           DEFAULT CREATE MODE
        ------------------------------------------------ */

        if (!state) {

            createState(
                position.x,
                position.y
            );

        } else {

            selectedState =
                state;

            draw();

        }

    }
);


/* =========================================================
   DOUBLE CLICK = FINAL STATE
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


        if (
            !event.shiftKey
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
   MOUSE DOWN FOR DRAG
========================================================= */

canvas.addEventListener(
    "mousedown",
    function (event) {

        if (
            event.button !== 0 ||
            event.shiftKey
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


        if (
            currentTool !==
            "move"
            &&
            currentTool !==
            "create"
        ) {

            return;

        }


        selectedState =
            state;


        isDragging =
            true;


        dragOffsetX =
            position.x -
            state.x;


        dragOffsetY =
            position.y -
            state.y;


        draw();

    }
);


/* =========================================================
   MOUSE MOVE
========================================================= */

canvas.addEventListener(
    "mousemove",
    function (event) {

        if (
            !isDragging ||
            !selectedState
        ) {

            return;

        }


        const position =
            getMousePosition(
                event
            );


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

    }
);


/* =========================================================
   MOUSE UP
========================================================= */

canvas.addEventListener(
    "mouseup",
    function () {

        if (
            !isDragging
        ) {

            return;

        }


        isDragging =
            false;


        saveHistory(
            `Moved state ${selectedState ? selectedState.name : ""}`
        );


        addActivity(
            `Moved state ${selectedState ? selectedState.name : ""}`
        );


        updateAll();

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
            "Move State — drag a state"

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

    transitions.forEach(
        transition => {

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
    );

}


/* =========================================================
   DRAW NORMAL TRANSITION
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
        Math.sqrt(
            dx * dx +
            dy * dy
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


    const startX =
        from.x +
        ux *
            STATE_RADIUS;


    const startY =
        from.y +
        uy *
            STATE_RADIUS;


    const endX =
        to.x -
        ux *
            (STATE_RADIUS + 4);


    const endY =
        to.y -
        uy *
            (STATE_RADIUS + 4);


    ctx.save();


    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    ctx.lineTo(
        endX,
        endY
    );


    ctx.strokeStyle =
        "#b875ff";

    ctx.lineWidth =
        2.2;

    ctx.shadowColor =
        "rgba(184,117,255,0.45)";

    ctx.shadowBlur =
        7;

    ctx.stroke();


    ctx.shadowBlur =
        0;


    /* ARROWHEAD */

    const angle =
        Math.atan2(
            endY - startY,
            endX - startX
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
                    angle -
                    Math.PI / 6
                ),

        endY -
            ARROW_SIZE *
                Math.sin(
                    angle -
                    Math.PI / 6
                )
    );

    ctx.lineTo(
        endX -
            ARROW_SIZE *
                Math.cos(
                    angle +
                    Math.PI / 6
                ),

        endY -
            ARROW_SIZE *
                Math.sin(
                    angle +
                    Math.PI / 6
                )
    );

    ctx.closePath();


    ctx.fillStyle =
        "#e48cff";

    ctx.fill();


    /* LABEL */

    const labelX =
        (startX + endX) / 2;

    const labelY =
        (startY + endY) / 2;


    drawTransitionLabel(
        transition.symbol,
        labelX,
        labelY
    );


    ctx.restore();

}


/* =========================================================
   DRAW SELF LOOP
========================================================= */

function drawSelfLoop(
    state,
    transition
) {

    const radius =
        42;


    const loopTop =
        state.y -
        STATE_RADIUS;


    ctx.save();


    ctx.beginPath();


    /*
     * The loop is deliberately above
     * the state so it never hides
     * the state circle.
     */

    ctx.moveTo(
        state.x -
            22,
        loopTop
    );


    ctx.bezierCurveTo(

        state.x -
            72,

        state.y -
            92,

        state.x +
            72,

        state.y -
            92,

        state.x +
            22,

        loopTop

    );


    ctx.strokeStyle =
        "#ff6bc5";

    ctx.lineWidth =
        2.2;

    ctx.shadowColor =
        "rgba(255,107,197,0.45)";

    ctx.shadowBlur =
        8;

    ctx.stroke();


    ctx.shadowBlur =
        0;


    /*
     * Arrowhead at the
     * right side of loop.
     */

    const arrowX =
        state.x +
        22;

    const arrowY =
        loopTop;


    ctx.beginPath();

    ctx.moveTo(
        arrowX,
        arrowY
    );

    ctx.lineTo(
        arrowX -
            9,
        arrowY -
            5
    );

    ctx.lineTo(
        arrowX -
            8,
        arrowY +
            7
    );

    ctx.closePath();


    ctx.fillStyle =
        "#ff9bd7";

    ctx.fill();


    drawTransitionLabel(
        transition.symbol,
        state.x,
        state.y -
            82
    );


    ctx.restore();

}


/* =========================================================
   TRANSITION LABEL
========================================================= */

function drawTransitionLabel(
    symbol,
    x,
    y
) {

    ctx.save();


    ctx.font =
        "700 12px Inter";


    const width =
        ctx.measureText(
            symbol
        ).width +
        14;


    const height =
        22;


    ctx.fillStyle =
        "rgba(13,9,21,0.92)";


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


    ctx.strokeStyle =
        "rgba(255,107,197,0.30)";

    ctx.lineWidth =
        1;

    ctx.stroke();


    ctx.fillStyle =
        "#ff9bd7";


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

            html += `
                <tr>

                    <td class="state-cell">

                        ${
                            state.isStart
                                ? "→ "
                                : ""
                        }

                        ${
                            state.isFinal
                                ? "◎ "
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

    stateNamingMode.value =
        namingMode;


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