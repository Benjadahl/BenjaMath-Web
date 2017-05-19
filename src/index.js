var algebrite = require("algebrite");
var katex = require("katex");
window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
require("ckeditor");
var algebra = require("algebra.js");
var math = require("mathjs");
var stringToLatex = require("./stringToLatex.js");
var RMC = require("./RendalMathCore.js");

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
CKEDITOR.config.startupFocus = true;

//When the toolbar disappears, just turn the event off. Yes, this is a good way to do it.
CKEDITOR.inline(document.getElementById("editor")).on('blur', function(e) {
	return false;
});

$(document).ready(function () {
  var editor = CKEDITOR.instances.editor;
  editor.addCommand( 'insertMathquill', {
    exec: function( editor ) {
      let id = MqCount;
      editor.insertHtml('<p contenteditable="false">&#8291<span class="mathField" id="' + id + '" contenteditable="false">placeholder</span><span>&nbsp;</span></p><p></p>');
      MqCount++;
      MathQuills.push(MQ.MathField(document.getElementById(id),
      {
        handlers: {
          enter: function () {
            console.log("test");
          }
        }
      }).select().focus());

			$("#" + id).keydown(function(e) {
				if (e.keyCode == 13) {
					let id = e.currentTarget.id;
					renderMathBox(id);
				}
			});
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
    toolbar: 'insert',
		label: "EQ"
  });

  editor.ui.addButton("mathSection", {
    label: "New Math Section",
    command: 'insertMathSection',
    toolbar: 'insert',
		label: "CODE"
  });

  editor.on("change", function() {
    renderPreview();
  });

  editor.on("instanceReady", function() {
    renderPreview();
  });

  //Set up custom contextMenu for the mathfields
  $(function() {
      $.contextMenu({
          selector: '.mathField',
          callback: function(key, options) {
            let mathQuill = MathQuills[$(this).attr("id")];
            let latex = mathQuill.latex();
            let mathString = RMC.parseLatex(latex);
            let resultElement = $(this).parent().children().last();
            let variable;
            switch (key) {
              case "simplify":
                $(resultElement).html(katex.renderToString("\\, =" + RMC.simplify(mathString)));
                break;
              case "solve":
                variable = prompt("Solve for variable: ","x");
                $(resultElement).html(katex.renderToString("\\, \\longrightarrow " + variable + " = " + RMC.solve(mathString, variable)));
                break;
              case "fsolve":
                variable = prompt("Solve for variable: ","x");
                $(resultElement).html(katex.renderToString("\\, \\longrightarrow " + variable + " = " + RMC.fsolve(mathString, variable)));
                break;
              case "factor":
              $(resultElement).html(katex.renderToString("\\, =" + RMC.factor(mathString)));
                break;
              case "integral":
                variable = prompt("Integrate with respect to varibale: ", "x");
                $(resultElement).html(katex.integral("\\, =" + RMC.simplify(mathString)));
                break;
            }
          },
          items: {
              "simplify": {name: "Simplify", icon: "fa-pie-chart"},
              "solve": {name: "Solve", icon: "fa-asterisk"},
              "fsolve": {name: "Fsolve", icon: "fa-cogs"},
              "factor": {name: "Factor", icon: "fa-plus-square-o"},
              "integral": {name: "Integral", icon: "fa-line-chart"}
          }
      });
  });
});

parser = new DOMParser();

function renderMathBox(id) {
	console.log("MQ:", MQ(document.getElementById(id)).latex());
	let latex = MQ(document.getElementById(id)).latex();
	$("#" + id).parent().children().last().html(RMC.evalMath(latex));
}

function renderPreview () {
	var eData = CKEDITOR.instances.editor.getData();
	var mathTags = document.getElementsByClassName("math");
	for (var i = 0; i < mathTags.length; i++) {
		let scriptingText = $(mathTags[i]).clone().children().remove().end().text();
		let mathEvaluated = algebrite.eval(scriptingText).toString();
		$(mathTags[i]).children().last().html(" = " + mathEvaluated);
	}
}
