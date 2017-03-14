// ==UserScript==
// @name         Datasembly UPC tools
// @namespace    https://datasembly.com
// @version      0.1
// @description  Help identify UPCs and product IDs
// @author       Datsembly, Inc.
// @match        https://www.walmart.com/ip/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    var script = $("script").filter((i, s) => s.text.startsWith("window.__WML_REDUX_INITIAL_STATE__"))[0];
    if (script) {
        var pattern = /"upc":"([0-9]*)",/;
        var upc = pattern.exec(script.text)[1];
        var url = "https://app.datasembly.com/dashboard?banner=c624d14d-b312-4e13-a8cf-080171cb50f3&upc=" + upc;
        $("nav[data-automation-id='breadcrumb']").append("<div>" + upc + ": <a href=" + url + ">link</a></div>");
    }
})();