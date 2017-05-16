var algebrite = require('algebrite');
const AlgebraLatex = require('algebra-latex');

//Our list of variables. These are just for testing.
var variables = {
	pi: "22/7",
	tau: "pi\\cdot2",
};

/* DEFAULT MATH FUNCTIONS */
function solve (eq, variable) {
	return algebrite.roots(eq, variable).toString();
}

//Converts a latex string to regular math string
function parseLatex (latex) {
	return new AlgebraLatex(latex).toMath();
}

function evalMath(mathString) {
	let latex = mathString;
	let result;

	let toSet = null;

	if (latex.includes(":=")) {
		toSet = latex.split(":=")[0];
		latex = latex.split(":=")[1];
	}

	//We need to find variables inside variables. At the moment, we just seacrh and replace for variable names, until we find no more matches.
	var foundAnything = true;
	var limit = 100;
	while (foundAnything && limit > 0) {
		foundAnything = false;
		for (variable in variables) {
			if (latex.includes(variable)) {
				latex = latex.replace(variable, variables[variable]);
				foundAnything = true;
			}
		}
		limit--;
	}



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
		if (toSet !== null) {
			evalResult = " " + toSet + ":=" + algebrite.eval(result).toString();
			variables[toSet] = algebrite.eval(result).toString();
		} else {
			evalResult = " = " + algebrite.eval(result).toString();
		}
	} catch (exception) {
		evalResult = exception.toString();
	}
	if (limit < 0) {
		evalResult = "Variables went wrong.";
	}

	return evalResult;
}

module.exports = { evalMath, solve, parseLatex };
