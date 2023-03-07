
// Svelte imports:
import { get } from 'svelte/store';

// Library imports:
import SunCalc from 'suncalc';

// Imports from Stores.svelte:
import { system, type Ridge } from 'src/lib/Stores';
import type { Pos, Crd, Dir, Point } from 'src/lib/Stores'

// Imports from function typescript files:
import { angle360, getIntersection, isBetween, UnitTime } from './Functions';
import type { ChartDataset, ChartOptions, Point as ChartPoint } from 'chart.js';

// The chart options:
export let optionsHillshade: ChartOptions = {
  scales: {
    x: {   
      type: 'linear',
      min: 0,
      max: 360,
      ticks: {
        stepSize: 45
      }
    },
    xCompass: {
      type: 'linear',
      min: 0,
      max: 360,
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        stepSize: 90,
        callback: function(tickValue, index, ticks) {
          if (typeof tickValue != "number") {return}

          let nesw = [
            { string: 'North',  value: 0 }, 
            { string: 'East',   value: 90 },
            { string: 'South',  value: 180 },
            { string: 'West',   value: 270 },
          ]

          for (let direction of nesw) {
            if (tickValue % 360 == direction.value) {
              return direction.string
            }
          }
        }
      }
    },
    y: {
      type: 'linear',
      min: 0,
      max: 45,
    }
  },

  plugins: {
    legend: {
      onClick: null,
    }
  },
  
  maintainAspectRatio: false,
  responsive: true,
}

export let optionsSunrise: ChartOptions = {
  scales: {
    x: {
      type: 'linear',
      min: 0,
      max: 365,
      grid: {
        drawOnChartArea: false,
      },
      // Callback function that gives out the 1.st of every month
      ticks: {
        stepSize: 1,
        callback: function(tickValue, index, ticks) {

          if (typeof tickValue != "number") {return}

          let date = new Date(Date.UTC(2022, 0, tickValue))
          let current_date = date.getDate()
          let current_month = date.getMonth()

          let months = [
            { string: 'January',    value: 0 }, 
            { string: 'February',   value: 1 },
            { string: 'March',      value: 2 },
            { string: 'April',      value: 3 }, 
            { string: 'May',        value: 4 }, 
            { string: 'June',       value: 5 }, 
            { string: 'July',       value: 6 }, 
            { string: 'August',     value: 7 }, 
            { string: 'September',  value: 8 }, 
            { string: 'October',    value: 9 }, 
            { string: 'November',   value: 10 },
            { string: 'December',   value: 11 }
          ]

          for (let month of months) {
            if (current_date == 1 && current_month == month.value) {
              return month.string
            }
          }
          
        }
      }
    },
    y: {
      type: 'linear',
      min: 0,
      max: 24,
      ticks: {
        stepSize: 2
      }
    }
  },

  plugins: {
    legend: {
      onClick: null,
    }
  },
  
  maintainAspectRatio: false,
  responsive: true,
}


// Functions:
function updateChartType() {

  system.update(o => {
    
    let chart = o.chart.chart

    if (o.chart.chartType == "Hillshade") {
      chart.options = optionsHillshade;
    } else if (o.chart.chartType == "Sunrise") {
      chart.options = optionsSunrise;
      hideSunDataset()
    } else if (o.chart.chartType == "Sunset") {
      chart.options = optionsSunrise;
      hideSunDataset()
    }

    o.chart.selected.forEach(ridge => {
      updateDataset(ridge)
    })

    chart.update()
    return o
  })

}

function updateDataset(opt: {dataset: ChartDataset, points: Point[], label: string, color: string}) {

  let data: Pos[] = [];
  let chartType = get(system).chart.chartType;

  if (chartType == "Hillshade") {
    data = updateHillshadeDataset(opt.points);

  } else if (chartType == "Sunrise") {
    data = updateTwilightDataset(opt.points, "Sunrise")

  } else if (chartType == "Sunset") {
    data = updateTwilightDataset(opt.points, "Sunset")
  }
  
  opt.dataset.label = opt.label;
  opt.dataset.data = data;
  opt.dataset.backgroundColor = opt.color;
  opt.dataset.borderColor = opt.color;

}

