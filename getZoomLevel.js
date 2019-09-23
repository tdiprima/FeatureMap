getZoomLevel = function (ifrmId) {
  const ifrm = document.getElementById(ifrmId);
  const doc = ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
  const zoom = doc.getElementsByClassName("txt");
  return parseFloat(zoom[0].innerText.slice(0, -1));
}