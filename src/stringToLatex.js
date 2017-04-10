//Homemade string to latex parser, not in use yet

var matchParentheses = function (input, startIndex) {
  let depth = 0;
  for (i = startIndex; i < input.length; i++) {
    if (input[i] === "(") {
      depth++;
    } else if (input[i] === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
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
  //Turn exponential parentheses into latex notation
  let occurences = searchAll(input,"^(");
  for (let i = 0; i < occurences.length; i++) {
    let endParentheses = matchParentheses(input, occurences[i] + 1);
    input = replaceAtIndex(input, occurences[i] + 1, "{");
    input = replaceAtIndex(input, endParentheses, "}");
  }
  //Turn parentheses around numerator and denomenator into latex notation
  
  return input;
}

module.exports = stringToLatex;
