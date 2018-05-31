// ==UserScript==
// @name         Datasembly UPC tools
// @namespace    https://datasembly.com
// @version      0.1.15
// @description  Help identify UPCs and product IDs
// @author       Datsembly, Inc.
// @match        *://*.walmart.com/*
// @match        *://*.instacart.com/*
// @match        *://*.kroger.com*p/*
// @match        *://*.kroger.com/storecatalog/clicklistbeta/*
// @match        *://*.meijer.com/product/*
// @match        *://*.shoprite.com/store/*
// @match        *://*.heb.com/product-detail/*
// @match        *://*.google.com/express/product/*
// @match        *://*.wegmans.com/products/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// @updateURL    https://github.com/Datasembly/user-script/raw/master/Datasembly.user.js
// ==/UserScript==

this.$ = jQuery.noConflict(true);

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
        var productId = $(".prod-productsecondaryinformation span[itemprop='gtin13']").attr("content");
        if (productId) {
            var upc = ("00000" + productId).substr(-12);
            var url = "http://staging.datasembly.com/dashboard?banner=c624d14d-b312-4e13-a8cf-080171cb50f3&upc=" + upc;
            $("nav[data-automation-id='breadcrumb']").append("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
        }
    } else if (/https:\/\/www.instacart.com\/.*/.test(window.location.href)) {
        document.addEventListener("click", function(event) {
            let element = event.target;
            if (element.classList.contains("item-title")) {
                var firstId = window.location.pathname.split("/").reverse()[0].substring(5);
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
    } else if (/https:\/\/www.kroger.com.*\/p\/.*/.test(window.location.href)) {
        let checkAndAdd = function() {
            let upc = withcd($(".ProductDetails-upc").text().substr(-11));
            let currentUpc = $(".ProductDetails-rightColumn .datasembly-upc-link").attr("upc")
            if (upc !== "0" && upc != currentUpc) {
                let url = "http://staging.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
                $(".ProductDetails-rightColumn").prepend("<div class='datasembly-upc-link' upc=" + upc + ">" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }
        }
        $(".Page-content").on("DOMNodeInserted", function(e){
           checkAndAdd();
        });
    } else if (/https:\/\/www.kroger.com\/storecatalog\/clicklistbeta\/.*/.test(window.location.href)) {
        let checkAndAdd = function() {
            let href = window.location.href;
            let queryIndex = href.indexOf('?');
            let noQuery = queryIndex === -1 ? href : href.substr(0, queryIndex);
            let upc = withcd(noQuery.substr(-11));
            let url = "http://staging.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
            setTimeout(function() {
                $(".namePartPriceContainer").prepend("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }, 500);
        };
        checkAndAdd();
        $(window).on('hashchange', function(e){
            checkAndAdd();
        });
    } else if (/https:\/\/www.meijer.com\/product\/.*\/[0-9]*\.uts/.test(window.location.href)) {
       let lastpart = window.location.pathname.split("/").reverse()[0];
       let upcmightneedzero = lastpart.substr(0, lastpart.indexOf("."));
       let upcwithzero = ("0" + upcmightneedzero).substr(-11);
       let upc = withcd(upcwithzero);
       let url = "http://staging.datasembly.com/dashboard?banner=ed156cf2-cc4d-4017-868f-dd1dc76914e3&upc=" + upc;
       $(".mjr-section-title-2").after("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
    } else if (/https:\/\/shop\.shoprite\.com\/.*\/product\/sku\/[0-9]*/.test(window.location.href)) {
       let checkAndAdd = function() {
           let upc = window.location.href.substr(-12);
           let url = "http://staging.datasembly.com/dashboard?banner=937be4a1-875c-4489-993f-b60ae9268c1a&upc=" + upc;

           let added = false;
           $(document).bind('DOMSubtreeModified', function() {
               let info = $(".primaryInformation h4");
               if (info.size() == 1 && !added && /^[0-9]+$/.test(upc)) {
                   added = true;
                   $(".primaryInformation h4").after("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
               }
           });
       };
       checkAndAdd();
       $(window).on('hashchange', function(e){
           checkAndAdd();
        });
    } else if (/https:\/\/www.heb.com\/product-detail\/.*/.test(window.location.href)) {
         let upcwithzero = "0" + $("#defaultChildSku").attr("value")
         let upc = withcd(upcwithzero.substr(-11));
         let url = "http://staging.datasembly.com/dashboard?banner=218ca758-17de-49c4-932e-61486fe6c46d&upc=" + upc;
         $(".first-block h1").after("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
    } else if (/https:\/\/www.google.com\/express\/product\/.*/.test(window.location.href)) {
         let sku = window.location.pathname.split("/").reverse()[0].split("_")[1];
        $(".productTitle").after("<div class='ds-sku-tool'>Product ID: " + sku + "</div>");
    } else if (/https:\/\/www.wegmans.com\/products\/.*/.test(window.location.href)) {
         let upc = $("span[itemprop='gtin14']").text().substr(2);
         if(upc !== "") {
             let url = "http://staging.datasembly.com/dashboard?banner=9f735df5-6ac2-4964-beda-039d111869de&upc=" + upc;
             $(".title").after("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
         }
    }
})();