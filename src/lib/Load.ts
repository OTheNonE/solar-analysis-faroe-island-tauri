import { fromArrayBuffer, type GeoTIFFImage } from 'geotiff';
import { system } from 'src/lib/Stores';
import { get } from 'svelte/store';

// URLs:
// var kortalUrl = 'https://gis.us.fo/arcgis/rest/services/dsm/FO_DSM_2017_2m/ImageServer'
// var kortalUrl = 'https://gis.us.fo/arcgis/services/dsm/FO_DSM_2017_2m/ImageServer?wsdl'
var kortalUrl = 'src/assets/FO_DSM_2017_FOTM_2M.tif'
// var kortalJSONUrl = 'https://gis.us.fo/arcgis/rest/services/dsm/FO_DSM_2017_2m/ImageServer?f=pjson'
var epsg5316Url = 'https://epsg.io/5316.proj4'
var epsg4326Url = 'https://epsg.io/4326.proj4'

// Retrieve JSON file belonging to the DSM map.
// var kortalJSON;
// fetch(kortalJSONUrl)
//   .then((response) => response.json())
//   .then((result) => {
//     kortalJSON = result
//     console.log("Kortal JSON er loada!")
//     // console.log(kortalJSON)
//   });


fetch(epsg5316Url)
  .then(response  => response.text())
  .then(result    => {

    get(system).coordinateSystem['EPSG5316'] = {
      name: 'EPSG5316',
      conv: result,
    }

    console.log("EPSG5316 (FAROE) er loada!")
});

fetch(epsg4326Url)
  .then(response  => response.text())
  .then(result    => {

    get(system).coordinateSystem['EPSG4326'] = {
      name: 'EPSG4326',
      conv: result,
    }

    console.log("EPSG4326 er loada!")
});

fetch(kortalUrl)
  .then(response  => response.arrayBuffer())
  .then(tiff      => fromArrayBuffer(tiff))
  .then(result    => result.getImage())
  .then(image     => {
    setHeightMapProperties(image)
    console.log("Kortal HeightMap er loada!")
})

function setHeightMapProperties(image: GeoTIFFImage) {

  const bbox = image.getBoundingBox();
  
  get(system).heightMap = {
    map: image,
    boundingBox: {
      xmin: bbox[0],
      ymin: bbox[1],
      xmax: bbox[2],
      ymax: bbox[3],
      width: bbox[2] - bbox[0],
      height: bbox[3] - bbox[1],
      pixelWidth: image.getWidth(),
      pixelHeight: image.getHeight(),
      widthRatio: (bbox[2] - bbox[0]) / image.getWidth(),
      heightRatio: (bbox[3] - bbox[1]) / image.getHeight()
    }
  }

  console.log(get(system).heightMap)

}