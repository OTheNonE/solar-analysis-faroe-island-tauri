import type { Chart, ChartDataset } from 'chart.js';
import type { GeoTIFFImage } from 'geotiff';
import type { LeafletEventHandlerFnMap } from 'leaflet';
import { writable } from 'svelte/store';

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

export type ChartTypes = 'Hillshade' | 'Sunrise' | 'Sunset';

export interface Point extends Dir, Pos {
  h: number,
  d: number,
  r: number,
}

export interface Dir {
  azi: number,
  alt: number,
}

export interface Sun {
  dataset: ChartDataset,
  show: boolean,
  color: string,
  date: string,
}

export interface Pos {
  x: number,
  y: number,
}

export interface Crd {
  lat: number,
  lng: number,
}

interface Settings {
  dv: number,
  radius: number,
  d_min: number,
  center_of_FO: {x: number, y: number},
}

interface CoordinateSystem {
  name: string,
  conv: string,
}

interface Marker {
  onMap: L.Marker,
  crd: Crd,
  pos: Pos,
  mapHeight: number,
}

interface Polyline {
  crds: Crd[],
  onMap: L.Polyline,
}

export interface Ridge {
  label: string,
  color: string,
  points: Point[],
  dataset: ChartDataset,
  marker: Marker,
  polyline: Polyline,
}

interface Stored {
  ridges: Ridge[]
}

interface ChartWindow {
  chartType: ChartTypes,
  chart: Chart,
  selected: Ridge[],
  sun: Sun,

}

interface Container {
  coordinateSystem: {
    [index: string]: CoordinateSystem
  },
  chart: ChartWindow,
  map: L.Map,
  heightMap: HeightMap,
  stored: Stored,
  settings: Settings,
}

let container: Container = {
  coordinateSystem: {},
  map: undefined,
  chart: {
    chart: undefined,
    selected: [],
    sun: undefined,
    chartType: 'Hillshade',
  },
  heightMap: undefined,

  stored: {
    ridges: []
  }, 

  settings: {
    dv: 1,
    radius: 4000 / 2,
    d_min: 100,
    center_of_FO: {x: 205700, y: 884500}
  },
};

export let system = writable(container);