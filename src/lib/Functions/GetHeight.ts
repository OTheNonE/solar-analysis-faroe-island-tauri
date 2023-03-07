
// Svelte imports:
import { get } from 'svelte/store';

// Imports from Stores.svelte:
import { system, type Crd, type Ridge } from "src/lib/Stores"
import type { Point, Pos } from "src/lib/Stores"

// Imports from function typescript files:
import { convertF } from './ConvertUnit';
import { angle360 } from 'src/lib/Functions/Functions';
import { createPolyline, createMarker } from './MapLayers';
import { chartF } from './Chart';

// Functions:
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

      if (!ArrayBuffer.isView(result[0])) {
        throw new Error("It is not an array!")
      }

      return {
        heights: result[0],
        w: result["width"],
        h: result["height"],
      }
  })
    .catch(error => {

    console.log(error)
    return {
      heights: [],
      w: 0,
      h: 0
    }

  })

}

export async function getSingleHeight(px) {

  const window = [ px.x, px.y, px.x + 1, px.y + 1 ];

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

export async function getRidgePoints(pos_m: Pos, h_m: number, label: string) {

  let settings = get(system).settings;

  // The current position of marker:
  // let h_m = get(system).current.marker.mapHeight;
  // let pos_m = get(system).current.marker.pos

  // The angles are divided by every dv degrees:
  let dv = settings.dv;
  
  // Get bounding box values:
  let bbox = get(system).heightMap.boundingBox;
  
  // Convert the position [m] to absolute pixel position on image:
  let px_m = convertF.PosToPixel(pos_m);

  // The window that will be measured:
  let radius = settings.radius;
  let window = {
    xmin: px_m.x - radius,
    ymin: px_m.y - radius,
    xmax: px_m.x + radius,
    ymax: px_m.y + radius,
  }

  // The values are read from the raster image:
  let image = await getAreaHeight(window);

  // The point array keeping track of the points with the highest r value:
  let ridgePoints: Point[] = []

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
    let azi = angle360( Math.atan2(d.y, d.x) * 180 / Math.PI - 90 );

    // Calculate the height to distance ratio (h/d):
    let r = (height - h_m) / d_abs

    // Calculate the index which to store the new point:
    let index = Math.floor(azi / dv);

    // If the calculated ratio is greater than the current, replace it.
    if (ridgePoints[index] == undefined || ridgePoints[index].r < r) {
      let alt = Math.atan2(height - h_m, d_abs) * 180 / Math.PI;
      ridgePoints[index] = {x: pos.x, y: pos.y, h: height, d: d_abs, azi, alt, r};
    }
  }

  return ridgePoints
}

export function createRidge(label: string, ridgePoints: Point[], crd: Crd, h: number) {
  let color = "#00ff00";
  let crds = convertF.PosToLatLng(ridgePoints)

  let ridge: Ridge = {
    color,
    label,
    points: ridgePoints,
    dataset: chartF.createDataset(label, color),// {label: '', data: [], radius: 0, showLine: true},
    marker: {
      onMap: createMarker(crd),
      crd,
      pos: convertF.LatLngToPos(crd),
      mapHeight: h
    },

    polyline: {
      crds,
      onMap: createPolyline(crds).setStyle({color}),
    }
  }

  chartF.updateDataset(ridge)

  return ridge
}