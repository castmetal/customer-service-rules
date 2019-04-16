const Moment = require('moment');
const { extendMoment } = require('moment-range');
const moment = extendMoment(Moment);

/**
 * Calculate an overlap based on segment times
 * 
 * @param {array} timeSegments - timeSegments
 * @return {boolean} true, false
 */
const overlapSegments = (timeSegments) => {
  let ret = false;
  let i = 0;
  while( !ret && i<timeSegments.length-1 ){
    let seg1 = timeSegments[i];
    let seg2 = timeSegments[i+1];
    let range1 = moment.range( moment(seg1[0], 'HH:mm'),  moment(seg1[1], 'HH:mm'));
    let range2 = moment.range( moment(seg2[0], 'HH:mm'),  moment(seg2[1], 'HH:mm'));
    if( range1.overlaps(range2) ){
      ret = true;
    }
    i++;
    
    return ret;
  }
}

/**
 * Calculate an overlap based on segment dates
 * 
 * @param {array} timeSegments - dateSegments
 * @return {boolean} true, false
 */
const overlapDates = (dateSegments) => {
  let ret = false;
  let i = 0;
  while( !ret && i<dateSegments.length-1 ){
    let seg1 = dateSegments[i];
    let seg2 = dateSegments[i+1];
    let range1 = moment.range( moment(seg1[0], 'DD-MM-YYYY HH:mm'),  moment(seg1[1], 'DD-MM-YYYY HH:mm'));
    let range2 = moment.range( moment(seg2[0], 'DD-MM-YYYY HH:mm'),  moment(seg2[1], 'DD-MM-YYYY HH:mm'));
    if( range1.overlaps(range2) ){
      ret = true;
    }
    i++;
    
    return ret;
  }
}

module.exports = {
  overlapSegments,
  overlapDates
}