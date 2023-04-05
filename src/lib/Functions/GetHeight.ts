
// Svelte imports:
import { get } from 'svelte/store';

// Imports from Stores.svelte:
import type { Window } from "src/lib/Stores"
import type { Point, Pos, Px } from "src/lib/Stores"

// Imports from function typescript files:
import type { GeoTIFFImage, TypedArray } from 'geotiff';

// Functions:

export async function getHeight(image: GeoTIFFImage, px?: Window): Promise<{heights: TypedArray, w, h}>
export async function getHeight(image: GeoTIFFImage, px: Px): Promise<number>
export async function getHeight(image: GeoTIFFImage, px?: Window | Px): Promise<{heights: TypedArray, w, h} | number> {

  let options: { window: Array<number> };

  if (px == undefined) {
    
  } else if ('xmin' in px) {
    options = {
      window: [ px.xmin, px.ymax, px.xmax, px.ymin ]
    }
  } else if ('x' in px) {
    options = {
      window: [px.x, px.y, px.x + 1, px.y + 1]
    }
  }

  let value = await image.readRasters(options)
    .then(result => {

      if (!ArrayBuffer.isView(result[0])) {
        throw new Error("It is not an array!")
      }

      if (px == undefined) {

      } else if ('x' in px) {
        let num = result[0][0]
        return (num == 0 || num == 255) ? 0 : result[0][0]
      }

      return {
        heights: result[0],
        w: result.width,
        h: result.height
      }
    }).catch(error => {
      throw new Error("There was an error: "+error)
    })

  return value
}

export async function getHeightFromREST(pos: Pos) {

  let url = 'https://gis.us.fo/arcgis/rest/services/dsm/FO_DSM_2017_2m/ImageServer/identify'
  
  let params = new URLSearchParams({
    f: 'json',
    geometry: JSON.stringify({
      "x": pos.x,
      "y": pos.y,
      "spatialReference": {
        "wkid": 5316,
        "latestWkid": 5316
      }
    }),
    returnGeometry: 'true',
    returnCatalogItems: 'true',
    geometryType: 'esriGeometryPoint',
    renderingRules: '[{"rasterFunction":"none"}]',
    returnPixelValues: 'false',
  })

  let height: "NoData" | string = await fetch(`${url}?${params}`)
    .then(response => response.json())
    .then(json => json.value)
    .catch(error => {
      throw Error('Error fetching GeoTIFF data:', error)
    });

  return height == "NoData" ? 0 : Number(height)

}
