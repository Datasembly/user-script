// ==UserScript==
// @name         Datasembly UPC tools
// @namespace    https://datasembly.com
// @version      0.1
// @description  Help identify UPCs and product IDs
// @author       Datsembly, Inc.
// @match        *://*.walmart.com/*
// @match        *://*.instacart.com/*
// @match        *://*.kroger.com/*/p/*
// @match        *://*.kroger.com/storecatalog/clicklistbeta/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    let withcd = function(upc) {
        let even = 0;
        let odd = 0;
        for (let i = 0; i < upc.length; i++) {
            if (i % 2 === 0) {
                even = even + Number(upc[i])*3;
            } else {
                odd = odd + Number(upc[i]);
            }
        }
        let cd = (10 - (even + odd) % 10) % 10;
        return upc + "" + cd;
    };

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
            let element = event.target;
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
    } else if (/https:\/\/www.kroger.com\/.*\/p\/.*/.test(window.location.href)) {
        let upc = withcd($(".ProductDetails-upc").text().substr(-11));
        let url = "https://app.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
        $(".ProductDetails-rightColumn").prepend("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
    } else if (/https:\/\/www.kroger.com\/storecatalog\/clicklistbeta\/.*/.test(window.location.href)) {
        let checkAndAdd = function() {
            let href = window.location.href;
            let queryIndex = href.indexOf('?');
            let noQuery = queryIndex === -1 ? href : href.substr(0, queryIndex);
            let upc = withcd(noQuery.substr(-11));
            let url = "https://app.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
            setTimeout(function() {
                $(".namePartPriceContainer").prepend("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }, 500);
        };
        checkAndAdd();
        $(window).on('hashchange', function(e){
            checkAndAdd();
        });
    }
})();