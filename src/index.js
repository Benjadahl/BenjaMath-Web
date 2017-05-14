var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var algebra = require("algebra.js");
var math = require("mathjs");
var stringToLatex = require("./stringToLatex.js");
const AlgebraLatex = require("algebra-latex");

var MQ = MathQuill.getInterface(2);

console.log("Welcome to BenjaMath");

//console.log(stringToLatex("-1/2 (b^2 / (a^2) - 4 c / a)^(1/2) - b / (2 a)^(3*(4+9))"));

var MathQuills = [];
var MqCount = 0;

//Modify editor
CKEDITOR.config.allowedContent = true;
$(document).ready(function () {
  var editor = CKEDITOR.instances.editor;
  editor.addCommand( 'insertMathquill', {
    exec: function( editor ) {
      let id = 'Mq' + MqCount;
      editor.insertHtml( '<p contenteditable="false">&#8291<span id="' + id + '" contenteditable="false">placeholder</span><span>test</span></p><p></p>' );
      MqCount++;
      MathQuills.push(MQ.MathField(document.getElementById(id),
      {
        handlers: {
          enter: function () {
            console.log("test");
          }
        }
      }).select().focus());
      //Pretty bad hack - it makes the box editable and empty
      let currentQuill = MathQuills[MathQuills.length - 1];
      setTimeout(function(){
        currentQuill.clearSelection();
        currentQuill.latex("");
      }, 200);

      //Also hack when clicked
      currentQuill.el().addEventListener("click", function(){
        if (currentQuill.latex() === "") {
          currentQuill.latex("placeholder");
        }
        currentQuill.select();
        setTimeout(function(){
          currentQuill.clearSelection();
          if (currentQuill.latex() === "placeholder") {
            currentQuill.latex("");
          }
        }, 200);
      });
    }
  });

  editor.ui.addButton("mathQuill", {
    label: "Insert Equation",
    command: 'insertMathquill',
    toolbar: 'insert'
  });

  let previewElement = document.getElementById("preview");
  editor.on("change", function() {
    renderPreview(previewElement);
  });

  editor.on("instanceReady", function() {
    renderPreview(previewElement);
  });
});



parser = new DOMParser();

function renderPreview (element) {
  var eData = CKEDITOR.instances.editor.getData();
  var data = parser.parseFromString(eData, "text/html");
  //var mathTags = data.getElementsByClassName("math");

  for (var i = 0; i < MathQuills.length; i++) {
    let latex = MathQuills[i].latex();
    console.log($(MathQuills[i].el()).parent().children().last().html());

    let stringMath = new AlgebraLatex(latex).toMath();
    $(MathQuills[i].el()).parent().children().last().html(' = ' + algebrite.eval(stringMath).toString()); 
    console.log(algebrite.eval(stringMath).toString());
  }

  /*while (mathTags.length > 0) {
    console.log("Evaluating");
    let element = mathTags[0];
    console.log(algebrite.eval(element.innerHTML).toString());
    let rs = algebrite.eval(element.innerHTML);
    let ls = element.innerHTML;
    try {
      ls = stringToLatex(element.innerHTML);
    } catch (err) {
      ls = element.innerHTML;
    }

    let replaceString = katex.renderToString(ls + "=" + rs);
    $(element).replaceWith(replaceString);
  }*/

  element.innerHTML = data.getElementsByTagName("body")[0].innerHTML;
}
