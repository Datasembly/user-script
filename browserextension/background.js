"use strict";

let run = browser => {
  let openDatasembly = () => {
    browser.tabs.query({active: true}, tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "GET_URL"}, response => {
        browser.tabs.create({url: response.url});
      });
    });
  };

  browser.browserAction.onClicked.addListener(openDatasembly);
};

run(window.chrome || window.browser || this.browser);
