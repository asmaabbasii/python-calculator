const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

const buttons = document.querySelectorAll(".buttons button");

const themeButton = document.getElementById("themeButton");
const clearHistoryButton = document.getElementById("clearHistory");
const historyContainer = document.getElementById("history");

let expression = "";


// -----------------------------
// Calculator
// -----------------------------

function updateDisplay() {

    expressionDisplay.textContent = expression || "0";

    if (!expression) {
        resultDisplay.textContent = "0";
        return;
    }

    try {

        const convertedExpression = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        const result = Function(
            `"use strict"; return (${convertedExpression})`
        )();

        if (Number.isFinite(result)) {
            resultDisplay.textContent = formatNumber(result);
        } else {
            resultDisplay.textContent = "Error";
        }

    } catch {
        resultDisplay.textContent = "";
    }
}


function formatNumber(number) {

    if (Number.isInteger(number)) {
        return number.toLocaleString("en-US");
    }

    return Number(number.toFixed(10)).toLocaleString("en-US");
}


// -----------------------------
// Add numbers / operators
// -----------------------------

function addValue(value) {

    if (value === ".") {

        const parts = expression.split(/[+\-*/]/);
        const currentNumber = parts[parts.length - 1];

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            currentNumber === "0"
        ) {
            expression += "0.";
            updateDisplay();
            return;
        }
    }


    if (["+", "-", "*", "/"].includes(value)) {

        if (expression === "") {
            return;
        }

        const lastCharacter = expression.slice(-1);

        if (["+", "-", "*", "/"].includes(lastCharacter)) {
            expression = expression.slice(0, -1);
        }

    }

    expression += value;

    updateDisplay();
}


// -----------------------------
// Calculate
// -----------------------------

function calculate() {

    if (!expression) {
        return;
    }

    try {

        const convertedExpression = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        const result = Function(
            `"use strict"; return (${convertedExpression})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        const formattedResult = formatNumber(result);

        addToHistory(expression, formattedResult);

        expression = String(result);

        expressionDisplay.textContent = formattedResult;
        resultDisplay.textContent = formattedResult;

    } catch {

        resultDisplay.textContent = "Error";

        setTimeout(() => {
            clearCalculator();
        }, 900);
    }
}


// -----------------------------
// Clear
// -----------------------------

function clearCalculator() {

    expression = "";

    expressionDisplay.textContent = "0";
    resultDisplay.textContent = "0";
}


// -----------------------------
// Backspace
// -----------------------------

function backspace() {

    if (!expression) {
        return;
    }

    expression = expression.slice(0, -1);

    updateDisplay();
}


// -----------------------------
// History
// -----------------------------

function addToHistory(expressionValue, resultValue) {

    const history = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
    );

    history.unshift({
        expression: expressionValue,
        result: resultValue
    });

    const limitedHistory = history.slice(0, 10);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(limitedHistory)
    );

    renderHistory();
}


function renderHistory() {

    const history = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
    );

    if (history.length === 0) {

        historyContainer.innerHTML = `
            <p class="empty-history">
                No calculations yet
            </p>
        `;

        return;
    }

    historyContainer.innerHTML = history.map(item => {

        return `
            <div class="history-item">
                <span class="history-expression">
                    ${item.expression}
                </span>

                <span class="history-result">
                    ${item.result}
                </span>
            </div>
        `;

    }).join("");
}


function clearHistory() {

    localStorage.removeItem("calculatorHistory");

    renderHistory();
}


// -----------------------------
// Theme
// -----------------------------

function loadTheme() {

    const savedTheme = localStorage.getItem("calculatorTheme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeButton.textContent = "🌙";

    } else {

        themeButton.textContent = "☀️";
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "calculatorTheme",
        isDark ? "dark" : "light"
    );

    themeButton.textContent =
        isDark ? "🌙" : "☀️";
}


// -----------------------------
// Button Events
// -----------------------------

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
            return;
        }

        if (action === "backspace") {
            backspace();
            return;
        }

        if (action === "calculate") {
            calculate();
            return;
        }

        if (value) {
            addValue(value);
        }

    });

});


// -----------------------------
// Keyboard Support
// -----------------------------

document.addEventListener("keydown", event => {

    const key = event.key;

    if (
        (key >= "0" && key <= "9") ||
        key === "." ||
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/" ||
        key === "%"
    ) {

        event.preventDefault();

        addValue(key);

        return;
    }


    if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

        return;
    }


    if (key === "Backspace") {

        event.preventDefault();

        backspace();

        return;
    }


    if (key === "Escape") {

        event.preventDefault();

        clearCalculator();

        return;
    }

});


// -----------------------------
// Event Listeners
// -----------------------------

themeButton.addEventListener(
    "click",
    toggleTheme
);

clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


// -----------------------------
// Start
// -----------------------------

loadTheme();
renderHistory();
updateDisplay();