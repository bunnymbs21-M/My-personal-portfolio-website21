/* --- 1. SETUP ---
  First, we need to get references to the HTML elements
  we're going to interact with.
*/
const screen = document.querySelector('.screen');
const buttonsContainer = document.querySelector('.calc-buttons');

/*
  --- 2. STATE VARIABLES ---
  We need variables to keep track of the calculator's state.
*/

// 'buffer' holds the number currently being typed on the screen.
let buffer = '0';

// 'runningTotal' holds the result of the previous calculation.
let runningTotal = 0;

// 'previousOperator' stores the last operator clicked (e.g., '+', '−')
let previousOperator = null;

/*
  --- 3. THE MAIN CLICK EVENT LISTENER ---
  We use "Event Delegation" by adding ONE click listener to the
  entire '.calc-buttons' container.
*/
buttonsContainer.addEventListener('click', function(event) {
    // 1. Check if the clicked item is a button.
    if (!event.target.matches('button')) {
        return; // Do nothing if the user clicked the gap between buttons.
    }

    // 2. Get the value (the text) of the button that was clicked.
    const value = event.target.innerText;

    // 3. Decide if the button is a number or a symbol.
    if (isNaN(value)) {
        // This is a symbol (like '+', 'C', '=')
        handleSymbol(value);
    } else {
        // This is a number (like '7', '3')
        handleNumber(value);
    }

    // 4. Finally, update the screen text with the new buffer value.
    screen.innerText = buffer;
});

/*
  --- 4. HANDLER FUNCTIONS ---
  These functions contain the core logic for the calculator.
*/

/**
 * Handles what to do when a NUMBER is clicked or typed.
 * @param {string} numberString - The number (e.g., "7").
 */
function handleNumber(numberString) {
    if (buffer === '0') {
        // If the buffer is '0', replace it with the new number.
        buffer = numberString;
    } else {
        // Otherwise, append the new number to the buffer.
        buffer += numberString;
    }
}

/**
 * Handles what to do when a SYMBOL is clicked or typed.
 * @param {string} symbol - The symbol (e.g., "C", "+").
 */
function handleSymbol(symbol) {
    // A 'switch' statement is perfect for handling the different symbols.
    switch (symbol) {
        case 'C': // Clear button
            buffer = '0';
            runningTotal = 0;
            previousOperator = null;
            break;

        case '←': // Backspace button
            if (buffer.length === 1) {
                // If only one digit is left, reset to '0'.
                buffer = '0';
            } else {
                // Remove the last character from the buffer.
                buffer = buffer.substring(0, buffer.length - 1);
            }
            break;

        case '=': // Equals button
            if (previousOperator === null) {
                return; // Do nothing if no operator has been selected.
            }
            // Perform the calculation
            flushOperation(parseFloat(buffer));
            // Reset the operator and show the total in the buffer.
            previousOperator = null;
            buffer = String(runningTotal);
            runningTotal = 0; // Reset total for the next new calculation
            break;

        case '+':
        case '−':
        case '×':
        case '÷':
            // These are all math operators.
            handleMath(symbol);
            break;
    }
}

/**
 * Handles the logic when a math operator (+, −, ×, ÷) is used.
 * @param {string} symbol - The math operator symbol.
 */
function handleMath(symbol) {
    if (buffer === '0') {
        return; // Do nothing if no number has been typed.
    }

    // Convert the buffer (string) to a number for calculations.
    const floatBuffer = parseFloat(buffer);

    if (runningTotal === 0) {
        // This is the first number in the operation.
        runningTotal = floatBuffer;
    } else {
        // This is the second (or third, etc.) number.
        flushOperation(floatBuffer);
    }

    // Store the operator that was just clicked.
    previousOperator = symbol;
    // Reset the buffer to '0' to be ready for the next number.
    buffer = '0';
}

/**
 * Performs the actual calculation (the "flush").
 * It uses the 'runningTotal', the 'previousOperator',
 * and the new number from the buffer.
 * @param {number} floatBuffer - The current number on the screen.
 */
function flushOperation(floatBuffer) {
    // Handle division by zero
    if (previousOperator === '÷' && floatBuffer === 0) {
        buffer = 'Error';
        runningTotal = 0;
        return;
    }

    if (previousOperator === '+') {
        runningTotal += floatBuffer;
    } else if (previousOperator === '−') {
        runningTotal -= floatBuffer;
    } else if (previousOperator === '×') {
        runningTotal *= floatBuffer;
    } else if (previousOperator === '÷') {
        runningTotal /= floatBuffer;
    }
}

/*
  --- 5. KEYBOARD SUPPORT (FIXED) ---
  We add a new event listener to the whole window to "hear" key presses.
*/

window.addEventListener('keydown', function(event) {
    const key = event.key; // 'event.key' gives us the value of the key pressed

    if (key >= '0' && key <= '9') {
        // It's a number key
        handleNumber(key);
    } else if (key === '+') {
        // It's a plus key
        handleMath('+');
    } else if (key === '-') {
        // *** THIS IS THE FIX ***
        // Map the keyboard's hyphen '-' to the calculator's '−'
        handleMath('−');
    } else if (key === '*') {
        // Handle '*' for multiplication
        handleMath('×');
    } else if (key === '/') {
        // Handle '/' for division
        handleMath('÷');
    } else if (key === 'Enter' || key === '=') {
        // It's the Enter or Equals key
        // We need to prevent the default "click" behavior of the Enter key
        event.preventDefault(); 
        handleSymbol('=');
    } else if (key === 'Backspace') {
        // It's the Backspace key
        handleSymbol('←');
    } else if (key === 'Escape' || key.toLowerCase() === 'c' || key === 'Delete') {
        // It's the Escape, 'c', or Delete key (for 'C')
        handleSymbol('C');
    }

    // After handling the key, we must update the screen manually
    // because this listener is separate from the 'click' listener.
    screen.innerText = buffer;
});