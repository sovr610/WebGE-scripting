const Interpreter = require('../dist/serpent-interpreter').default;

const interpreter = new Interpreter();

//console.log('Initial global scope:', interpreter.globalScope);

// Add the print function to the global scope before interpreting
interpreter.globalScope.print = console.log;

//console.log('Global scope after adding print:', interpreter.globalScope);

const sourceCode = `
let x = 5;
let y = 10;

func add(a, b) {
  return a + b;
}

let i = 0;
while i < 3 {
    print(i);
    i = i + 1;
}
`;

//console.log('Source code:', sourceCode);

interpreter.interpret(sourceCode);