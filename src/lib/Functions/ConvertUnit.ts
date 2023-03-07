
// Svelte imports:
import { get } from 'svelte/store';

// Library imports:
import proj4 from 'proj4';

// Imports from Stores.svelte:
import { system } from 'src/lib/Stores';
import type { Pos, Crd } from 'src/lib/Stores'

// Imports from function typescript files:


// Functions:
function LatLngToPos(crd: Crd): Pos
function LatLngToPos(crd: Crd[]): Pos[]
function LatLngToPos(crd: Crd | Crd[]): Pos | Pos[] {

  let EPSG5316 = get(system).coordinateSystem.EPSG5316.conv;
  let EPSG4326 = get(system).coordinateSystem.EPSG4326.conv;

  let center = get(system).settings.center_of_FO

  if (Array.isArray(crd)) {

    let arr_result = [];
    crd.forEach(val => {
      let arr = proj4(EPSG4326, EPSG5316, [val.lng, val.lat]);
      arr_result.push({x: arr[0] - center.x, y: arr[1] - center.y})
    })

    return arr_result

  } else if (typeof crd === "object") {

    let arr = proj4(EPSG4326, EPSG5316, [crd.lng, crd.lat])
    return {x: arr[0] - center.x, y: arr[1] - center.y}

  }

}

function PosToLatLng(pos: Pos): Crd
function PosToLatLng(pos: Pos[]): Crd[]
function PosToLatLng(pos: Pos | Pos[]): Crd | Crd[] {

  let EPSG5316 = get(system).coordinateSystem.EPSG5316.conv;
  let EPSG4326 = get(system).coordinateSystem.EPSG4326.conv;

  let center = get(system).settings.center_of_FO

  if (Array.isArray(pos)) {
    let arr_ret = [];
    pos.forEach(val => {
      let arr = proj4(EPSG5316, EPSG4326, [val.x + center.x, val.y + center.y])
      arr_ret.push({lng: arr[0], lat: arr[1]})
    })

    return arr_ret

  } else if (typeof pos === "object") {

    let arr = proj4(EPSG5316, EPSG4326, [pos.x + center.x, pos.y + center.y])
    return {lng: arr[0], lat: arr[1]}

  }

}
  
function PosToPixel(pos: {x: number, y: number}) {
  let bbox = get(system).heightMap.boundingBox;
  let center = get(system).settings.center_of_FO;


  // Calculates the coresponding pixel.
  const x = Math.floor(bbox.pixelWidth * (pos.x + center.x - bbox.xmin) / bbox.width);
  const y = Math.floor(bbox.pixelHeight * (bbox.ymax - (pos.y + center.y)) / bbox.height);

  return {x, y}
}

function PixelToPos(px: {x: number, y: number}) {
  let bbox = get(system).heightMap.boundingBox;
  let center = get(system).settings.center_of_FO;

  let x = px.x * bbox.widthRatio + bbox.xmin;
  let y = bbox.ymax - px.y * bbox.heightRatio;
  
  return {x: x - center.x, y: y - center.y}

}


export let convertF = {
  LatLngToPos,
  PixelToPos,
  PosToLatLng,
  PosToPixel
}