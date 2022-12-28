import { get } from 'svelte/store';
import { system } from 'src/lib/Stores';
import proj4 from 'proj4';
import { convertArrayToCSV } from 'convert-array-to-csv';
import { saveAs } from 'file-saver';
import SunCalc from 'suncalc';

// Example of SunCalc:
let date = new Date(2020,6,21,11,0,0,0);
let a_pos = SunCalc.getPosition(date, 62, -7)
// console.log({
//   h: a_pos.altitude * 180 / Math.PI,
//   w: a_pos.azimuth * 180 / Math.PI,
// })


export async function getAllHeight() {

  return await get(system).heightMap.map.readRasters()
    .then(result => {
      return result
  })
    .catch(error => {
      console.log("oh no! there was some error... therefore -1 is returned...")
      console.log(error)
      return -1
  })

}

export async function getAreaHeight(px: { xmin: number, xmax: number, ymin: number, ymax: number } ) {
    
  const window = [ px.xmin, px.ymin, px.xmax, px.ymax ];

  return await get(system).heightMap.map.readRasters({ window })
    .then(result => {
    return result
  })
    .catch(error => {
    console.log("oh no! there was some error... therefore -1 is returned...")
    console.log(error)
    return -1
  })

}

export async function getSingleHeight(px) {

  const window = [ px.x, px.y, px.x + 1, px.y + 1 ];
  console.log(window)

  var height: number = await get(system).heightMap.map.readRasters({ window })
    .then(result => {
      let num = result[0][0];
      if (num == 0 || num == 255) { num = 0 };
      return num
  })
    .catch(error => {
      console.log("oh no! there was some error... therefore -1 is returned...")
      return -1
  })

  return height
  // console.log('(' + pos.x + ' - ' + bbox_ob.xMin + ') / ' + bboxWidth)

  // console.log({
  //   'width': xPx,
  //   'height': yPx
  // })


}

export function convertLatLngToPos(crd: Crd): Pos
export function convertLatLngToPos(crd: Crd[]): Pos[]
export function convertLatLngToPos(crd: Crd | Crd[]): Pos | Pos[] {

  let EPSG5316 = get(system).crdSys.EPSG5316.conv;
  let EPSG4326 = get(system).crdSys.EPSG4326.conv;

  if (Array.isArray(crd)) {

    let arr_ret = [];
    crd.forEach(val => {
      let arr = proj4(EPSG4326, EPSG5316, [val.lng, val.lat]);
      arr_ret.push({x: arr[0], y: arr[1]})
    })

    return arr_ret

  } else if (typeof crd === "object") {

    let arr = proj4(EPSG4326, EPSG5316, [crd.lng, crd.lat])
    return {x: arr[0], y: arr[1]}

  }

}

export function convertPosToLatLng(pos: Pos): Crd
export function convertPosToLatLng(pos: Pos[]): Crd[]
export function convertPosToLatLng(pos: Pos | Pos[]): Crd | Crd[] {

  let EPSG5316 = get(system).crdSys.EPSG5316.conv;
  let EPSG4326 = get(system).crdSys.EPSG4326.conv;

  if (Array.isArray(pos)) {
    let arr_ret = [];
    pos.forEach(val => {
      let arr = proj4(EPSG5316, EPSG4326, [val.x, val.y])
      arr_ret.push({lng: arr[0], lat: arr[1]})
    })

    return arr_ret

  } else if (typeof pos === "object") {

    let arr = proj4(EPSG5316, EPSG4326, [pos.x, pos.y])
    return {lng: arr[0], lat: arr[1]}

  }

}
  
export function convertPosToPixel(pos: {x: number, y: number}) {
  var bbox = get(system).heightMap.boundingBox;

  // Calculates the coresponding pixel.
  const x = Math.floor(bbox.pixelWidth * (pos.x - bbox.xmin) / bbox.width);
  const y = Math.floor(bbox.pixelHeight * (bbox.ymax - pos.y) / bbox.height);

  return {x, y}
}

