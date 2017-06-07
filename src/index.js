var algebrite = require("algebrite");
var katex = require("katex");
var RMC = require("./src/RendalMathCore.js");
var MQ = MathQuill.getInterface(2);
var electron = require("electron");
const Menu = require("electron").remote.Menu;
const dialog = require("electron").remote.dialog;
const fs = require("fs");

var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-os';

var version = require("./package.json").version;

var lastPath = "";
var unsavedChangesStatus = false;

//Set up menuBar
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+n',
        click() {
          setLastPath("");
          $("#editor").html();
          unsavedChanges(false);
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+o',
        click() {
          requestOpen();
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+s',
        click() {
          save();
        }
      },
      {
        label: 'Save As...',
        accelerator: 'CmdOrCtrl+shift+s',
        click() {
          saveAs();
        }
      },
      {
        label: 'Print',
        accelerator: 'CmdOrCtrl+p',
        click() {
          $(".header").hide();
          $("#editor").blur();
          setTimeout(function() {
            window.print();
            $(".header").show();
          }, 500);
        }
      }
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+z',
        click() {
          //Currently does not work
          revertMathQuills();
          //CKEDITOR.instances.editor.execCommand("undo");
          initMathquills();
        }
      },
      {
        label: 'Redo',
        accelerator: 'CmdOrCtrl+shift+z',
        click() {
          //Currently does not work
          revertMathQuills();
          //CKEDITOR.instances.editor.execCommand("redo");
          initMathquills();
        }
      }
    ]
  },
  {
    label: 'Insert',
    submenu: [
      {
        label: 'Insert Math',
        accelerator: 'f5',
        click () {
          insertMathquill();
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Algebrite Docs',
        click() {
          var win = window.open("http://algebrite.org/", '_blank');
          win.focus();
        }
      },
      {
        label: 'About BenjaMath',
        click() {
          vex.dialog.alert("BenjaMath is an open source math CAS based upon web technologies. Version: " + version);
        }
      }
    ]
  }
];
Menu.setApplicationMenu(Menu.buildFromTemplate(template));


var MathQuills = [];

var editor;

console.log("Welcome to BenjaMath " + version);

/*
  Functions
*/
function renderMathBox(id) {
	console.log("MQ:", MQ(document.getElementById(id)).latex());
	let latex = MQ(document.getElementById(id)).latex();
	$("#" + id).parent().find("#result").html(RMC.evalMath(latex));
}

function newMathQuill (element) {
  MathQuills.push(MQ.MathField(element).focus());
  let currentQuill = MathQuills[MathQuills.length - 1];
  $(currentQuill.el()).keydown(function(e) {
    if (e.keyCode == 13) {
      let id = e.currentTarget.id;
      renderMathBox(id);
    }
  });
}

function insertMathquill () {
  let id = MathQuills.length;
  document.execCommand("insertHTML", false, '<p>&#8291<span id="mathAndResult"><span class="mathField" id="' + id + '" contenteditable="false"></span><span id="result">&nbsp;</span><span>&nbsp;</span></span></p>');
  newMathQuill(document.getElementById(id));
}

//Functions for handling files
function saveAs () {
  revertMathQuills();
  let editorData = $("#editor").html();
  try {
    var file = dialog.showSaveDialog({
      filters: [{name: "htmlFiles", extensions: ['html']}]
    });
    fs.writeFile(file, editorData, function (err) {
      if (!err) {
        setLastPath(file);
        unsavedChanges(false);
      }
    });
  } finally {
    initMathquills();
  }
}

function save() {
  if (lastPath === "") {
    saveAs();
  } else {
    revertMathQuills();
    let editorData = $("#editor").html();
    fs.writeFile(lastPath, editorData, function (err) {
      if (!err) {
        unsavedChanges(false);
      }
      console.log("Saved to " + lastPath);
    });
    initMathquills();
  }
}

function open () {
  var file = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: "htmlFiles", extensions: ['html']}]
  })[0];
  if (typeof file !== "undefined") {
    fs.readFile(file, "utf-8", function (err, html) {
      if (!err) {
        setLastPath(file);
        $("#editor").html(html);
        unsavedChanges(false);
        initMathquills();
      }
    });
  }
}

