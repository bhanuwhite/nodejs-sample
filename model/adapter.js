/*
  purpose: model data for adapter
  author: saurabh
  date : ***
*/
adapter = {};

var email = require("./email.js");
var timer = require("./timer.js");
var gmail = require('./gmailIflow.js');
var weather = require('./weatherIflow.js')

var adapaterList = [
    email.getMeta(), timer.getMeta(), gmail.getMeta(), weather.getMeta()
];

var adapterMap = {};
adapterMap[email.getMeta().id] = email;
adapterMap[timer.getMeta().id] = timer;
adapterMap[gmail.getMeta().id] = gmail;
adapterMap[weather.getMeta().id] = weather;

adapter.getAdapterList = function() {
    return {
        "data": adapaterList
    }
}

adapter.getAdapter = function(id) {
    return {
        "data": adapterMap[id].getMeta()
    }
}

adapter.validateTrigger = function(adapterId, triggerId, body){
    adapterMap[adapterId].validateTrigger(triggerId, body);
}

adapter.validateAction = function(adapterId, actionId, body){
    adapterMap[adapterId].validateAction(actionId, body);
}

adapter.addTriggerInstance = function(userId, trigger){
    delete trigger.triggerInstanceId;
    return adapterMap[trigger.adapterId].addTriggerInstance(userId, trigger);
}

adapter.addActionInstance = function(userId, action){
    delete action.actionInstanceId;
    return adapterMap[action.adapterId].addActionInstance(userId, action);
}

adapter.getTriggerInstance = function(adapterId, triggerInstanceId){
    return adapterMap[adapterId].getTriggerInstance(triggerInstanceId);
}

adapter.getActionInstance = function(adapterId, actionInstanceId){
    return adapterMap[adapterId].getActionInstance(actionInstanceId);
}

adapter.activateTriggerInstance = function(scenarioId, adapterId, triggerInstanceId){
    return adapterMap[adapterId].activateTriggerInstance(scenarioId, triggerInstanceId);
}

adapter.executeActionInstance = function(scenarioId, adapterId, actionInstanceId , data){
    return adapterMap[adapterId].executeActionInstance(scenarioId, actionInstanceId, data);
}

module.exports = adapter;