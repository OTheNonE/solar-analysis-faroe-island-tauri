import { convertF } from "./ConvertUnit"
import { get } from 'svelte/store';
import L, { type LatLngExpression } from 'leaflet';
import { createRidge, getRidgePoints, getSingleHeight } from "./GetHeight"
import { system, type Pos, type Ridge } from "../Stores"
import type { Crd } from "../Stores"
import { waitForElm } from "./Functions";

waitForElm('#leafletmap').then(() => {
  system.update(o => {
  
    o.map.on('click', e => onMapClick(e))
    o.map.on('contextmenu', e => o.map.closePopup())

    return o
  })
})

async function onMapClick(e) {

  var crd: Crd = {lat: e.latlng.lat, lng: e.latlng.lng}
  
  const pos = convertF.LatLngToPos(crd)
  const px = convertF.PosToPixel(pos)
  const height = await getSingleHeight(px)

  system.update(o => {

    o.map.openPopup(showCreateRidgePopup(crd, pos, height))

    return o
  })
}

function showCreateRidgePopup(crd: Crd, pos: Pos, height: number) {

  return L.popup({ content: () => {

    // The function creating a mountain curve.
    async function createCurrentRidge() {

      // Get values.
      let label = input.value
      let ridgePoints = await getRidgePoints(pos, height, label)

      // Create the mountain curve.
      let ridge = createRidge(label, ridgePoints, crd, height)

      system.update(o => {

        // Add the polyline to the map if it is not in the map.
        if (!o.map.hasLayer(ridge.polyline.onMap)) {
          ridge.polyline.onMap.addTo(o.map)
        }

        // Add the marker to the map if it is not in the map.
        if (!o.map.hasLayer(ridge.marker.onMap)) {
          ridge.marker.onMap.addTo(o.map);
        }

        // Fit the view to the polygon:
        o.map.fitBounds(ridge.polyline.onMap.getBounds())

        // Close all popups (the current).
        o.map.closePopup()

        // Open new popup window.
        o.map.openPopup(acceptNewRidge(crd, ridge))

        return o
      })

    }

    const div_crd = document.createElement('div');
    div_crd.style.width = '100%';
    div_crd.innerHTML = 'lng = '+crd.lng.toFixed(3)+', lat = '+crd.lat.toFixed(3);

    const btn = document.createElement('button');
    btn.style.width = '100%';
    btn.innerHTML = "Create ridge"

    const input = document.createElement('input');
    input.style.width = '100%';
    input.placeholder = "Name of location"

    const div = document.createElement('div');
    div.appendChild(div_crd)
    div.appendChild(input)
    div.appendChild(btn)

    btn.onclick = async () => createCurrentRidge()

    return div
  }}).setLatLng(crd)

}

function acceptNewRidge(crd: Crd, ridge: Ridge) {

  function addCurrentRidge() {
    system.update(o => {

      o.map.removeLayer(ridge.marker.onMap)
      o.map.removeLayer(ridge.polyline.onMap)

      o.stored.ridges.push(ridge);

      return o
    })

  }

  function discardCurrentRidge() {
    system.update(o => {

      o.map.removeLayer(ridge.marker.onMap)
      o.map.removeLayer(ridge.polyline.onMap)

      return o
    })
  }

  return L.popup({
    content: () => {

      const btn_add = document.createElement('button');
      btn_add.innerHTML = "Add"

      const btn_discard = document.createElement('button');
      btn_discard.innerHTML = "Discard"

      const div = document.createElement('div');
      div.appendChild(btn_add)
      div.appendChild(btn_discard)

      btn_add.onclick = () => {
        addCurrentRidge()
        get(system).map.closePopup()
      }

      btn_discard.onclick = () => get(system).map.closePopup()

      return div
    }
  }).setLatLng(crd).on('remove', () => discardCurrentRidge())
}