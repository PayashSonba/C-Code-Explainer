let codeLines = [];
let explanations = [];
let currentLine = 0;

// C++ Example codes
const examples = {
    factorial:
        `#include <iostream>
using namespace std;

int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result = result * i;
    }
    return result;
}

int main() {
    int num = 5;
    cout << "Factorial of " << num << " is " << factorial(num) << endl;
    return 0;
}`,
    fibonacci:
        `#include <iostream>
using namespace std;

void printFibonacci(int n) {
    int a = 0, b = 1, c;
    cout << a << " " << b << " ";
    for (int i = 2; i < n; i++) {
        c = a + b;
        cout << c << " ";
        a = b;
        b = c;
    }
    cout << endl;
}

int main() {
    int n = 7;
    printFibonacci(n);
    return 0;
}`,
    sum:
        `#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum = sum + arr[i];
    }
    cout << "Sum is " << sum << endl;
    return 0;
}`
};

function loadExample(name) {
    if (examples[name]) {
        document.getElementById('code-input').value = examples[name];
        processCode();
        document.getElementById('explanation-output').innerHTML = '<em>Click "Execute & Trace" to start explanation.</em>';
        document.getElementById('current-line').textContent = "1";
        currentLine = 0;
    }
}

function explainLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '{' || trimmed === '}') return "";

    // Array declaration with initializer list: int arr[5] = {1, 2, 3, 4, 5};
    let arrayInit = trimmed.match(/^(int|float|double|char|string)\s+(\w+)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\};$/);
    if (arrayInit) {
        let type = arrayInit[1];
        let name = arrayInit[2];
        let values = arrayInit[3].split(',').map(s => s.trim()).filter(Boolean);
        let n = values.length;
        return `Declares an array of type '${type}' named '${name}' with ${n} elements: [${values.join(', ')}].`;
    }

    // Array declaration with size only: int arr[10];
    let arraySize = trimmed.match(/^(int|float|double|char|string)\s+(\w+)\s*\[\s*(\d+)\s*\];$/);
    if (arraySize) {
        let type = arraySize[1];
        let name = arraySize[2];
        let n = arraySize[3];
        return `Declares an array of type '${type}' named '${name}' with ${n} elements.`;
    }

    // Variable declaration with assignment (int x = 5;)
    let varDeclAssign = trimmed.match(/^(int|float|double|char|string)\s+(\w+)\s*=\s*([^;]+);$/);
    if (varDeclAssign)
        return `Declares a variable of type '${varDeclAssign[1]}' named '${varDeclAssign[2]}' and assigns it the value '${varDeclAssign[3].trim()}'.`;

    // Variable declaration without assignment (int x;)
    let varDecl = trimmed.match(/^(int|float|double|char|string)\s+(\w+);$/);
    if (varDecl)
        return `Declares a variable of type '${varDecl[1]}' named '${varDecl[2]}', but does not assign a value yet.`;

    // Variable assignment (x = 5;)
    let varAssign = trimmed.match(/^(\w+)\s*=\s*([^;]+);$/);
    if (varAssign)
        return `Assigns the value '${varAssign[2].trim()}' to the variable '${varAssign[1]}'.`;

    // Function definition (int foo(int a, int b) {)
    let funcDef = trimmed.match(/^(int|void|float|double|char|string)\s+(\w+)\s*\(([^)]*)\)\s*\{$/);
    if (funcDef) {
        let params = funcDef[3].trim() ? funcDef[3].trim() : "none";
        let retType = funcDef[1];
        let name = funcDef[2];
        let retExplain = "";
        if (retType === "int")
            retExplain = "This function returns an integer value (int).";
        else if (retType === "void")
            retExplain = "This function does not return any value (void).";
        else
            retExplain = `This function returns a value of type '${retType}'.`;
        if (name === "main") return `Defines the main function where program execution starts. ${retExplain}`;
        return `Defines a function named '${name}' that returns '${retType}' and takes parameters: ${params}. ${retExplain}`;
    }

    // Function call (foo(a, b);)
    let funcCall = trimmed.match(/^(\w+)\s*\(([^)]*)\);$/);
    if (funcCall) {
        let params = funcCall[2].trim() ? funcCall[2].trim() : "none";
        return `Calls the function '${funcCall[1]}' with arguments: ${params}.`;
    }

    // For loop (for (int i = 0; i < 5; i++))
    let forLoop = trimmed.match(/^for\s*\(\s*(int|size_t)?\s*(\w+)\s*=\s*([-\w]+)\s*;\s*\2\s*<\s*([-\w]+)\s*;\s*\2\s*([+\-]{2}|[+\-]=\s*\d+)\s*\)/);
    if (forLoop) {
        let varType = forLoop[1];
        let varName = forLoop[2];
        let startVal = forLoop[3];
        let endVal = forLoop[4];
        let update = forLoop[5];
        let times = "";
        try {
            times = parseInt(endVal) - parseInt(startVal);
            if (isNaN(times) || times < 0) times = "";
        } catch { times = ""; }
        return `This is a for loop: The loop variable '${varName}' starts at ${startVal}, the loop runs while '${varName}' is less than ${endVal}.` +
            (times ? ` So, the loop will iterate ${times} times.` : "") +
            ` On each iteration, '${varName}' changes as per '${update}'.`;
    }

    // General for loop
    if (trimmed.startsWith("for (") || trimmed.startsWith("for("))
        return "This is a for loop: it repeats a block of code a specific number of times, based on initialization, condition, and update expressions.";

    // While loop
    let whileLoop = trimmed.match(/^while\s*\((.+)\)/);
    if (whileLoop)
        return `This is a while loop: it repeats as long as the condition '${whileLoop[1].trim()}' is true. The condition is checked before each iteration.`;

    // Do-while loop
    if (trimmed.startsWith("do {") || trimmed.startsWith("do{"))
        return "This is a do-while loop: the block will execute at least once, then repeat if the condition is true (checked after the block).";

    // #include
    if (trimmed.startsWith("#include"))
        return "Includes a library needed for the program.";

    // using namespace
    if (trimmed.startsWith("using namespace"))
        return "Allows using standard C++ features without 'std::' prefix.";

    // cout
    if (trimmed.startsWith("cout"))
        return "Prints output to the console.";

    // cin
    if (trimmed.startsWith("cin"))
        return "Takes input from the user.";

    // return statement (return something;)
    let ret = trimmed.match(/^return\s+([^;]+);$/);
    if (ret) {
        let value = ret[1].trim();
        if (value === "0")
            return "Returns 0 from the function. In C++, returning 0 from main() signals successful program execution.";
        else
            return `Returns the value '${value}' from the function.`;
    }

    // comment
    if (trimmed.startsWith("//"))
        return "This is a comment.";

    return "";
}

