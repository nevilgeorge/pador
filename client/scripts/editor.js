// editor.js

// model
var Operation = function(start, count, chars, type) {
  this.start = start;
  this.count = count;
  this.chars = chars;
  this.type = type;
  this.range = {};
}

$(function() {
  $(document).ready(function() {
    var domain = window.tempVars.Domain;
    var shortCode = window.tempVars.ShortCode;
    var colors = ['#ff0000', '#0099ff', '#00ff00', '#cc00cc'];
    var cursorIndex;
    var conn;

    if (window['WebSocket']) {
      conn = new WebSocket('ws://' + domain + '/' + shortCode + '/ws');
      console.log('Connected to websocket!');
    } else {
      alert('Your browser does not support WebSockets.');
    }

    $('#editor').text('');
    var quill = new Quill('#editor');
    var cursorModule = quill.addModule('multi-cursor', {
      timeout: 10000
    });

    quill.on('text-change', function(delta, source) {
      var op, action, start, chars;
      if (delta.ops.length == 1) {
        action = delta.ops[0]
        if ('insert' in action) {
          op = new Operation(0, action.insert.length, action.insert, 'insert');
        } else if ('delete' in action) {
          op = new Operation(0, action.delete, '', 'delete');
        }
      } else {
        start = delta.ops[0].retain || 0;
        action = delta.ops[1];
        chars = action.insert;
        if ('insert' in action) {
          op = new Operation(start, action.insert.length, chars, 'insert');
        } else if ('delete' in action) {
          op = new Operation(start, action.delete, '', 'delete');
        }
      }
      op.range = quill.getSelection();
      cursorModule.setCursor((cursorIndex + 1).toString(), op.range.start, (cursorIndex + 1).toString(), colors[cursorIndex]);

      if (source === 'user' && typeof conn !== 'undefined' && typeof op !== 'undefined') {
        conn.send(JSON.stringify(op));
      }
    });

    quill.on('selection-change', function(range) {
      if (range) {
        if (range.start === range.end) {
          cursorModule.setCursor((cursorIndex + 1).toString(), range.start, (cursorIndex + 1).toString(), colors[cursorIndex]);
        }
      }
    })

    if (typeof conn !== 'undefined') {
      conn.onmessage = function(msg) {
        if (msg.data !== '') {
          var data = JSON.parse(msg.data);
          var cursors = data.Cursors;
          cursorIndex = cursors.length - 1

          for (var i = 0; i < cursors.length; i++) {
            if (cursors[i] !== null) {
              cursorModule.setCursor((i + 1).toString(), cursors[i][0], (i + 1).toString(), colors[i]);
            }
          }
          var range = quill.getSelection();
          quill.setText(data.Text);
          quill.setSelection(range);
        }
      };
    }
  });
});
