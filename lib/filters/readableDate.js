const { DateTime } = require('luxon');

module.exports = (date) => {
  return DateTime.fromJSDate(date, { zone: 'Asia/Tokyo' }).toLocaleString(DateTime.DATE_FULL);//.toFormat('yyyy-MM-dd');
};
