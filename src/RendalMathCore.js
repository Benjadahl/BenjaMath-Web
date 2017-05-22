var algebrite = require('algebrite');
const AlgebraLatex = require('algebra-latex');
var katex = require("katex");
var math = require("mathjs");

//Our list of variables. These are just for testing.
var variables = {
	pi: "22/7",
	tau: "pi\\cdot2",
};

function updateVariablesTable() {
	$("table > tbody").html("");
	for (var variable in variables) {
		$("table > tbody").append("<tr><td>" + variable + "</td><td>" + variables[variable] + "</td></tr>");
	}
}

/* DEFAULT MATH FUNCTIONS */
function simplify (expr) {
	return algebrite.simplify(expr).toLatexString();
}

function solve (eq, variable) {
	return algebrite.roots(eq, variable).toLatexString();
}

function fsolve (eq, variable) {
	return algebrite.nroots(eq, variable).toLatexString();
}

function factor (expr) {
	return algebrite.factor(expr).toLatexString();
}

function integral (expr, variable) {
	return algebrite.integral(expr, variable).toLatexString();
}


function evalf (expr) {
	//Use Math.js for evaluation
	return math.eval(expr);
}


//Converts a latex string to regular math string
function parseLatex (latex) {
	latex = pullVars(latex);
	return new AlgebraLatex(latex).toAlgebrite();
}

var parseRegexes = [
	/\\left/g,
	/\\right/g
];

function replaceRegexes(latex) {
	for (var regex in parseRegexes) {
		latex = latex.replace(parseRegexes[regex], "");
	}
	return latex;
}

//Search-replace variables with their values
//TODO: Get search/replace to work on other platforms than Windows
function pullVars(latex) {
	//We need to find variables inside variables. At the moment, we just seacrh and replace for variable names, until we find no more matches.
	var foundAnything = true;
	var limit = 100;
	while (foundAnything && limit > 0) {
		foundAnything = false;
		for (var variable in variables) {
			if (latex.includes(variable)) {
				latex = latex.replace(variable, variables[variable]);
				foundAnything = true;
			}
		}
		limit--;
	}
	return latex;
}


function replaceNotVars(latex) {
	var notVarRegexes = [
		/[0-9]/g,
		/\\cdot/g
	];

	for (var regex in notVarRegexes) {
		latex = latex.replace(notVarRegexes[regex], " ");
	}
	return latex;

}


function evalMath(mathString) {
	mathString =replaceRegexes(mathString);
	let latex = mathString;
	let result;
	let errorMessage = null;

	let toSet = null;

	if (latex.includes(":=")) {
		toSet = latex.split(":=")[0];
		latex = latex.split(":=")[1];

		var openParens = toSet.split("(").length-1;

		if (openParens > 1) {
			return "Invalid function assignment.";
		} else if (openParens == 1) {
			var functionRegex = /^([a-zA-Z]*)\((.*)\)$/;
			var matches = toSet.match(functionRegex);
			if (matches !== null) {
				var functionName = matches[1];
				var functionVariables = matches[2].replace(/ /g, "").split(",");
				var checkCode = replaceNotVars(latex).split(" ");
				var checksOut = true;
				variables[toSet] = latex;
				updateVariablesTable();
				return functionName + " rightarrow" + latex;
			} else {
				return "Invalid function assignment.";
			}
		} else {
			variables[toSet] = latex;
			updateVariablesTable();
			return toSet + "rightarrow" + latex;
		}

	}

	var inlineFunctionRegex = /([a-zA-Z]*)\((.*)\)/g;
	var inlineFunctions = latex.match(inlineFunctionRegex);
	if (inlineFunctions !== null) {
		//TODO: Something
		//
		var easyFuncRegex = /^[a-zA-Z]*\(/;
		var funcVariable = null;
		for (var variable in variables) {
			var funcName = variables[variable].match(easyFuncRegex)[1];
			if (funcName === inlineFunction[1]) {
				funcVariable = variable;
			}
		}
	}


	latex = pullVars(latex);



	//Check for it being an Algebrite command
	if (latex[0] === "@") {
		let depth = 0;
		let startPos;
		let endPos;
		for (j = 0; j < latex.length; j++) {
			if (latex[j] === "(") {
				startPos = j + 1;
				depth++;
			} else if (latex[j] === ")") {
				if (depth === 1) {
					//-6 because of the end being \right)
					endPos = j - 6;
					break;
				} else {
					depth--;
				}
			}
		}
		let stringMath = new AlgebraLatex(latex.substring(startPos, endPos)).toMath();
		result = latex.substring(1, startPos - 6) + "(" + stringMath + ")";
	} else {
		result = new AlgebraLatex(latex).toMath();
	}

	let evalResult = "";
	try {
		console.log(algebrite.eval(result).toLatexString());
		evalResult = katex.renderToString("\\, =" + algebrite.eval(result).toLatexString());
	} catch (exception) {
		evalResult = exception.toString();
	}

	return evalResult;
}


updateVariablesTable();
module.exports = { evalMath, simplify, solve, fsolve, factor, integral, parseLatex, evalf };
