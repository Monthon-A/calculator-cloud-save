import * as os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
const jetpack = require('fs-jetpack'); // module loaded from npm
import env from './env';
import getUuid from './uuid';
import BigNumber from 'bignumber.js';
import $ from 'jquery';
var app = remote.app;
var dialog = remote.dialog;

var currentOp = null;

document.addEventListener('DOMContentLoaded', function () {
  var opButtons = document.querySelectorAll('.op_group input');
  for (var i=0; i<opButtons.length; i++) {
    opButtons[i].addEventListener('click', function() {
      clearHighlight();
      this.classList.add('highlight');
      currentOp = this.id;
      var a = new BigNumber((document.getElementById('input_a') as HTMLInputElement).value);
      var b = new BigNumber((document.getElementById('input_b') as HTMLInputElement).value);
      var result = calculate(a, b, currentOp);
      (document.getElementById('result') as HTMLInputElement).value = result.toString();
    });
  }

  var inputBoxes = document.querySelectorAll('.calc_input input');
  for (var i=0; i<inputBoxes.length; i++) {
    inputBoxes[i].addEventListener('input', function() {
      clearHighlight();
      (document.getElementById('result') as HTMLInputElement).value = '';
    });
  }

  document.getElementById('save').addEventListener('click', function(event) {
    if ((document.getElementById('result') as HTMLInputElement).value == '') {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Save',
        message: 'Please do a calculation before saving.'
      });
      return;
    }
    var isCloud = (document.getElementById('cloud_save') as HTMLInputElement).checked;
    if (isCloud) {
      cloudSave();
    } else {
      fileSave();
    }
    
  });

  document.getElementById('load').addEventListener('click', function(event) {
    var isCloud = (document.getElementById('cloud_save') as HTMLInputElement).checked;
    if (isCloud) {
      cloudLoad();
    } else {
      fileLoad();
    }
  });
});

function showLoadErrorDialog() {
  dialog.showErrorBox('Error', 'Invalid content.');
}

type SaveContent = {
  a: string
  b: string
  op: string
  result: string
}

function clearHighlight() {
  var inputs = document.getElementById('op_group').getElementsByTagName('input');
  for (var i=0; i<inputs.length; i++) {
    inputs[i].classList.remove('highlight');
  }
  currentOp = null;
}

function calculate(a: BigNumber, b: BigNumber, op: string): BigNumber {
  switch (op) {
    case 'add':
      return a.add(b);
    case 'sub':
      return a.sub(b);
    case 'mul':
      return a.mul(b);
    case 'div':
      return a.div(b);
    case 'pow':
      return a.pow(b.toNumber())
  }
  return null;
}

function fileSave() {
  dialog.showSaveDialog({ filters: [{ name: 'JSON', extensions: ['json'] }]}, function (fileName) {
    if (fileName === undefined) return;
    jetpack.write(fileName, {
      a: (document.getElementById('input_a') as HTMLInputElement).value,
      b: (document.getElementById('input_b') as HTMLInputElement).value,
      op: currentOp,
      result: (document.getElementById('result') as HTMLInputElement).value
    });
  }); 
}

function fileLoad() {
  dialog.showOpenDialog({ filters: [{ name: 'JSON', extensions: ['json'] }]}, function (filePaths) {
    if (filePaths === undefined) return;
    var content = jetpack.read(filePaths[0], 'json') as SaveContent;
    console.log(content);
    var a,b;
    try {
      a = new BigNumber(content.a);
      b = new BigNumber(content.b);
    } catch (err) {
      if (err) {
        showLoadErrorDialog();
        return;
      }
    }
    if (a.isNaN() || b.isNaN()) {
      showLoadErrorDialog()
      return;
    }
    var op = content.op;
    var result = calculate(a, b, op);
    if (result == null) {
      showLoadErrorDialog();
      return;
    }
    clearHighlight();
    document.getElementById(op).classList.add('highlight');
    (document.getElementById('input_a') as HTMLInputElement).value = a.toString();
    (document.getElementById('input_b') as HTMLInputElement).value = b.toString();
    (document.getElementById('result') as HTMLInputElement).value = result.toString();
  });
}

function cloudSave() {
  var content = {
    id: getUuid(),
    a: (document.getElementById('input_a') as HTMLInputElement).value,
    b: (document.getElementById('input_b') as HTMLInputElement).value,
    op: currentOp,
    result: (document.getElementById('result') as HTMLInputElement).value
  }
  $.post('https://y400gq05ah.execute-api.us-east-2.amazonaws.com/calc/data', JSON.stringify(content))
    .done(function(data) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Cloud Save',
        message: 'Save to cloud completed successfully.'
      });
    })
    .fail(function(error) {
      dialog.showErrorBox('Error', 'Cannot save to cloud.');
    });
}

function cloudLoad() {
  $.get('https://y400gq05ah.execute-api.us-east-2.amazonaws.com/calc/data/' + getUuid())
    .done(function(data) {
      if ($.isEmptyObject(data)) {
        dialog.showMessageBox({
          type: 'info',
          buttons: ['OK'],
          title: 'Cloud Load',
          message: 'No data found.'
        });
      } else {
        clearHighlight();
        document.getElementById(data.op).classList.add('highlight');
        (document.getElementById('input_a') as HTMLInputElement).value = data.a;
        (document.getElementById('input_b') as HTMLInputElement).value = data.b;
        (document.getElementById('result') as HTMLInputElement).value = data.result;
        dialog.showMessageBox({
          type: 'info',
          buttons: ['OK'],
          title: 'Cloud Load',
          message: 'Cloud data loaded.'
        });
      }
    })
    .fail(function(data) {
      dialog.showErrorBox('Error', 'Cannot load data from cloud.');
    });
}