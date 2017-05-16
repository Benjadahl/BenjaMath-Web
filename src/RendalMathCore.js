var algebrite = require('algebrite');
const AlgebraLatex = require('algebra-latex');


function evalMath(mathString) {
	let latex = mathString;
	let result;

	//Check for it being an Algebrite command
	if (latex[0] === "@") {
		console.log("yay");
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

	return algebrite.eval(result).toString();
}

module.exports = { evalMath };
