import parser from './parser.js';

class Interpreter {
  constructor() {
    this.globalScope = {
      print: (...args) => console.log(...args)
    };
    this.currentScope = this.globalScope;
  }

  interpret(sourceCode) {
    const ast = parser.parse(sourceCode);
    console.log('AST:', JSON.stringify(ast, null, 2));
    return this.evaluateStatements(ast);
  }

  evaluateStatements(statements) {
    let result;
    for (const statement of statements) {
      result = this.evaluateStatement(statement);
      if (result && result.type === 'return') {
        return result.value;
      }
    }
    return result;
  }

  evaluateStatement(statement) {
    console.log('Evaluating statement:', JSON.stringify(statement, null, 2));
    switch (statement.type) {
      case 'VariableDeclaration':
        return this.evaluateVariableDeclaration(statement);
      case 'FunctionDeclaration':
        return this.evaluateFunctionDeclaration(statement);
      case 'ClassDeclaration':
        return this.evaluateClassDeclaration(statement);
      case 'IfStatement':
        return this.evaluateIfStatement(statement);
      case 'SwitchStatement':
        return this.evaluateSwitchStatement(statement);
      case 'WhileLoop':
        return this.evaluateWhileLoop(statement);
      case 'ForLoop':
        return this.evaluateForLoop(statement);
      case 'ReturnStatement':
        return this.evaluateReturnStatement(statement);
      case 'ExpressionStatement':
        return this.evaluateExpression(statement.expression);
      case 'AssignmentStatement':
        return this.evaluateAssignmentStatement(statement);
      default:
        throw new Error(`Unknown statement type: ${statement.type}`);
    }
  }

  evaluateVariableDeclaration(declaration) {
    const value = this.evaluateExpression(declaration.value);
    this.setVariable(declaration.identifier.name, value);
    return value;
  }

  evaluateFunctionDeclaration(declaration) {
    const func = (...args) => {
      const previousScope = this.currentScope;
      this.currentScope = Object.create(previousScope);
      
      declaration.params.forEach((param, index) => {
        this.currentScope[param.name] = args[index];
      });

      let result;
      for (const statement of declaration.body) {
        if (statement.type === 'FunctionDeclaration') {
          this.evaluateFunctionDeclaration(statement);
        } else {
          result = this.evaluateStatement(statement);
          if (result && result.type === 'return') {
            this.currentScope = previousScope;
            return result.value;
          }
        }
      }
      
      this.currentScope = previousScope;
      return result;
    };

    this.setVariable(declaration.name.name, func);
    return func;
  }

  evaluateClassDeclaration(declaration) {
    const ClassConstructor = (...args) => {
      const instance = Object.create(ClassConstructor.prototype);
      if (typeof instance.initialize === 'function') {
        instance.initialize.apply(instance, args);
      }
      return instance;
    };

    declaration.methods.forEach(method => {
      ClassConstructor.prototype[method.name.name] = this.evaluateFunctionDeclaration(method);
    });

    this.setVariable(declaration.name.name, ClassConstructor);
    return ClassConstructor;
  }

  evaluateIfStatement(statement) {
    if (this.evaluateExpression(statement.condition)) {
      return this.evaluateStatements(statement.consequent);
    } else {
      for (const elseIf of statement.alternates) {
        if (this.evaluateExpression(elseIf.condition)) {
          return this.evaluateStatements(elseIf.consequent);
        }
      }
      if (statement.else) {
        return this.evaluateStatements(statement.else);
      }
    }
  }

  evaluateSwitchStatement(statement) {
    const value = this.evaluateExpression(statement.expression);
    for (const caseStatement of statement.cases) {
      if (this.evaluateExpression(caseStatement.value) === value) {
        return this.evaluateStatements(caseStatement.body);
      }
    }
    if (statement.defaultCase) {
      return this.evaluateStatements(statement.defaultCase.body);
    }
  }

  evaluateWhileLoop(statement) {
    while (this.evaluateExpression(statement.condition)) {
      const result = this.evaluateStatements(statement.body);
      if (result && result.type === 'return') {
        return result;
      }
    }
  }

  evaluateForLoop(statement) {
    this.evaluateStatement(statement.init);
    while (this.evaluateExpression(statement.condition)) {
      const result = this.evaluateStatements(statement.body);
      if (result && result.type === 'return') {
        return result;
      }
      this.evaluateExpression(statement.update);
    }
  }

  evaluateReturnStatement(statement) {
    return { type: 'return', value: this.evaluateExpression(statement.value) };
  }

  evaluateAssignmentStatement(statement) {
    const value = this.evaluateExpression(statement.right);
    this.setVariable(statement.left.name, value);
    return value;
  }

  evaluateExpression(expression) {
    console.log('Evaluating expression:', JSON.stringify(expression, null, 2));
    switch (expression.type) {
      case 'AssignmentExpression':
        return this.evaluateAssignmentExpression(expression);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expression);
      case 'UnaryExpression':
        return this.evaluateUnaryExpression(expression);
      case 'Literal':
        return expression.value;
      case 'Identifier':
        return this.getVariable(expression.name);
      case 'FunctionCall':
        return this.evaluateFunctionCall(expression);
      case 'MemberExpression':
        return this.evaluateMemberExpression(expression);
      default:
        throw new Error(`Unknown expression type: ${expression.type}`);
    }
  }

  evaluateAssignmentExpression(expression) {
    const value = this.evaluateExpression(expression.right);
    if (expression.left.type === 'Identifier') {
      this.setVariable(expression.left.name, value);
    } else if (expression.left.type === 'MemberExpression') {
      const obj = this.evaluateExpression(expression.left.object);
      obj[expression.left.property.name] = value;
    } else {
      throw new Error('Invalid left-hand side in assignment');
    }
    return value;
  }

  evaluateBinaryExpression(expression) {
    const left = this.evaluateExpression(expression.left);
    const right = this.evaluateExpression(expression.right);

    switch (expression.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case 'and': return left && right;
      case 'or': return left || right;
      default:
        throw new Error(`Unknown binary operator: ${expression.operator}`);
    }
  }

  evaluateUnaryExpression(expression) {
    const value = this.evaluateExpression(expression.expression);

    switch (expression.operator) {
      case '!': return !value;
      case '-': return -value;
      default:
        throw new Error(`Unknown unary operator: ${expression.operator}`);
    }
  }

  evaluateFunctionCall(expression) {
    console.log('Evaluating function call:', JSON.stringify(expression, null, 2));
    const func = this.evaluateExpression(expression.callee);
    const args = expression.arguments.map(arg => this.evaluateExpression(arg));
    
    if (typeof func === 'function') {
      return func.apply(null, args);
    } else {
      throw new Error(`${JSON.stringify(expression.callee)} is not a function`);
    }
  }

  evaluateMemberExpression(expression) {
    const object = this.evaluateExpression(expression.object);
    return object[expression.property.name];
  }

  setVariable(name, value) {
    let scope = this.currentScope;
    while (scope) {
      if (name in scope) {
        scope[name] = value;
        return;
      }
      scope = Object.getPrototypeOf(scope);
    }
    this.currentScope[name] = value;
  }

  getVariable(name) {
    console.log('Getting variable:', name);
    console.log('Current scope:', this.currentScope);
    console.log('Global scope:', this.globalScope);
    let scope = this.currentScope;
    while (scope) {
      if (name in scope) {
        return scope[name];
      }
      scope = Object.getPrototypeOf(scope);
    }
    throw new Error(`Undefined variable: ${name}`);
  }
}

export default Interpreter;