function updateHillshadeDataset(points: Point[]) {

  let data: Pos[] = [];
  points.forEach(point => {
    data.push({
      x: point.azi,
      y: point.alt,
    })
  })

  return data
}

function updateTwilightDataset(points: Point[], twilight: "Sunrise" | "Sunset") {

  function getMountain(index: number): Dir {
    let mod = points.length
    let p = points[((index % mod) + mod) % mod]
    return { azi: p.azi, alt: p.alt }
  }

  function getSunPosition(date: Date) {
    let p = SunCalc.getPosition(date, 62, -7);
    let dir: Dir = { azi: angle360( p.azimuth * 180 / Math.PI - 180 ), alt: p.altitude * 180 / Math.PI };
    return dir
  }

  let year = 2022;
  let date = 0;

  let dt_e = 5 // minutes
  let date_jan1 = new Date(Date.UTC(year, 0));

  let p_index = 0

  let datapoints: Pos[] = [];

  for (date = 1; date <= 365; date++) {
    let safety = 0

    let start_hour = twilight == "Sunrise" ? 2 : 14;
    let min = 0;

    while (true) {
      safety += 1
      if ( safety > 100000 ) { break }

      let date_1 = new Date(Date.UTC(year, 0, date, start_hour, min))
      let date_2 = new Date(Date.UTC(year, 0, date, start_hour, min + dt_e))
 
      let date_init = new Date(Date.UTC(year, 0, date, start_hour))

      if (UnitTime.MILLIS / UnitTime.DAY < Math.abs(date_1.getTime() - date_init.getTime())) {
        console.log('oh nooo')
        let date_x = (date_1.getTime() - date_jan1.getTime()) * UnitTime.DAY / UnitTime.MILLIS
        datapoints.push({x: date_x , y: 0})
        break
      }

      let m_1: Dir = getMountain(p_index)
      let m_2: Dir = getMountain(p_index + 1)
      let s_1: Dir = getSunPosition(date_1)
      let s_2: Dir = getSunPosition(date_2)
  
      // It's important that s_2 and m_2 are bigger than s_1 and m_1.
      let s_1_azi_disp = (s_2.azi < s_1.azi) ? s_1.azi - 360 : s_1.azi
      let m_1_azi_disp = (m_2.azi < m_1.azi) ? m_1.azi - 360 : m_1.azi
  
      let azi_disp = Math.min(s_1_azi_disp, m_1_azi_disp);
  
      s_1.azi = angle360(s_1_azi_disp - azi_disp)
      m_1.azi = angle360(m_1_azi_disp - azi_disp)
      s_2.azi = angle360(s_2.azi - azi_disp)
      m_2.azi = angle360(m_2.azi - azi_disp)
  
      // If the points lines do not intersect, increment.
      if ( 
        !isBetween(s_1.azi, m_1.azi, s_2.azi) &&
        !isBetween(s_1.azi, m_2.azi, s_2.azi) &&
        !isBetween(m_1.azi, s_1.azi, m_2.azi) && 
        !isBetween(m_1.azi, s_2.azi, m_2.azi) ) {
        p_index += 1;
        continue
      }

      let sol = getIntersection(
        {x: s_1.azi, y: s_1.alt}, 
        {x: s_2.azi, y: s_2.alt}, 
        {x: m_1.azi, y: m_1.alt}, 
        {x: m_2.azi, y: m_2.alt} )
      
      let s_inte_perc = (sol.x - s_1.azi) / (s_2.azi - s_1.azi)
      let m_inte_perc = (sol.x - m_1.azi) / (m_2.azi - m_1.azi)

      if (isBetween(0, s_inte_perc, 1) && isBetween(0, m_inte_perc, 1) && 
      ((sol.den < 0 && twilight == "Sunrise") || (sol.den > 0 && twilight == "Sunset"))) {

        let time_y = 0;
        let date_x = 0;
        
        time_y += date_1.getUTCHours()
        time_y += date_1.getUTCMinutes() * UnitTime.HOUR / UnitTime.MINUTE
        time_y += date_1.getUTCSeconds() * UnitTime.HOUR / UnitTime.SECONDS
        time_y += dt_e * s_inte_perc * UnitTime.HOUR / UnitTime.MINUTE

        date_x = (date_1.getTime() - date_jan1.getTime()) * UnitTime.DAY / UnitTime.MILLIS
        
        datapoints.push({x: date_x, y: time_y})

        break
      }
  
      if ( m_2.azi < s_2.azi ) {
        p_index += 1
        
      } else {
        min += dt_e
      }
    
    }
  }

  return datapoints;

}

