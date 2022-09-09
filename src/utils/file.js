export async function getFileFromUrl(url, name, defaultType = 'image/jpeg'){
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}

export function newTabImage(url) {
  const image = new Image();
  image.src = url;

  const w = window.open("",'_blank');
  w.document.write(image.outerHTML);
  w.document.close();
}
