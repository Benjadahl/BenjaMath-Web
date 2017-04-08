var algebrite = require("algebrite");
var katex = require("katex");

console.log("Welcome to BenjaMath");

console.log(algebrite.eval("2+2x*x").toString());

katex.render(algebrite.eval("2+2x*x").toString(), document.getElementById("renderElement"));