function processCode() {
    const code = document.getElementById('code-input').value;
    codeLines = code.split('\n');
    explanations = [];
    for (const line of codeLines) {
        explanations.push(explainLine(line));
    }
    // Set currentLine to first valid line
    currentLine = 0;
}

function moveToValidLine(start, direction) {
    // direction: 1 for next, -1 for previous
    let idx = start;
    while (
        idx >= 0 &&
        idx < codeLines.length &&
        (
            !codeLines[idx].trim() ||
            codeLines[idx].trim() === '{' ||
            codeLines[idx].trim() === '}'
        )
    ) {
        idx += direction;
    }
    if (idx < 0 || idx >= codeLines.length) return -1;
    return idx;
}

function updateExplanation() {
    if (!codeLines.length) {
        document.getElementById('explanation-output').innerHTML = "<em>Explanation will appear here.</em>";
        document.getElementById('current-line').textContent = "-";
        return;
    }
    let idx = moveToValidLine(currentLine, 1);
    if (idx === -1) {
        document.getElementById('explanation-output').innerHTML = "<em>No more lines to explain.</em>";
        document.getElementById('current-line').textContent = "-";
        return;
    }
    currentLine = idx;
    const code = codeLines[currentLine];
    const explanation = explanations[currentLine];
    let html = `<span style="color:#50fa7b;font-weight:bold;">${code}</span>\n`;
    if (explanation)
        html += `<span style="color:#8be9fd;">Explanation:</span> ${explanation}`;
    else
        html += `<span style="color:#6272a4;">No explanation for this line.</span>`;
    document.getElementById('explanation-output').innerHTML = html;
    document.getElementById('current-line').textContent = currentLine + 1;
}

function nextLine() {
    if (!codeLines.length) processCode();
    let idx = moveToValidLine(currentLine + 1, 1);
    if (idx === -1) {
        document.getElementById('explanation-output').innerHTML = "<em>No more lines to explain.</em>";
        document.getElementById('current-line').textContent = "-";
        return;
    }
    currentLine = idx;
    updateExplanation();
}

function previousLine() {
    if (!codeLines.length) processCode();
    let idx = moveToValidLine(currentLine - 1, -1);
    if (idx === -1) {
        document.getElementById('explanation-output').innerHTML = "<em>No previous line to explain.</em>";
        document.getElementById('current-line').textContent = "-";
        return;
    }
    currentLine = idx;
    updateExplanation();
}

function startTrace() {
    processCode();
    currentLine = moveToValidLine(0, 1);
    updateExplanation();
}
