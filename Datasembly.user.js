// ==UserScript==
// @name         Datasembly UPC tools
// @namespace    https://datasembly.com
// @version      0.1
// @description  Help identify UPCs and product IDs
// @author       Datsembly, Inc.
// @match        *://*.walmart.com/*
// @match        *://*.instacart.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    if (/https:\/\/www.walmart.com\/ip\/.*/.test(window.location.href)) {
        var script = $("script").filter((i, s) => s.text.startsWith("window.__WML_REDUX_INITIAL_STATE__"))[0];
        if (script) {
            var pattern = /"upc":"([0-9]*)",/;
            var upc = pattern.exec(script.text)[1];
            var url = "https://app.datasembly.com/dashboard?banner=c624d14d-b312-4e13-a8cf-080171cb50f3&upc=" + upc;
            $("nav[data-automation-id='breadcrumb']").append("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
        }
    } else if (/https:\/\/www.instacart.com\/.*/.test(window.location.href)) {
        document.addEventListener("click", function(event) {
            var element = event.target;
            if (element.classList.contains("item-title")) {
                var firstId = window.location.pathname.split("/").reverse()[0];
                $(".ds-sku-tool").remove();
                $(".item-title").append("<div class='ds-sku-tool'>Fetching product ID for: " + firstId + "</div>");
                $.ajax ({
                    type: 'GET',
                    url: "https://www.instacart.com/api/v2/items/" + firstId,
                    success: function(returnData) {
                        if (returnData.data.product_id) {
                            $(".ds-sku-tool").replaceWith("<div class='ds-sku-tool'>Product ID: " + returnData.data.product_id + "</div>");
                        } else {
                            $(".ds-sku-tool").replaceWith("<div class='ds-sku-tool'>Failed to get ID</div>");
                        }
                    }
                });
            }
        });
    }
})();