function requestOpen() {
  if (!unsavedChangesStatus) {
    open();
  } else {
    unsavedChangesDialog( (button) => {
      if (button === 1 || button === 2) {
        open();
      }
    });
  }
}

function unsavedChangesDialog (callback) {
  dialog.showMessageBox({
    message: "You have unsaved changes, how do you want to proceed?",
    buttons: ["Cancel", "Save changes", "Do not save changes"]
  }, (response) => {
    if (response === 1) {
      save();
    }
    callback(response);
  });
}

function docNameFromPath (path) {
  let lastSlash = path.lastIndexOf("/");
  let lastDot = path.lastIndexOf(".");

  return path.substring(lastSlash + 1, lastDot);
}

function setLastPath (path) {
  lastPath = path;
  if (path !== "") {
    document.title = "BenjaMath - " + path;
    $("#fileName").html(docNameFromPath(path));
  } else {
    document.title = "BenjaMath";
    $("#fileName").html("BenjaMath");
  }
}

function unsavedChanges (status) {
  if (!unsavedChangesStatus && status) {
    $("#saveStatus").html($("#saveStatus").html() + "*");
  }

  unsavedChangesStatus = status;

  if (unsavedChangesStatus) {
  } else {
    let date = new Date();
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    $("#saveStatus").html(" " + hours + ":" + minutes);
  }

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

$(document).ready(function () {
  document.getElementById("editor").addEventListener("input", function() {
    unsavedChanges(true);
  }, false);

  //Set up custom contextMenu for the mathfields
  $(function() {
    $.contextMenu({
      selector: '.mathField',
      callback: function(key, options) {
        let mathQuill = MathQuills[$(this).attr("id")];
        let latex = mathQuill.latex();
        let mathString = RMC.parseLatex(latex);
        let resultElement = $(this).parent().find("#result");
        let variable;
        switch (key) {
          case "simplify":
            $(resultElement).html(katex.renderToString("\\, =" + RMC.simplify(mathString)));
            break;
          case "solve":
            vex.dialog.prompt({
                message: 'Solve for variable:',
                placeholder: 'x',
                callback: function (variable) {
                  if (variable !== false) {
                    $(resultElement).html(katex.renderToString("\\, \\longrightarrow " + variable + " = " + RMC.solve(mathString, variable)));
                  }
                }
            });
            break;
          case "fsolve":
            vex.dialog.prompt({
              message: 'Solve for variable:',
              placeholder: 'x',
              callback: function (variable) {
                if (variable !== false) {
                  $(resultElement).html(katex.renderToString("\\, \\longrightarrow " + variable + " = " + RMC.fsolve(mathString, variable)));
                }
              }
            });
            break;
          case "evalf":
            $(resultElement).html(katex.renderToString("\\, \\approx" + RMC.evalf(mathString.toString())));
            break;
          case "factor":
          $(resultElement).html(katex.renderToString("\\, =" + RMC.factor(mathString)));
            break;
          case "integral":
            vex.dialog.prompt({
              message: 'Integrate with respect to varibale:',
              placeholder: 'x',
              callback: function (variable) {
                if (variable !== false) {
                  $(resultElement).html(katex.renderToString("\\, =" + RMC.integral(mathString)));
                }
              }
            });
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

$("#editor").keydown(function (e) {
  if (e.altKey && e.keyCode === 13) {
    let element = editor.getSelection().getStartElement().$;
    if (element.tagName === "PRE") {
      let scriptingText = $(element).clone().children().remove().end().text();
      if ($(element).children(".result").length > 0) {
        $(element).find(".result").html(katex.renderToString(" = " + algebrite.eval(scriptingText).toLatexString()));
      } else {
        element.innerHTML += "<span class='result'>" + katex.renderToString(" = " + algebrite.eval(scriptingText).toLatexString()) + "</span>";
      }
    }
  }
});

electron.ipcRenderer.on("closeRequest", function () {
  if (unsavedChangesStatus) {
    unsavedChangesDialog((button) => {
      switch (button) {
        case 1:
          electron.ipcRenderer.send("doClose");
          break;
        case 2:
          electron.ipcRenderer.send("doClose");
          break;
      }
    });
  } else {
    electron.ipcRenderer.send("doClose");
  }
});
