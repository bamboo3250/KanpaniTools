$(document).ready(function() {
  KTNetworkHandler.init();

  var clipboardBtn = new Clipboard('.copy-btn');
  clipboardBtn.on('success', function(e) {
    var oldValue = $('#copy-quest-log-btn').text();
    $('#copy-quest-log-btn').text('Copied!');
    setTimeout(function() {
      $('#copy-quest-log-btn').text(oldValue);
    }, 1000);

    e.clearSelection();
  });

  $('#clear-quest-log-btn').click(function() {
    $('#quest-log').text('');
  });
});