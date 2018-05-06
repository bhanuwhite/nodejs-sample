/*
  purpose: Modelling data for alarm
  author: saurabh
  date : ***
*/
var dbService = require("../config/storage.js");
var mongoose = dbService.getMongooseDB();

var alarmSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true,'userid field is Required']
    },
    alarm_id:{
        type: String,
        required: true
    },
    date_time: {
        type: String,
        required: [true,'date_time field is Required']
    },
    timeZone: {
      type: String,
      required:[true,'timezone field is  required']
    },
    active: {
        type: Boolean,
        default: false,
        required: [true,'active field is Required']
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
});
var alarm = mongoose.model('alarm', alarmSchema);

module.exports = alarm;