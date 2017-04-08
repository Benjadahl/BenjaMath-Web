var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var $ = require("jquery");
var algebra = require("algebra.js");

console.log("Welcome to BenjaMath");

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

  console.log(mathTags);

  while (mathTags.length > 0) {
    console.log("tagging");
    let element = mathTags[0];
    console.log(algebrite.eval(element.innerHTML));
    let mathResult = algebrite.eval(element.innerHTML).toString();
    let replaceString = katex.renderToString(algebra.toTex(algebra.parse(mathResult)));
    $(element).replaceWith(replaceString);
  }

  element.innerHTML = data.getElementsByTagName("body")[0].innerHTML;
}
