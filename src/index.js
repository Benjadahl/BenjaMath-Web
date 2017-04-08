var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var $ = require("jquery");
var algebra = require("algebra.js");
var math = require("mathjs");

console.log(math);

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
  while (mathTags.length > 0) {
    console.log("Evaluating");
    let element = mathTags[0];
    console.log(algebrite.eval(element.innerHTML).toString());
    let rs = math.parse(algebrite.eval(element.innerHTML).toString()).toTex();
    let ls = math.parse(element.innerHTML).toTex();
    let replaceString = katex.renderToString(ls + "=" + rs);
    $(element).replaceWith(replaceString);
  }

  element.innerHTML = data.getElementsByTagName("body")[0].innerHTML;
}
