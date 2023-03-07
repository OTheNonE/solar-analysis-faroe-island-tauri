import type { Pos } from "../Stores";

export function angle360(v: number) {
  while (v < 0 || v >= 360) {
    if (v < 0) {
      v += 360;
    } else if (v >= 360) {
      v -= 360;
    }
  }
  return v
}

export function removeDecimals(value: number, decimals: number) {
  return Math.trunc(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function removeObjectFromArray(array, object) {
  
  array.forEach((value, index) => {
    if (object === value) {
      array.splice(index, 1)
      return
    }
  })

  return array
}

export function isBetween(start: number, mid: number, end: number) {
  return (start < mid && mid < end)
}

export function getIntersection(p1: Pos, p2: Pos, p3: Pos, p4: Pos): {x: number, y: number, den: number} {

  // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection

  // The denominator tells about which lines has a higher slope than the other.
  let den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

  if (den == 0) {
    console.log("The lines are parallel or coincident!")
  }

  let a = (p1.x * p2.y - p1.y * p2.x)
  let b = (p3.x * p4.y - p3.y * p4.x)

  let p_x = (a * (p3.x - p4.x) - (p1.x - p2.x) * b) / den
  let p_y = (a * (p3.y - p4.y) - (p1.y - p2.y) * b) / den

  return { x: p_x, y: p_y, den: den }
}

export function waitForElm(selector) {
  return new Promise(resolve => {

    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export interface StandardUnit {
  name: string,
  value: number,
}

export enum UnitTime {
  MILLIS = 1 * 365 * 24 * 60 * 60 * 1000,
  SECONDS = 1 * 365 * 24 * 60 * 60,
  MINUTE = 1 * 365 * 24 * 60,
  HOUR = 1 * 365 * 24,
  DAY = 1 * 365,
  WEEK = 365 / 7,
  MMVS = 365 / 12,
  YEAR = 1
}