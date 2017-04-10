var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var $ = require("jquery");
var algebra = require("algebra.js");
var math = require("mathjs");
var stringToLatex = require("./stringToLatex.js");

console.log("Welcome to BenjaMath");

console.log(stringToLatex("-1/2 (b^2 / (a^2) - 4 c / a)^(1/2) - b / (2 a)^(3*(4+9))"));

CKEDITOR.replace("editor");


for (var i in CKEDITOR.instances) {
  let previewElement = document.getElementById("preview");

  CKEDITOR.instances[i].on("change", function() {
    renderPreview(previewElement);
  });
  CKEDITOR.instances[i].on("instanceReady", function() {
    renderPreview(previewElement);
  });
}

parser = new DOMParser();

function renderPreview (element) {
  var eData = CKEDITOR.instances.editor.getData();
  var data = parser.parseFromString(eData, "text/html");
  var mathTags = data.getElementsByTagName("em");
  while (mathTags.length > 0) {
    console.log("Evaluating");
    let element = mathTags[0];
    console.log(algebrite.eval(element.innerHTML).toString());
    let rs = stringToLatex(algebrite.eval(element.innerHTML).toString());
    let ls;
    try {
      ls = stringToLatex(element.innerHTML);
    } catch (err) {
      ls = element.innerHTML;
    }

    let replaceString = katex.renderToString(ls + "=" + rs);
    $(element).replaceWith(replaceString);
  }

  element.innerHTML = data.getElementsByTagName("body")[0].innerHTML;
}
