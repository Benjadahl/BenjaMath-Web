//Homemade string to latex parser, not in use yet

var stringToLatex = function (input) {
  //Turn exponential parentheses into latex notation
  input = input.replace(/\^\((.+?)\)/g, "^{$1}");
  //Turn parentheses around numerator and denomenator into latex notation
  //input = input.replace(/\((?>[^()]|(?R))*\)/g,"test")
  return input;
}

module.exports = stringToLatex;
