var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: "rando-me",
  label: "Rando.me",
  icon: {
    "16": "./images/rando_icon_16.png",
    "32": "./images/rando_icon_38.png",
    "64": "./images/rando_icon_128.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("popup.html"),
  contentScriptFile: self.data.url("popup.js"),
  width: 402,
  height: 443,
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}
