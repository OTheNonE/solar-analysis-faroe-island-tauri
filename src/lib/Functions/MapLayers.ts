
// Svelte imports:
import { get } from 'svelte/store';

// Library imports:
import L from "leaflet";

// Imports from Stores.svelte:
import type { Crd } from "src/lib/Stores"

// Imports from function typescript files:
import { chartF } from './Chart';


export function createPolyline(crds?: Crd[]) {

  if (crds) {
    return L.polyline(crds)
  } else {
    return L.polyline([{lat: 0, lng: 0}, {lat: 0.1, lng: 0.1}]);
  }
}

export function createMarker(crd?: Crd) {
  if (crd) {
    return L.marker(crd)
  } else {
    return L.marker([0,0])
  }
}

export function updateColorOfLayer(layer, color) {
  layer.setStyle({
    color,
  })

}