export function convertPixelToPos(px: {x: number, y: number}) {
  var bbox = get(system).heightMap.boundingBox;

  var x = px.x * bbox.widthRatio + bbox.xmin;
  var y = bbox.ymax - px.y * bbox.heightRatio;
  
  return {x, y}

}


export async function getMountainCurve() {

  let settings = get(system).settings;

  // The current position of marker:
  let h_m = get(system).info.mapHeight;
  let pos_m = get(system).info.pos

  // The angles are divided by every dv degrees:
  let dv = settings.dv;
  
  // Get bounding box values:
  let bbox = get(system).heightMap.boundingBox;
  
  // Convert the position [m] to absolute pixel position on image:
  let px_m = convertPosToPixel(pos_m);

  // The window that will be measured:
  let radius = settings.radius;
  let window = {
    xmin: px_m.x - radius,
    ymin: px_m.y - radius,
    xmax: px_m.x + radius,
    ymax: px_m.y + radius,
  }

  // The values are read from the raster image:
  let values = await getAreaHeight(window);

  let image = {
    heights: values[0],
    w: values["width"],
    h: values["height"],
  }

  // The point array keeping track of the points with the highest r value:
  let mountainCurve: Point[] = []

  // Loop through every point...
  for (let i = 0; i < image.heights.length; i++) {

    // If the given height is 0 or 255 (255 is seawater), then make it 0.
    let height = image.heights[i];
    if (height == 0 || height == 255) height = 0;

    // Calculate the x and y pixel position.
    let px = {
      x: i % image.w - radius,
      y: image.h - Math.floor(i / image.w) - radius,
    }

    // Get the distance components from current point to marker:
    let d = {
      x: px.x * bbox.widthRatio,
      y: px.y * bbox.heightRatio
    }

    // Calculate the absolute position on the map.
    let pos: Pos = {
      x: d.x + pos_m.x,
      y: d.y + pos_m.y,
    }
    
    // If the total distance is greater than 150, it can bring
    // errors, and therefore, remove it.
    let d_abs = Math.sqrt(d.x**2 + d.y**2);
    if (d_abs < settings.d_min) continue;

    // Calculate the angle between the current position and marker:
    let v_lng = angle360( Math.atan2(d.y, d.x) * 180 / Math.PI );

    // Calculate the height to distance ratio (h/d):
    let r = (height - h_m) / d_abs

    // Calculate the index which to store the new point:
    let index = Math.floor(v_lng / dv);

    // If the calculated ratio is greater than the current, replace it.
    if (mountainCurve[index] == undefined || mountainCurve[index].r < r) {
      let v_lat = Math.atan2(height, d_abs) * 180 / Math.PI;
      mountainCurve[index] = {x: pos.x, y: pos.y, h: height, d: d_abs, v_lng, v_lat, r};
    }
  }

  get(system).info.mountainCurve = mountainCurve

  let crds = convertPosToLatLng(mountainCurve)

  createPolyline(crds);

  // const header = ['h', 'd', 'v_lng', 'v_lat', 'r']
  // const csvText = convertArrayToCSV(c, { header });
  // var file = new Blob([csvText]);
  // saveAs(file, "myCalcValues.csv");

}

function createPolyline(arr) {
  console.log(arr)
  var polyline = get(system).leaf.polyline(arr, {color: 'red'}).addTo(get(system).map)
  get(system).map.fitBounds(polyline.getBounds())
}

function angle360(v) {
  while (v < 0 || v >= 360) {
    if (v < 0) {
      v += 360;
    } else if (v >= 360) {
      v -= 360;
    }
  }
  return v
}

export interface Point {
  x: number,
  y: number,
  h: number,
  d: number,
  v_lng: number,
  v_lat: number,
  r: number,
}

interface Pos {
  x: number,
  y: number,
}

interface Crd {
  lat: number,
  lng: number,
}