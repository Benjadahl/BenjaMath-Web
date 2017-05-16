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

/*
  BUTTON EVENT
*/
document.getElementById("printButton").addEventListener("click", function(){
  $("#mainContainer").hide();
  let editorContent = CKEDITOR.instances.editor.getData();
  $("body").append("<div id='printContent'>" + editorContent + "</div>");
  window.print();
  $("#printContent").remove();
  $("#mainContainer").show();
});

CKEDITOR.config.toolbar = 'Full';

CKEDITOR.config.bodyClass = 'document-editor';

CKEDITOR.config.toolbar_Full =
[
	{ name: 'document', items : [ 'Source','-','Save','NewPage','DocProps','Preview','Print','-','Templates' ] },
	{ name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
	{ name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
	{ name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
        'HiddenField' ] },
	{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
	{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv',
	'-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
	{ name: 'links', items : [ 'Link','Unlink','Anchor' ] },
	{ name: 'insert', items : [ 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','Iframe' ] },
	{ name: 'math', items: ["mathQuill", "mathSection"] },
	{ name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
	{ name: 'colors', items : [ 'TextColor','BGColor' ] },
	{ name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About' ] }
];

//Modify editor
CKEDITOR.config.allowedContent = true;
$(document).ready(function () {
  var editor = CKEDITOR.instances.editor;
  editor.addCommand( 'insertMathquill', {
    exec: function( editor ) {
      let id = 'Mq' + MqCount;
      editor.insertHtml( '<span class="mathQuill" id="' + id + '" contenteditable="false">placeholder</span>' );
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

  editor.addCommand( 'insertMathSection', {
    exec: function( editor ) {
      editor.insertHtml("<h5 class='math'>Script here<span contenteditable='false'> = null</span></h5>");
    }
  });

  editor.ui.addButton("mathQuill", {
    label: "Insert Equation",
    command: 'insertMathquill',
    toolbar: 'insert'
  });

  editor.ui.addButton("mathSection", {
    label: "New Math Section",
    command: 'insertMathSection',
    toolbar: 'insert'
  });

  editor.on("change", function() {
    renderPreview();
  });

  editor.on("instanceReady", function() {
    renderPreview();
  });
});

parser = new DOMParser();

function renderPreview () {
  var eData = CKEDITOR.instances.editor.getData();
  var mathTags = document.getElementsByClassName("math");
  for (var i = 0; i < mathTags.length; i++) {
    let scriptingText = $(mathTags[i]).clone().children().remove().end().text();
    let mathEvaluated = algebrite.eval(scriptingText).toString();
    $(mathTags[i]).children().last().html(" = " + mathEvaluated);
    console.log($(mathTags[i]).children().find(".MathQuill").attr("data-test"));
  }

  for (var i = 0; i < MathQuills.length; i++) {
    let latex = MathQuills[i].latex();
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
      $(MathQuills[i].el()).attr("data-test", result);
      //console.log(result);
    } else {
      result = new AlgebraLatex(latex).toMath();
    }
    //console.log(result);
    //$(MathQuills[i].el()).parent().children().last().html(' = ' + algebrite.eval(result).toString());
  }
}
