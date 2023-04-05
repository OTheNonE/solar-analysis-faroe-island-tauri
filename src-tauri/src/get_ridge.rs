
use std::path::Path;

struct Pos {
  x: f64,
  y: f64
}

struct Settings {
  dv: f64,
  center: Pos,
  bounding_box: BoundingBox
}

struct BoundingBox {
  xmin: f64,
  xmax: f64,
  ymin: f64,
  ymax: f64,
}

#[derive(Debug, Copy, Clone)]
struct RidgePoint {
  x: f64,
  y: f64,
  h: f64,
  d: f64,
  azi: f64,
  alt: f64,
  r: f64,
}

impl RidgePoint {
  fn new() -> RidgePoint {
    RidgePoint { x: 0.0, y: 0.0, h: 0.0, d: 0.0, azi: 0.0, alt: 0.0, r: 0.0 }
  } 
}

#[tauri::command]
pub async fn get_ridge_handler() -> f64 {

  let pos_m = Pos {
    x: 0.3,
    y: 0.6
  };

  let h_m = 35.4;

  let settings = Settings {
    dv: 1.0,
    center: Pos { x: 0.6, y: 0.3 },
    bounding_box: BoundingBox { xmin: 0.5, xmax: 0.5, ymin: 0.5, ymax: 0.5 }
  };

  let result = get_ridge(pos_m, h_m, settings);

  25.0

  // println!("This is my result: {:?}", &result);
}



fn get_ridge(pos_marker: Pos, h_marker: f64, settings: Settings) -> [RidgePoint; 360] {

  let url = Path::new("C:/Programmering/solar-analysis-faroe-island/src/assets/FO_DSM_2017_FOTM_5M.tif");
  let url_string = Path::to_str(&url).unwrap();

  let dv = settings.dv;
  let center = settings.center;
  let bbox = settings.bounding_box;

  let pos_px_m = Pos {
    x: pos_marker.x + center.x - bbox.xmin,
    y: bbox.ymax - pos_marker.y - center.y,
  };

  let mut ridge_points: [RidgePoint; 360] = [RidgePoint::new(); 360];

  // let value = tiff.get_value_at(100, 100);

  // longitude: image_length
  // latitude: image_width

  ridge_points
}
