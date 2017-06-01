var algebrite = require("algebrite");
var katex = require("katex");
//window.CKEDITOR_BASEPATH = './node_modules/ckeditor/';
//require("ckeditor");
var algebra = require("algebra.js");
var RMC = require("./src/RendalMathCore.js");
var fileSaver = require("file-saver");
var MQ = MathQuill.getInterface(2);
var electron = require("electron");

var MathQuills = [];

var editor;

console.log("Welcome to BenjaMath");


electron.ipcRenderer.on("open", function (e, data) {
  console.log(data.html);
  CKEDITOR.instances.editor.setData(data.html);
  initMathquills();
});

/*
  Functions
*/
function newMathQuill (element) {
  MathQuills.push(MQ.MathField(element).select().focus());
  let currentQuill = MathQuills[MathQuills.length - 1];
  $(currentQuill.el()).keydown(function(e) {
    if (e.keyCode == 13) {
      let id = e.currentTarget.id;
      renderMathBox(id);
    }
  });
  //Pretty bad hack - it makes the box editable and empty
  setTimeout(function(){
    currentQuill.clearSelection();
    if (currentQuill.latex() === "placeholder") {
      currentQuill.latex("");
    }
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

function initMathquills () {
  let mathFields = document.getElementsByClassName("mathField");

  for (i = 0; i < mathFields.length; i++) {
    newMathQuill(mathFields[i]);
  }
  //Get all mathfields class and init

}

function revertMathQuills () {
  for (i = 0; i < MathQuills.length; i++) {
    let element = MathQuills[i].el();
    let latex = MathQuills[i].latex();
    MathQuills[i].revert();
    $(element).html(latex);
  }
}

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

//Event for the saveButton
document.getElementById("saveButton").addEventListener("click", function(){
  revertMathQuills();
  let editorData = CKEDITOR.instances.editor.getData();
  var blob = new Blob([editorData], {type: "text/plain;charset=utf-8"});
  var projectName = prompt("Enter project name:","BenjaMath Project");
  if(projectName !== null){
    fileSaver.saveAs(blob, projectName + ".html");
  }
});

//Event for the openButton
document.getElementById("openButton").addEventListener("click", function(){
  $("#openInput").trigger("click");

});

//Event for choosing new file
document.getElementById("openInput").addEventListener("change", function(evt){
  //Choose the first file from the list, as only one file is allowed
  var f = evt.target.files[0];
  //Declare a new fileReader
  var reader = new FileReader();
  //Set up the code for loading a file with the reader
  reader.onload = function(e){
    //Contents of file being read
    var contents = e.target.result;
    //Set the contents of the editor
    CKEDITOR.instances.editor.setData(contents);
    initMathquills();
  };
  lastUsedPath = f.path;
  //Read the file as text and then run the onload function
  reader.readAsText(f);
});


/*
  MODIFY EDITOR
*/

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

CKEDITOR.config.allowedContent = true;
CKEDITOR.config.startupFocus = true;

//When the toolbar disappears, just turn the event off. Yes, this is a good way to do it.
/*CKEDITOR.inline(document.getElementById("editor")).on('blur', function(e) {
	return false;
});*/

$(document).ready(function () {
  // We need to turn off the automatic editor creation first.
  CKEDITOR.disableAutoInline = true;

  CKEDITOR.inline("editor", {
    format_tags: 'p;script;h1;h2;h3',
    format_script: {name: "Scripting", element: "pre"}
  });
  $("#editor").attr("contenteditable","true");

  editor = CKEDITOR.instances.editor;

  editor.addCommand( 'insertMathquill', {
    exec: function( editor ) {
      let id = MathQuills.length;
      editor.insertHtml('<p contenteditable="false">&#8291<span class="mathField" id="' + id + '" contenteditable="false">placeholder</span><span>&nbsp;</span></p><p></p>');
      newMathQuill(document.getElementById(id));
    }
  });

  editor.ui.addButton("mathQuill", {
    label: "Insert Equation",
    command: 'insertMathquill',
    toolbar: 'insert',
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
              case "evalf":
                $(resultElement).html(katex.renderToString("\\, \\approx" + RMC.evalf(mathString.toString())));
                break;
              case "factor":
              $(resultElement).html(katex.renderToString("\\, =" + RMC.factor(mathString)));
                break;
              case "integral":
                variable = prompt("Integrate with respect to varibale: ", "x");
                $(resultElement).html(katex.renderToString("\\, =" + RMC.integral(mathString)));
                break;
            }
          },
          items: {
              "simplify": {name: "Simplify", icon: "fa-pie-chart"},
              "solve": {name: "Solve", icon: "fa-asterisk"},
              "fsolve": {name: "Fsolve", icon: "fa-cogs"},
              "evalf": {name: "Evalf", icon:"fa-bolt"},
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

$("#editor").keydown(function (e) {
  if (e.altKey && e.keyCode === 13) {
    let element = editor.getSelection().getStartElement().$;
    if (element.tagName === "PRE") {
      let scriptingText = $(element).clone().children().remove().end().text();
      if ($(element).children(".result").length > 0) {
        $(element).find(".result").html(katex.renderToString(" = " + algebrite.eval(scriptingText).toLatexString()));
      } else {
        element.innerHTML += "<span class='result' contenteditable='false'>" + katex.renderToString(" = " + algebrite.eval(scriptingText).toLatexString()) + "</span>";
      }
    }
  }
});
