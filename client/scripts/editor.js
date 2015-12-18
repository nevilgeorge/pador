// editor.js
$(function() {
  $(document).ready(function() {
    var conn;

    if (window['WebSocket']) {
      conn = new WebSocket('ws://localhost:8080/ws');
      console.log('Connected to websocket!');
    } else {
      alert('Your browser does not support WebSockets.');
    }

    $('.editable').text('');
    var editor = new MediumEditor('.editable', {
      placeholder: {
        text: ''
      }
    });

    var editorDiv = $('.editable');
    $('.editable').on('input', function() {
      var html = editorDiv.html();
      if (typeof conn !== 'undefined' && text !== '') {
        conn.send(html);
      }
      return false;
    });

    if (typeof conn !== 'undefined') {
      conn.onmessage = function(msg) {
        $('.editable').html($.parseHTML(msg.data));
      };
    }
  });
})
