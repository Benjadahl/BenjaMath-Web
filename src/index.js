var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var algebra = require("algebra.js");
var math = require("mathjs");
var stringToLatex = require("./stringToLatex.js");

var MQ = MathQuill.getInterface(2);
var mathquillTest = document.getElementById("mathquillTest");
MQ.MathField(mathquillTest);

console.log("Welcome to BenjaMath");

console.log(stringToLatex("-1/2 (b^2 / (a^2) - 4 c / a)^(1/2) - b / (2 a)^(3*(4+9))"));

CKEDITOR.replace("editor");

//Modify editor
//CKEDITOR.config.allowedContent = true;

var editor = CKEDITOR.instances.editor;

var equations = 0;

editor.addCommand( 'insertMathquill', {
  exec: function( editor ) {
    editor.insertHtml( '<span class="math" contenteditable="false">equation' + equations + '</span>' );
    equations++;
  }
});

editor.ui.addButton("mathQuill", {
  label: "Insert Equation",
  command: 'insertMathquill',
  toolbar: 'insert'
});

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
    let rs = algebrite.eval(element.innerHTML);
    let ls = element.innerHTML;
    /*try {
      ls = stringToLatex(element.innerHTML);
    } catch (err) {
      ls = element.innerHTML;
    }*/

    let replaceString = katex.renderToString(ls + "=" + rs);
    $(element).replaceWith(replaceString);
  }

  element.innerHTML = data.getElementsByTagName("body")[0].innerHTML;
}
