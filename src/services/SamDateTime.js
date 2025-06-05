import dayjs from 'dayjs';

var SamDateTime = {
  setup: {
    realDateTime: function (given_time) {
      if (!given_time) {
        given_time = new Date();
      }
      given_time = new Date('' + given_time);
      return given_time;
    },
    prependZero: function (num) {
      let res = num;
      if (num < 10) {
        res = '0' + res;
      }
      return res;
    },
    timeObjectToString: function (given_time, format = '') {
      let received_time = {};
      for (let item in given_time) {
        received_time[item] = given_time[item];
      }
      if (format == 'computer' && received_time.ampm) {
        if (received_time.ampm.toLowerCase() == 'pm') {
          if (received_time.hours != 12) {
            received_time.hours += 12;
          }
        }
        received_time.ampm = '';
      }
      let res = SamDateTime.setup.prependZero(received_time.hours);
      res += ':' + SamDateTime.setup.prependZero(received_time.minutes);
      res += ':' + SamDateTime.setup.prependZero(received_time.seconds || 0);
      res += received_time.ampm ? ' ' + received_time.ampm : '';
      return res;
    },
    checkValidTime: function (timeString) {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(?:a\.m\.|p\.m\.)$/;
      if (timeRegex.test(timeString)) {
        return 1;
      } else {
        return 0;
      }
    },
    getDayCategory: function (dateTime) {
      const currentDate = new Date();
      const inputDate = new Date(dateTime);

      // Check if the input date is today
      if (
        inputDate.getDate() === currentDate.getDate() &&
        inputDate.getMonth() === currentDate.getMonth() &&
        inputDate.getFullYear() === currentDate.getFullYear()
      ) {
        return 'Today';
      }

      // Create a date object for tomorrow
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);

      // Check if the input date is tomorrow
      if (
        inputDate.getDate() === tomorrow.getDate() &&
        inputDate.getMonth() === tomorrow.getMonth() &&
        inputDate.getFullYear() === tomorrow.getFullYear()
      ) {
        return 'Tomorrow';
      }
      // If it's not today or tomorrow, it's another day
      return 'other';
    },
    getWeekDay: function (date) {
      let days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      return days[date.getDay()];
    },
    getFullMonth: function (date = new Date()) {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return months[date.getMonth()];
    },
    getShortMonth: function (date = new Date()) {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months[date.getMonth()];
    },
    getDayOfWeek: function (date = new Date()) {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return days[date.getDay()];
    },
  },
  mergeDateTime: function (given_date, given_time) {
    given_date = SamDateTime.formattedDate(new Date(given_date), 'computer');
    let res_time = '';
    if (new Date(given_time) != 'Invalid Date') {
      res_time = SamDateTime.formattedTime(new Date(given_time), 0);
    }
    if (given_time && (given_time.hours || given_time.hours == '0')) {
      res_time = SamDateTime.setup.timeObjectToString(given_time, 'computer');
    }
    let str_dt = '' + given_date + ' ' + res_time;
    res = new Date(str_dt);
    return res;
  },
  addInterval: function (
    seconds_to_add,
    interval_type = 'second',
    received = null,
  ) {
    seconds_to_add *= 1000;
    received = SamDateTime.setup.realDateTime(received);
    let received_time = new Date(received).getTime();
    if (interval_type == 'minute') {
      seconds_to_add *= 60;
    }
    if (interval_type == 'hour') {
      seconds_to_add *= 60 * 60;
    }
    if (interval_type == 'day') {
      seconds_to_add *= 60 * 60 * 24;
    }
    let result = received_time + seconds_to_add;
    result = new Date(result);
    return result;
  },

  makeTimeObject: function (temp_time, am_pm = '') {
    if (typeof temp_time == 'string') {
      let arr = temp_time.split(' ');
      let time_res = {};
      if (arr.length > 1 && arr[1]) {
        time_res.ampm = arr[1] == 'am' || arr[1] == 'pm' ? arr[1] : '';
      }
      arr = arr[0].split(':');
      time_res.hours = parseInt(arr[0]);
      time_res.minutes = parseInt(arr[1]);
      if (arr.length > 2) {
        time_res.seconds = parseInt(arr[2]);
      }
      return time_res;
    }
    let time_obj = {
      hours: temp_time.getHours(),
      minutes: temp_time.getMinutes(),
      seconds: temp_time.getSeconds(),
    };
    if (am_pm) {
      if (time_obj.hours >= 12) {
        time_obj.hours -= 12;
        am_pm = 'pm';
      } else {
        am_pm = 'am';
        if (temp_time.hours == 0) {
          time_obj.hours = 12;
        }
      }
      time_obj.ampm = am_pm;
    }
    return time_obj;
  },
  makeDateObject: function (given_date) {
    given_date = SamDateTime.setup.realDateTime(given_date);
    let dt_obj = {
      year: given_date.getFullYear(),
      month: given_date.getMonth() + 1,
      date: given_date.getDate(),
    };
    return dt_obj;
  },
  makeTimeStpamp: function (dt) {
    dt = SamDateTime.setup.realDateTime(dt);
    return dt.getTime();
  },

  formattedDate: function (received_time, format) {
    if (!format) {
      format = 'human';
    }
    let given_time = SamDateTime.setup.realDateTime(received_time);
    let year = given_time.getFullYear();
    let month_date = given_time.getDate();

    if (format == 'human') {
      let day_name = SamDateTime.setup.getDayOfWeek(given_time);
      let month = SamDateTime.setup.getFullMonth(given_time);
      let res = day_name + ' ' + month + ' ' + month_date + ', ' + year;
      return res;
    }
    if (format == 'computer') {
      let md = SamDateTime.setup.prependZero(month_date);
      let month = SamDateTime.setup.prependZero(given_time.getMonth() + 1);
      let res = year + '-' + month + '-' + md;
      return res;
    }
    if (format == 'alarm') {
      let date_ctegory = SamDateTime.setup.getDayCategory(given_time);
      let day_name = 'Today';
      if (date_ctegory != 'other') {
        day_name = date_ctegory;
      } else {
        day_name = SamDateTime.setup.getDayOfWeek(given_time) + ' ';
        let month = SamDateTime.setup.getFullMonth(given_time);
        if (year != new Date().getFullYear) {
          year = ', ' + year;
        } else {
          year = '';
        }
        let res = month_date + ' ' + month;
        return res;
      }
      let res = day_name;
      return res;
    }
  },
  formattedTime: function (given_time, format) {
    let dt_arr = [];
    let hours = 0;
    let is_not_date =
      given_time &&
      typeof given_time === 'object' &&
      '' + new Date(given_time) == 'Invalid Date';
    if (is_not_date && given_time.hours) {
      dt_arr = [
        SamDateTime.setup.prependZero('' + given_time.hours),
        SamDateTime.setup.prependZero('' + given_time.minutes),
        SamDateTime.setup.prependZero('' + given_time.seconds) || '00',
      ];
      let am_pm = '';
      if (given_time.ampm) {
        am_pm = ' ' + given_time.ampm.toLowerCase();
      }
      let res = dt_arr.join(':') + am_pm;

      return res;
    } else {
      given_time = SamDateTime.setup.realDateTime(given_time);
      hours = given_time.getHours();
      dt_arr = [
        SamDateTime.setup.prependZero(hours),
        SamDateTime.setup.prependZero(given_time.getMinutes()),
        SamDateTime.setup.prependZero(given_time.getSeconds()),
      ];
    }

    if (format != 'alarm') {
      dt_arr.slice(0, 2);
    }
    let am_pm = '';
    if (format != 'computer') {
      if (hours >= 12) {
        if (hours > 12) {
          hours -= 12;
        }
        am_pm = ' pm';
      } else {
        if (hours == 0) {
          hours = 12;
        }
        am_pm = ' am';
      }
      dt_arr[0] = SamDateTime.setup.prependZero(hours);
    }
    let res = dt_arr.join(':') + am_pm;
    return res;
  },
  formatViaLib: function (given_time, format = 'YYYY-MM-DD') {
    if (!given_time) given_time = Date.now();
    return dayjs(given_time).format(format);
  },
  formattedDateTime: function (given_time, format) {
    if (!format) {
      format = 'human';
    }
    given_time = SamDateTime.setup.realDateTime(given_time);
    let obtained_time = SamDateTime.formattedTime(given_time, format);
    let res =
      SamDateTime.formattedDate(given_time, format) + ' ' + obtained_time;
    return res;
  },
};
export default SamDateTime;
