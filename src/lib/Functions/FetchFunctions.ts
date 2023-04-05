import { GeoTIFFImage, fromArrayBuffer } from "geotiff"
import type { BoundingBox } from "../Stores";


export async function getGeoTIFFImage(url: string) {
  return fetch(url)
    .then(response  => response.arrayBuffer())
    .then(tiff      => fromArrayBuffer(tiff))
    .then(result    => result.getImage())
}

export function getBoundingBox(image: GeoTIFFImage): BoundingBox {

  const bbox = image.getBoundingBox();

  return {
    xmin: bbox[0],
    ymin: bbox[1],
    xmax: bbox[2],
    ymax: bbox[3],
    width: bbox[2] - bbox[0],
    height: bbox[3] - bbox[1],
    pixelWidth: image.getWidth(),
    pixelHeight: image.getHeight(),
    widthRatio: (bbox[2] - bbox[0]) / image.getWidth(),
    heightRatio: (bbox[3] - bbox[1]) / image.getHeight()
  }

}

