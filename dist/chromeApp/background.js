chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('./codebase/index.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});
