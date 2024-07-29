{
  function buildBinaryExpression(head, tail) {
    return tail.reduce((result, element) => {
      return {
        type: "BinaryExpression",
        operator: element[1],
        left: result,
        right: element[3]
      };
    }, head);
  }
}

Start
  = Program

Program
  = __ statements:Statement* __ { return statements; }

Statement
  = VariableDeclaration
  / FunctionDeclaration
  / ClassDeclaration
  / IfStatement
  / SwitchStatement
  / WhileLoop
  / ForLoop
  / ReturnStatement
  / ExpressionStatement
  / AssignmentStatement

VariableDeclaration
  = "let" __ identifier:Identifier __ "=" __ value:Expression __ ";" __ { return { type: "VariableDeclaration", identifier, value }; }

FunctionDeclaration
  = "func" __ name:Identifier __ "(" __ params:ParameterList? __ ")" __ block:Block { return { type: "FunctionDeclaration", name, params: params || [], body: block }; }

ClassDeclaration
  = "class" __ name:Identifier __ "{" __ methods:FunctionDeclaration* __ "}" __ { return { type: "ClassDeclaration", name, methods }; }

IfStatement
  = "if" __ condition:Expression __ block:Block __ elseIfs:ElseIfClause* __ elseClause:ElseClause? __ "endif" __ { return { type: "IfStatement", condition, consequent: block, alternates: elseIfs, else: elseClause }; }

ElseIfClause
  = "elseif" __ condition:Expression __ block:Block __ { return { condition, consequent: block }; }

ElseClause
  = "else" __ block:Block __ { return block; }

SwitchStatement
  = "switch" __ "(" __ expression:Expression __ ")" __ "{" __ cases:SwitchCase* __ defaultCase:DefaultCase? __ "}" __ { return { type: "SwitchStatement", expression, cases, defaultCase }; }

SwitchCase
  = "case" __ value:Expression __ ":" __ body:Statement* { return { type: "SwitchCase", value, body }; }

DefaultCase
  = "default" __ ":" __ body:Statement* { return { type: "DefaultCase", body }; }

WhileLoop
  = "while" __ condition:Expression __ "{" __ body:Statement* __ "}" __ { return { type: "WhileLoop", condition, body }; }

ForLoop
  = "for" __ "(" __ init:ForInit __ ";" __ condition:Expression __ ";" __ update:Expression __ ")" __ block:Block { return { type: "ForLoop", init, condition, update, body: block }; }

ForInit
  = VariableDeclaration
  / AssignmentExpression
  / Expression

ReturnStatement
  = "return" __ value:Expression? __ ";" __ { return { type: "ReturnStatement", value }; }

ExpressionStatement
  = expr:Expression __ ";" __ { return { type: "ExpressionStatement", expression: expr }; }

AssignmentStatement
  = left:LeftHandSideExpression __ "=" __ right:Expression __ ";" __ { return { type: "AssignmentStatement", left, right }; }

Expression
  = AssignmentExpression
  / LogicalExpression

AssignmentExpression
  = left:LeftHandSideExpression __ "=" __ right:Expression { return { type: "AssignmentExpression", left, right }; }

LeftHandSideExpression
  = MemberExpression
  / Identifier

LogicalExpression
  = head:ComparisonExpression tail:(__ LogicalOperator __ ComparisonExpression)* {
      return buildBinaryExpression(head, tail);
    }

ComparisonExpression
  = head:AdditiveExpression tail:(__ ComparisonOperator __ AdditiveExpression)* {
      return buildBinaryExpression(head, tail);
    }

AdditiveExpression
  = head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* {
      return buildBinaryExpression(head, tail);
    }

MultiplicativeExpression
  = head:UnaryExpression tail:(__ MultiplicativeOperator __ UnaryExpression)* {
      return buildBinaryExpression(head, tail);
    }

UnaryExpression
  = operator:UnaryOperator __ expression:UnaryExpression { return { type: "UnaryExpression", operator, expression }; }
  / CallMemberExpression

CallMemberExpression
  = head:PrimaryExpression
    tail:(
      PropertyAccess
      / FunctionCall
    )* {
      return tail.reduce((result, element) => {
        if (element.type === "PropertyAccess") {
          return { type: "MemberExpression", object: result, property: element.property };
        } else if (element.type === "FunctionCall") {
          return { type: "FunctionCall", callee: result, arguments: element.arguments };
        }
      }, head);
    }

PropertyAccess
  = "." property:Identifier { return { type: "PropertyAccess", property }; }

FunctionCall
  = "(" __ args:ArgumentList? __ ")" { return { type: "FunctionCall", arguments: args || [] }; }

PrimaryExpression
  = Literal
  / Identifier
  / "(" __ expr:Expression __ ")" { return expr; }

Literal
  = value:Number { return { type: "Literal", value: parseFloat(value) }; }
  / value:String { return { type: "Literal", value: value }; }
  / value:Boolean { return { type: "Literal", value: value }; }

Identifier
  = name:$[a-zA-Z_][a-zA-Z0-9_]* { return { type: "Identifier", name: name }; }

MemberExpression
  = object:Identifier "." property:Identifier { return { type: "MemberExpression", object, property }; }

ParameterList
  = head:Identifier tail:(__ "," __ Identifier)* { return [head].concat(tail.map(([,,,param]) => param)); }

ArgumentList
  = head:Expression tail:(__ "," __ Expression)* { return [head].concat(tail.map(([,,,expr]) => expr)); }

Block
  = "{" __ body:Statement* __ "}" __ { return body; }

LogicalOperator
  = "and" / "or"

ComparisonOperator
  = "==" / "!=" / "<" / ">" / "<=" / ">="

AdditiveOperator
  = "+" / "-"

MultiplicativeOperator
  = "*" / "/" / "%"

UnaryOperator
  = "!" / "-"

Boolean
  = "true" { return true; }
  / "false" { return false; }

Number
  = $([0-9]+("."[0-9]+)?)

String
  = '"' chars:$[^"]* '"' { return chars; }

__ "whitespace"
  = ([ \t\n\r] / Comment)*

Comment
  = "//" [^\n]* "\n"?