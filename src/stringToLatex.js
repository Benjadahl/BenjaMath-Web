//Homemade string to latex parser

var matchParentheses = function (input, startIndex, reverse = false) {
  let depth = 0;
  for (i = startIndex; 0 < i && i < input.length; i = reverse ? i - 1 : i + 1) {
    if (input[i] === "(") {
      depth++;
    } else if (input[i] === ")") {
      depth--;
    }
    if (depth === 0) {
      return i;
    }
  }
  return -1;
}

var searchAll = function (input, searchValue) {
  //Input string
  let i = 0;
  let searchIndex = input.indexOf(searchValue, i);
  let result = [];
  while(searchIndex !== -1) {
    result.push(searchIndex);
    i = searchIndex + 1;
    searchIndex = input.indexOf(searchValue, i);
  }
  return result;
}

var replaceAtIndex = function (input, index, replacement) {
  let preIndex = input.substr(0, index);
  let postIndex = input.substr(index + 1, input.length + 1);
  return preIndex + replacement + postIndex;
}

var stringToLatex = function (input) {
  console.log(input);
  let occurences;

  //Turn exponential parentheses into latex notation
  occurences = searchAll(input,"^(");
  for (let i = 0; i < occurences.length; i++) {
    let endParentheses = matchParentheses(input, occurences[i] + 1);
    input = replaceAtIndex(input, occurences[i] + 1, "{");
    input = replaceAtIndex(input, endParentheses, "}");
  }

  //Replace all stars with \cdot
  occurences = searchAll(input, "*");
  for (let i = 0; i < occurences.length; i++) {
    input = input.replace("*", " \\cdot ");
  }

  //Turn parentheses around numerator and denomenator into latex notation
  occurences = searchAll(input, "/");
  for (let i = 0; i < occurences.length; i++) {
    let index = occurences[i];
    let start;
    let end;

    //Search for end of each term
    //Search left
    for (let j = index - 1; j >= 0; j--) {
      let isPlus = input[j] === "+";
      let isMinus = input[j] === "-";
      let isSlash = input[j] === "/";
      let isStar = input[j] === "*";

      if (isPlus || isMinus || isSlash || isStar) {
        start = j + 1;
        break;
      } else if (input[j] === ")") {
        start = matchParentheses(input, j, true);
        break;
      } else if (input[j] === "(") {
        start = j + 1;
        break;
      }
    }
    //Search right
    for (let j = index + 1; j < input.length; j++) {
      let isPlus = input[j] === "+";
      let isMinus = input[j] === "-";
      let isSlash = input[j] === "/";
      let isStar = input[j] === "*";

      if (isPlus || isMinus || isSlash || isStar) {
        end = j - 1;
        break;
      } else if (input[j] === "(") {
        end = matchParentheses(input, j, false);
      } else if (input[j] === ")") {
        end = j - 1;
      }
    }
    console.log("For i " + i + " start: " + start + " end: " + end);
    //input = input.replace("/", " x ");
  }

  return input;
}

module.exports = stringToLatex;
