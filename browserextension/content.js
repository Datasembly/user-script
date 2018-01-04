"use strict";

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

let getUrlFromWalmart = () => {
  let productId = $("meta[itemtype='http://schema.org/Product']").attr("content");
  if (productId) {
    let upc = ("00000" + productId).substr(-12);
    return "http://staging.datasembly.com/dashboard?banner=c624d14d-b312-4e13-a8cf-080171cb50f3&upc=" + upc;
  }
};

let getUrlFromKroger = () => {
  let upc = withcd($(".ProductDetails-upc").text().substr(-11));
  return "http://staging.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
};

let getUrlFromKrogerClickListBeta = () => {
  let href = window.location.href;
  let queryIndex = href.indexOf('?');
  let noQuery = queryIndex === -1 ? href : href.substr(0, queryIndex);
  let upc = withcd(noQuery.substr(-11));
  let url = "http://staging.datasembly.com/dashboard?banner=c475577f-1d89-47ab-b271-f7e90dae4eb4&upc=" + upc;
  return url;
};

let getUrlFromMeijer = () => {
  let lastpart = window.location.pathname.split("/").reverse()[0];
  let upcmightneedzero = lastpart.substr(0, lastpart.indexOf("."));
  let upcwithzero = ("0" + upcmightneedzero).substr(-11);
  let upc = withcd(upcwithzero);
  return "http://staging.datasembly.com/dashboard?banner=ed156cf2-cc4d-4017-868f-dd1dc76914e3&upc=" + upc;
};

let getUrlFromShoprite = () => {
  let upc = window.location.href.substr(-12);
  return "http://staging.datasembly.com/dashboard?banner=937be4a1-875c-4489-993f-b60ae9268c1a&upc=" + upc;
};

let getUrlFromHEB = () => {
  let upcwithzero = "0" + $("#defaultChildSku").attr("value")
  let upc = withcd(upcwithzero.substr(-11));
  return "http://staging.datasembly.com/dashboard?banner=218ca758-17de-49c4-932e-61486fe6c46d&upc=" + upc;
};

let getUrlFromWegmens = () => {
  let upc = $("span[itemprop='gtin14']").text().substr(2);
  if(upc !== "") {
    let url = "http://staging.datasembly.com/dashboard?banner=9f735df5-6ac2-4964-beda-039d111869de&upc=" + upc;
    return url;
  } else {
    return "http://staging.datasembly.com";
  }
};

let getUrl = () => {
  if (/https:\/\/www.walmart.com\/ip\/.*/.test(window.location.href)) {
    return getUrlFromWalmart();
  } else if (/https:\/\/www.instacart.com\/.*/.test(window.location.href)) {
    return "http://staging.datasembly.com";
  } else if (/https:\/\/www.kroger.com\/.*\/p\/.*/.test(window.location.href)) {
    return getUrlFromKroger();
  } else if (/https:\/\/www.kroger.com\/storecatalog\/clicklistbeta\/.*/.test(window.location.href)) {
    return getUrlFromKrogerClickListBeta();
  } else if (/https:\/\/www.meijer.com\/product\/.*\/[0-9]*\.uts/.test(window.location.href)) {
    return getUrlFromMeijer();
  } else if (/https:\/\/shop\.shoprite\.com\/.*\/product\/sku\/[0-9]*/.test(window.location.href)) {
    return getUrlFromShoprite();
  } else if (/https:\/\/www.heb.com\/product-detail\/.*/.test(window.location.href)) {
    return getUrlFromHEB();
  } else if (/https:\/\/www.google.com\/express\/product\/.*/.test(window.location.href)) {
    return "http://staging.datasembly.com";
  } else if (/https:\/\/www.wegmans.com\/products\/.*/.test(window.location.href)) {
    getUrlFromWegmens();
  } else {
    return "http://staging.datasembly.com";
  }
};

let run = (browser) => {
  browser.runtime.onMessage.addListener((request, sender, sendResopnse) => {
    let url = getUrl();
    sendResopnse({url: url});
  });
};

run(window.chrome || window.browser || this.browser);
