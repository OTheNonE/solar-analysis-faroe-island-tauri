
// Svelte imports:
import { get } from 'svelte/store';

// Library imports:
import proj4 from 'proj4';

// Imports from Stores.svelte:
import { system, type BoundingBox } from 'src/lib/Stores';
import type { Pos, Crd, Px } from 'src/lib/Stores'

// Imports from function typescript files:


// Functions:
function LatLngToPos(crd: Crd): Pos
function LatLngToPos(crd: Crd[]): Pos[]
function LatLngToPos(crd: Crd | Crd[]): Pos | Pos[] {

  let center = get(system).settings.center_of_FO

  if (Array.isArray(crd)) {

    let arr_result = [];
    crd.forEach(val => {
      let arr = proj4("EPSG:4326", "EPSG:5316", [val.lng, val.lat]);
      arr_result.push({x: arr[0] - center.x, y: arr[1] - center.y})
    })

    return arr_result

  } else if (typeof crd === "object") {

    let arr = proj4("EPSG:4326", "EPSG:5316", [crd.lng, crd.lat])
    return {x: arr[0] - center.x, y: arr[1] - center.y}

  }

}

function LatLngToAbsPos(crd: Crd): Pos
function LatLngToAbsPos(crd: Crd[]): Pos[]
function LatLngToAbsPos(crd: Crd | Crd[]): Pos | Pos[] {

  if (Array.isArray(crd)) {

    let arr_result = [];
    crd.forEach(val => {
      let arr = proj4("EPSG:4326", "EPSG:5316", [val.lng, val.lat]);
      arr_result.push({x: arr[0], y: arr[1]})
    })

    return arr_result

  } else if (typeof crd === "object") {

    let arr = proj4("EPSG:4326", "EPSG:5316", [crd.lng, crd.lat])
    return {x: arr[0], y: arr[1]}

  }

}

function PosToLatLng(pos: Pos): Crd
function PosToLatLng(pos: Pos[]): Crd[]
function PosToLatLng(pos: Pos | Pos[]): Crd | Crd[] {

  let center = get(system).settings.center_of_FO

  if (Array.isArray(pos)) {
    let arr_ret = [];
    pos.forEach(val => {
      let arr = proj4("EPSG:5316", "EPSG:4326", [val.x + center.x, val.y + center.y])
      arr_ret.push({lng: arr[0], lat: arr[1]})
    })

    return arr_ret

  } else if (typeof pos === "object") {

    let arr = proj4("EPSG:5316", "EPSG:4326", [pos.x + center.x, pos.y + center.y])
    return {lng: arr[0], lat: arr[1]}

  }

}

function AbsPosToLatLng(pos: Pos): Crd
function AbsPosToLatLng(pos: Pos[]): Crd[]
function AbsPosToLatLng(pos: Pos | Pos[]): Crd | Crd[] {

  if (Array.isArray(pos)) {
    let arr_ret = [];
    pos.forEach(val => {
      let arr = proj4("EPSG:5316", "EPSG:4326", [val.x, val.y])
      arr_ret.push({lng: arr[0], lat: arr[1]})
    })

    return arr_ret

  } else if (typeof pos === "object") {

    let arr = proj4("EPSG:5316", "EPSG:4326", [pos.x, pos.y])
    return {lng: arr[0], lat: arr[1]}

  }

}

function PosToAbsPos(pos: Pos): Pos
function PosToAbsPos(pos: Pos[]): Pos[]
function PosToAbsPos(pos: Pos | Pos[]): Pos | Pos[] {

  let center = get(system).settings.center_of_FO

  if (Array.isArray(pos)) {
    let arr_ret: Pos[] = [];
    pos.forEach(val => {
      arr_ret.push({x: val.x + center.x, y: val.y + center.y})
    })

    return arr_ret

  } else if (typeof pos === "object") {
    return {x: pos.x + center.x, y: pos.y + center.y}
  }

}

function AbsPosToPos(pos: Pos): Pos
function AbsPosToPos(pos: Pos[]): Pos[]
function AbsPosToPos(pos: Pos | Pos[]): Pos | Pos[] {

  let center = get(system).settings.center_of_FO

  if (Array.isArray(pos)) {
    let arr_ret: Pos[] = [];
    pos.forEach(val => {
      arr_ret.push({x: val.x - center.x, y: val.y - center.y})
    })

    return arr_ret

  } else if (typeof pos === "object") {
    return {x: pos.x - center.x, y: pos.y - center.y}
  }

}
  
function PosToPixel(pos: Pos, bbox: BoundingBox): Px {
  let center = get(system).settings.center_of_FO;

  // Calculates the coresponding pixel.
  const x = Math.floor((pos.x + center.x - bbox.xmin) / bbox.widthRatio);
  const y = Math.floor((bbox.ymax - (pos.y + center.y)) / bbox.heightRatio);

  return {x, y}
}

function AbsPosToPixel(pos: Pos, bbox: BoundingBox): Px {

  // Calculates the coresponding pixel.
  const x = Math.floor((pos.x - bbox.xmin) / bbox.widthRatio);
  const y = Math.floor((bbox.ymax - pos.y) / bbox.heightRatio);

  return {x, y}
}

function PixelToPos(px: Px, bbox: BoundingBox): Pos {
  let center = get(system).settings.center_of_FO;

  let x = px.x * bbox.widthRatio + bbox.xmin - center.x;
  let y = bbox.ymax - px.y * bbox.heightRatio - center.y;
  
  return {x, y}

}

function PixelToAbsPos(px: Px, bbox: BoundingBox): Pos {

  let x = px.x * bbox.widthRatio + bbox.xmin;
  let y = bbox.ymax - px.y * bbox.heightRatio;
  
  return {x, y}

}


export let convertF = {
  LatLngToPos,
  LatLngToAbsPos,
  PosToLatLng,
  AbsPosToLatLng,
  PosToAbsPos,
  AbsPosToPos,
  PosToPixel,
  AbsPosToPixel,
  PixelToPos,
  PixelToAbsPos

}