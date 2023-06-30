// ==UserScript==
// @name         Datasembly UPC tools
// @namespace    https://datasembly.com
// @version      0.1.19
// @description  Help identify UPCs and product IDs
// @author       Datsembly, Inc.
// @match        *://*.walmart.com/*
// @match        *://*.instacart.com/* //will not be able to right now
// @match        *://*.kroger.com*p/*
// @match        *://*.kroger.com/storecatalog/clicklistbeta/*
// @match        *://*.shoprite.com/*
// @match        *://*.heb.com/product-detail/*
// @match        *://*.google.com/express/product/* not tested
// @match        *://*.albertsons.com/*
// @match        *://*.target.com/p/*
// @match        *://*.wholefoodsmarket.com/product*
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
        let addLink = function() {
            let productId = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.initialData.data.product.upc
            if (productId) {
                let upc = ("00000" + productId).substr(-12);
                let url = "http://staging.datasembly.com/dashboard?banner=c624d14d-b312-4e13-a8cf-080171cb50f3&upc=" + upc;
                $(".w_4HBV").prepend("<div class='datasembly-upc-link' upc=" + upc + ">" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }
        }
        addLink();
        $(".flex flex-column min-vh-100 shadow-2").on("DOMNodeInserted", function(e){
           addLink();
        });
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
                let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
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
            let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
            setTimeout(function() {
                $(".namePartPriceContainer").prepend("<div>" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }, 500);
        };
        checkAndAdd();
        $(window).on('hashchange', function(e){
            checkAndAdd();
        });
    } else if (/https:\/\/www.shoprite\.com\/.*\/product\/[0-9]*/.test(window.location.href)) {
        let addLink = function() {
            let upc = window.location.href.substr(-12);
            let check_url = withcd($(".datasembly-upc-link").text().substr(-11));
            if (upc) {
                let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=937be4a1-875c-4489-993f-b60ae9268c1a&upc=" + upc;
                $(".PdpInfoTitle--1qi97uk").prepend("<div class='datasembly-upc-link' upc=" + upc + ">" + upc + ": <a target='_blank' href=" + url + ">link</a></div>");
            }
        }
        addLink();
    } else if (/https:\/\/www.heb.com\/product-detail\/.*/.test(window.location.href)) {
        let text_block_with_string = $(":contains('twelveDigitUPC')").text();
        let upc_string = text_block_with_string.toString();
        let position = upc_string.search("twelveDigitUPC");
        let upc_a = upc_string.substr(position + 19, 12);
        let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=218ca758-17de-49c4-932e-61486fe6c46d&upc=" + upc_a;
        $(".sc-1hc0hyf-4").after("<div>" + upc_a + ": <a target='_blank' href=" + url + ">link</a></div>");
    } else if (/https:\/\/www.google.com\/express\/product\/.*/.test(window.location.href)) {
        let sku = window.location.pathname.split("/").reverse()[0].split("_")[1];
        $(".productTitle").after("<div class='ds-sku-tool'>Product ID: " + sku + "</div>");
    } else if (/https:\/\/www.albertsons.com\/.*\/product-detail*/.test(window.location.href)) {
        let text_block_with_string = $(":contains('gtin13')").text();
        let upc_string = text_block_with_string.toString();
        let position = upc_string.search("gtin13");
        let upc_a = upc_string.substr(position + 12, 11);
        let upc_cd = withcd(upc_a);
        if(upc_cd){
            let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=6999d912-9fd5-4242-b96a-75eb8c3d7c22&upc=" + upc_cd;
            $(".product-info").after("<div>" + upc_cd + ": <a target='_blank' href=" + url + ">link</a></div>");
        }
    } else if (/https:\/\/www.target.com\/p*/.test(window.location.href)) {
        let checkAndAdd = function() {
            let text_block_with_string = $(":contains('UPC')").text();
            let upc_string = text_block_with_string.toString();
            let position = upc_string.search("UPC");
            let position_chk = upc_string.search("Datasembly link");
            let upc_a = upc_string.substr(position + 5, 12);
            if(upc_a && position_chk < 0){
                let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=c206ce60-1390-4cde-a454-e88104c0ac86&upc=" + upc_a;
                $(".h-padding-h-default").prepend("<div>" + upc_a + ": <a target='_blank' href=" + url + ">Datasembly link</a></div>");
            }
        }
        checkAndAdd();
        $(".__next").on("hashchange", function(e){
            checkAndAdd();
        });
    } else if (/https:\/\/www.wholefoodsmarket.com\/product*/.test(window.location.href)) {
        let text_block_with_string = $(":contains('assets.wholefoodsmarket.com/PIE/product')").text();
        let upc_string = text_block_with_string.toString();
        let position = upc_string.search("glamor-front");
        let upc_a = upc_string.substr(position - 13, 12);
        if(upc_a){
            let url = "https://staging.datasembly.com/productpricingdrilldown?bannerId=6d5f2ac3-3009-42f6-a4ce-066f056caf0b&upc=" + upc_a;
            $(".w-cms--font-headline__serif").after("<div>" + upc_a + ": <a target='_blank' href=" + url + ">Datasembly link</a></div>");
        }
    }
})();
