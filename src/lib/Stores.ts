import type { GeoTIFFImage } from 'geotiff';
import { writable } from 'svelte/store';
import type { Point } from 'src/lib/Functions';

interface HeightMap {
  map: GeoTIFFImage,
  boundingBox: {
    xmin: number, // Minimum horizontal position [m]
    ymin: number, // Minimum vertical position [m]
    xmax: number, // Maximum horizontal position [m]
    ymax: number, // Maximum vertical position [m]
    width: number, // Width [m]
    height: number, // Height [m]
    pixelWidth: number, // Width of image [number of px]
    pixelHeight: number, // Height of image [number of px]
    widthRatio: number, // Number of pixel to meters [m/N_px]
    heightRatio: number, // Number of pixel to meters [m/N_px]
  }
}

interface Settings {
  dv: number,
  radius: number,
  d_min: number,
}

interface CrdSys {
  name: string,
  conv: string,
}

interface Info {
  crd: {lng: number, lat: number}
  pos: {x: number, y: number}
  mapHeight: number,
  mountainCurve: Point[]
}

interface Container {
  leaf: any,
  crdSys: {
    [index: string]: CrdSys
  },
  marker: any,
  map: any,
  heightMap: HeightMap,
  info: Info,
  settings: Settings,
}

let container: Container = {
  leaf: undefined,
  crdSys: {},
  marker: {},
  map: {},
  heightMap: undefined,
  info: {
    pos: {x: 0, y: 0},
    crd: {lng: 0, lat: 0},
    mapHeight: 0,
    mountainCurve: undefined,
  },
  settings: {
    dv: 1,
    radius: 6000 / 2,
    d_min: 100,
  },
};

export let system = writable(container);