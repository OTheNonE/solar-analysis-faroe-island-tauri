
import { system } from 'src/lib/Stores';
import { get } from 'svelte/store';
import { getGeoTIFFImage, getBoundingBox } from './Functions/FetchFunctions';
import type { GeoTIFFImage } from 'geotiff';
import proj4 from 'proj4';

// URLs:
var kortalUrl = 'src/assets/FO_DSM_2017_FOTM_25M_DEFLATE_UInt16.tif'

// Define Faroese projection
proj4.defs("EPSG:5316","+proj=tmerc +lat_0=0 +lon_0=-7 +k=0.999997 +x_0=200000 +y_0=-6000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

// Load GeoTIFFImage
getGeoTIFFImage(kortalUrl).then(image => {
  get(system).heightMap = {
    map: image,
    boundingBox: getBoundingBox(image)
  }

  console.log("Kortal HeightMap er loada!")
})