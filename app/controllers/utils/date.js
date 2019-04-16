const Moment = require('moment');
const { extendMoment } = require('moment-range');
const moment = extendMoment(Moment);

let overlapSegments = (timeSegments) => {
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

module.exports = {
  overlapSegments
}