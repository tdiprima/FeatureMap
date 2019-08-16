getBrowser = function () {
  let myBrowser = navigator.userAgent;
  console.log('browser', myBrowser);

  //Check if browser is Edge
  if (myBrowser.search("Edge") >= 0) {
      return "edge";
  }
  //Check if browser is IE
  else if (myBrowser.search("Windows") >= 0 && !!document.documentMode) {
      return "ie";
  }
  //Check if browser is Chrome
  else if (myBrowser.search("Chrome") >= 0 && myBrowser.search(" OPR/") < 0) {
      return "chrome";
  }
  //Check if browser is Firefox 
  else if (myBrowser.search("Firefox") >= 0) {
      return "firefox";
  }
  //Check if browser is Safari
  else if (myBrowser.search("Safari") >= 0 && myBrowser.search("Chrome") < 0) {
      return "safari";
  }
  //Check if browser is Opera
  else if (myBrowser.search(" OPR/") >= 0) {
      return "opera";
  }

};