function updateSunDataset(dataset: ChartDataset, date: Date) {

  // Clear dataset array.
  dataset.data.length = 0;

  let len = 360
  for (let i = 0; i < len; i++) {
    let millis = i * 24 * 60 * 60 * 1000 / len;
    let hour = new Date(millis)
    let usedDate = new Date(
      date.getFullYear(), date.getMonth(), date.getDate(),
      hour.getHours(), hour.getMinutes(), hour.getSeconds());

    let sunPosition = SunCalc.getPosition(usedDate, 62, -7)

    let pos = {
      x: angle360(-sunPosition.azimuth * 180 / Math.PI - 180),
      y: sunPosition.altitude * 180 / Math.PI,
    }

    dataset.data.push(pos);

  }

  dataset.data.sort((a: ChartPoint, b: ChartPoint) => a.x - b.x);

  if (get(system).chart.chart == undefined) {return}
  get(system).chart.chart.update()

}

function showDatasets(newDatasets: ChartDataset[]) {
  system.update(o => {
    if (o.chart.chart == undefined) {return o}
    let currentDatasets = o.chart.chart.data.datasets

    // Check if new dataset is to be added:
    newDatasets.forEach(newValue => {

      let inArray = false
      currentDatasets.forEach(currentValue => {
        if (newValue == currentValue) {
          inArray = true;
        }
      })

      if (!inArray && newValue.label != "Sun") {
        console.log('hmm')
        currentDatasets.push(newValue)
      }

    })

    // Check if current dataset is to be removed:
    currentDatasets.forEach((currentValue, index) => {

      let inArray = false
      newDatasets.forEach(newValue => {
        if (newValue == currentValue) {
          inArray = true;
        }
      })

      if (!inArray && currentValue.label != "Sun") {
        console.log('woow')
        currentDatasets.splice(index, 1)
      }

    })

    o.chart.chart.update()

    return o
  })
  
}

function createDataset(label: string, color: string) {
  let dataset: ChartDataset = {
    label, 
    data: [],
    showLine: true,
    borderColor: color,
    backgroundColor: color,
    radius: 0,
  }

  return dataset
}

function hideSunDataset() {
  system.update(o => {
    if (o.chart.chart == undefined) {return o}

    let chart = o.chart.chart;
    let dataset = o.chart.sun.dataset;

    chart.data.datasets.forEach((value, index) => {
      if (value == dataset) {
        chart.data.datasets.splice(index, 1)
      }
    })

    chart.update()
    o.chart.sun.show = false;
    return o
  })

}

function showSunDataset() {
  system.update(o => {
    if (o.chart.chart == undefined) {return o}

    let chart = o.chart.chart;
    let dataset = o.chart.sun.dataset;

    let sunIsShown = false;
    chart.data.datasets.forEach((value, index) => {
      if (value == dataset) {
        sunIsShown = true;
      }
    })

    if (!sunIsShown) {
      chart.data.datasets.push(dataset)
    }

    chart.update()
    o.chart.sun.show = true;
    return o

  })
}

function changeChartColor(dataset: ChartDataset, color: string) {
  system.update(o => {
    if (o.chart.chart == undefined) {return o}

    let chart = o.chart.chart;

    dataset.borderColor = color;
    dataset.backgroundColor = color;

    chart.update();
    
    return o

  })
}

// The object containing the functions:
export let chartF = {
  showSunDataset,
  hideSunDataset,
  updateSunDataset,
  createDataset,
  changeChartColor,
  showDatasets,
  updateDataset,
  updateChartType
}