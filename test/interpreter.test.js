import Interpreter from '../src/interpreter';

describe('Serpent Interpreter', () => {
  let interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
    interpreter.globalScope.print = jest.fn();
  });

  test('Variable declaration and assignment', () => {
    const code = `
      let x = 5;
      let y = 10;
      print(x);
      print(y);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(5);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(10);
  });

  test('Arithmetic operations', () => {
    const code = `
      let a = 5 + 3;
      let b = 10 - 4;
      let c = 3 * 4;
      let d = 20 / 5;
      print(a);
      print(b);
      print(c);
      print(d);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(8);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(6);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(12);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(4);
  });

  test('Function declaration and call', () => {
    const code = `
      func add(a, b) {
        return a + b;
      }
      let result = add(5, 3);
      print(result);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(8);
  });

  test('Class declaration and method call', () => {
    const code = `
      class Calculator {
        func multiply(a, b) {
          return a * b;
        }
      }
      let calc = Calculator();
      let result = calc.multiply(4, 5);
      print(result);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(20);
  });

  test('If-else statement', () => {
    const code = `
      let x = 10;
      if x > 5 {
        print("Greater");
      } elseif x < 5 {
        print("Less");
      } else {
        print("Equal");
      }
      endif
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith("Greater");
  });

  test('While loop', () => {
    const code = `
      let i = 0;
      while i < 3 {
        print(i);
        i = i + 1;
      }
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(0);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(1);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(2);
  });

  test('For loop', () => {
    const code = `
      for (let i = 0; i < 3; i = i + 1) {
        print(i);
      }
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(0);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(1);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(2);
  });

  test('Switch statement', () => {
    const code = `
      let x = 2;
      switch (x) {
        case 1:
          print("One");
        case 2:
          print("Two");
        default:
          print("Other");
      }
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith("Two");
  });

  test('Nested function calls', () => {
    const code = `
      func add(a, b) {
        return a + b;
      }
      func multiply(a, b) {
        return a * b;
      }
      let result = add(multiply(2, 3), 5);
      print(result);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(11);
  });

  test('Closure', () => {
    const code = `
      func makeAdder(x) {
        func adder(y) {
          return x + y;
        }
        return adder;
      }
      let add5 = makeAdder(5);
      let result = add5(3);
      print(result);
    `;
    interpreter.interpret(code);
    expect(interpreter.globalScope.print).toHaveBeenCalledWith(8);
  });
});