const { DateTime } = require('luxon');

module.exports = (date) => {
  return DateTime.fromJSDate(date, { zone: 'jst' }).toFormat('yyyy-mm-dd');
};
