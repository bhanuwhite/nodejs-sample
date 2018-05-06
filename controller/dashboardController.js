/*
  purpose: exporting dashboard controller function 
  author: saurabh
  date : ***
*/
 var Jimp = require("jimp");
var request = require('request');
var todoModel = require("../model/todoModel.js");
var reminderModel = require("../model/reminderModel.js");
var alarmModel = require("../model/alarmModel.js");
var schedulerModel = require("../model/schedulerModel.js");

/* get current day weather details */
exports.getWeatherDetails = function (req, res) {

    if (req.body.date) {
        var todaysFullDate = new Date();
        var date = todaysFullDate.getDate();
        console.log('diff: ',req.body.date.split('-')[2] - date);
        if (req.body.date.split('-')[2]-date >= 0 && req.body.date.split('-')[2]-date < 5) {
            if (req.body.city) {
                getWeatherForecast(req.body.city, null, null, req.body.date)
                    .then(function (result) {
                        res.status(200).json({
                            success: true,
                            message: 'Weather fetched.',
                            data: result
                        });
                    })
                    .catch(function (error) {
                        res.status(400).json({
                            success: false,
                            message: 'Error while fetching weather',
                            error: error
                        });
                    });
            } else if (req.body.lat && req.body.long) {
                getWeatherForecast(null, req.body.lat, req.body.long, req.body.date)
                    .then(function (result) {
                        console.log('result: ', result);
                        res.status(200).json({
                            success: true,
                            message: 'Weather fetched.',
                            data: result
                        });
                    })
                    .catch(function (error) {
                        res.status(400).json({
                            success: false,
                            message: 'Error while fetching weather',
                            error: error
                        });
                    });
            } else {
                res.status(422).json({
                    "success": false,
                    "message": "validation Errors",
                    "errors": [
                        {
                            "location": "body",
                            "param": "city/lat&long",
                            "msg": "city/lat&long is required."
                        }
                    ]
                });
            }
        } else {
            if (req.body.date.split('-')[2]-date < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Error while getting weather.',
                    error: 'Cannot show weather for past days.'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Error while getting weather.',
                    error: 'Can only show weather for the next 5 days.'
                });
            }
        }
    } else {
        if (req.body.city) {
            getCurrentWeather(req.body.city, null, null)
                .then(function (result) {
                    res.status(200).json({
                        success: true,
                        message: 'Weather fetched.',
                        data: result
                    });
                })
                .catch(function (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Error while fetching weather.',
                        error: error.errors
                    });
                });
        } else if (req.body.lat && req.body.long) {
            getCurrentWeather(null, req.body.lat, req.body.long)
                .then(function (result) {
                    res.status(200).json({
                        success: true,
                        message: 'Weather fetched.',
                        data: result
                    });
                })
                .catch(function (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Error while fetching weather.',
                        error: error
                    });
                });
        } else {
            res.status(422).json({
                "success": false,
                "message": "validation Errors",
                "errors": [
                    {
                        "location": "body",
                        "param": "city/lat&long",
                        "msg": "city/lat&long is required."
                    }
                ]
            });
        }
    }
}
;

/* get weather forecast by openweathermap */
function getWeatherForecast(city, lat, long, date) {
    var weatherObj = {};
    if (!city) {
        return new Promise(function (resolve, reject) {
            var options = {
                "uri": 'http://xxxx/data/2.5/forecast?units=Imperial&lat=' + lat + '&lon=' + long + '&APPID=1a1ca5ss1f1e230&mode=json',
                "method": "GET"
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    body = JSON.parse(body);
                    var list = body.list;
                    return new Promise(function (resolve, reject) {
                        console.log('in promise 1');
                        for (var i = 0; i < list.length; i++) {
                            var tempDate = new Date(list[i].dt_txt);
                            var modifiedDate = tempDate.getFullYear() + '-' + '0' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
                            if ((date === modifiedDate) && (tempDate.getHours() === 12)) {
                                weatherObj.date = date;
                                weatherObj.humidity = list[i].main.humidity;
                                weatherObj.city = body.city.name;
                                weatherObj.temperature = list[i].main.temp;
                                weatherObj.description = list[i].weather[0].description;
                                weatherObj.windSpeed = list[i].wind.speed;
                                weatherObj.windDegree = list[i].wind.deg;
                                weatherObj.icon = list[i].weather[0].icon;
                                weatherObj.backgroundImage = '';
                            }
                            if (i === list.length - 1)
                                resolve(weatherObj);
                        }
                    }).then(function (value) {
                        //console.log('in then', value);
                        return resolve(value);
                    }).catch(function (reason) {
                        return reject(reason);
                    });
                } else {
                    return reject('Error while fetching weather.');
                }
            });
        })

    } else {
        return new Promise(function (resolve, reject) {
            var options = {
                "uri": 'http://xxxdata/2.5/forecast?units=Imperial&q=' + city + '&APPID=1xe230&mode=json',
                "method": "GET"
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log('No error in weather response');
                    body = JSON.parse(body);
                    var list = body.list;
                    return new Promise(function (resolve, reject) {
                        for (var i = 0; i < list.length; i++) {
                            var tempDate = new Date(list[i].dt_txt);
                            var modifiedDate = tempDate.getFullYear() + '-' + '0' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
                            if ((date === modifiedDate) && (tempDate.getHours() === 12)) {
                                weatherObj.date = date;
                                weatherObj.humidity = list[i].main.humidity;
                                weatherObj.city = city;
                                weatherObj.temperature = list[i].main.temp;
                                weatherObj.description = list[i].weather[0].description;
                                weatherObj.windSpeed = list[i].wind.speed;
                                weatherObj.windDegree = list[i].wind.deg;
                                weatherObj.icon = list[i].weather[0].icon;
                                weatherObj.backgroundImage = '';
                            }
                            if (i === list.length - 1)
                                resolve(weatherObj);
                        }
                    }).then(function (value) {
                        return resolve(value);

                        /* return {
                             success: true,
                             data: value
                         };*/
                    }).catch(function (reason) {
                        return {
                            success: false,
                            error: reason
                        };
                    });
                } else {
                    return {
                        success: false,
                        error: error
                    };
                }
            });
        })

    }

}

/* Update function for todos list  */
exports.updateTodoInList = function (req, res) {
    if (req.params.id && req.params.tId && req.body.todo) {
        todoModel.find({_id: req.params.id, 'todos.todos_id': req.params.tId}, function (err, obj) {
            if (err)
                res.status(400).json({
                    success: false,
                    message: 'Error while updating todo in list',
                    error: err.errors
                });
            else {
                console.log('I\'m here0');
                console.log('Obj - ' + obj);
                if (obj.length === 0)
                    res.status(400).json({
                        success: false,
                        message: 'No such todo exists'
                    });
                else {
                    console.log('I\'m here1');
                    var newObj = {};
                    for (var i in req.body.todo) {
                        newObj['todos.$.' + i] = req.body.todo[i];
                    }
                    obj['todo.$.todos_id'] = req.params.tId;

                    todoModel.findOneAndUpdate({
                        _id: req.params.id,
                        'todos.todos_id': req.params.tId
                    }, {$set: newObj}, {new: true})
                        .then(function (obj) {
                            res.status(200).json({
                                success: true,
                                message: 'Todo updated successfully',
                                data: obj
                            });
                        })
                        .catch(function (reason) {
                            res.status(400).json({
                                success: false,
                                message: 'Error while updating todo in list',
                                error: reason
                            });
                        });
                }
            }
        })
    } else {
        if (!req.params.id)
            res.status(422).json({
                "success": false,
                "message": "validation Errors",
                "errors": [
                    {
                        "location": "params",
                        "param": "id",
                        "msg": "id is required."
                    }
                ]
            });
        else if (!req.params.tId) {
            res.status(422).json({
                "success": false,
                "message": "validation Errors",
                "errors": [
                    {
                        "location": "params",
                        "param": "tId",
                        "msg": "todos_id is required."
                    }
                ]
            });
        } else {
            res.status(422).json({
                "success": false,
                "message": "validation Errors",
                "errors": [
                    {
                        "location": "body",
                        "param": "todo",
                        "msg": "todo object is required."
                    }
                ]
            });
        }


    }
}

/* deleting the todos from the list */
exports.deleteTodoFromList = function (req, res) {
    if (req.params.id && req.params.tId) {
        todoModel.update({_id: req.params.id}, {$pull: {todos: {todos_id: req.params.tId}}}, function (err, obj) {
            if (err)
                res.status(400).json({
                    success: false,
                    message: 'Error while deleting specific todo from list',
                    error: err.errors
                });
            else {
                todoModel.find({_id: req.params.id}, function (err, data) {
                    if (err)
                        res.status(400).json({
                            success: false,
                            message: 'Error while deleting specific todo from list',
                            error: err.errors
                        });
                    else {
                        res.status(200).json({
                            success: true,
                            message: 'Todo deleted successfully',
                            data: data[0]
                        })
                    }
                });

            }
        })
    } else {
        if (!req.params.id) {
            res.status(422).json({success: false, message: 'Todo id in parameter is missing.'});
        } else {
            res.status(422).json({success: false, message: 'todos_id in parameter is missing.'});
        }
    }
}


/* deleting all the todos created */
exports.deleteAllTodos = function (req, res) {
    if (req.userId) {
        todoModel.deleteMany({user_id: req.userId}, function (err, obj) {
            if (err) res.status(400).json({success: false, 'message': 'an error occured while deleting'});
            else {
                res.status(200).json({success: true, 'message': 'All todos are deleted successfully.', data: []})
            }
        })
    } else {
        res.status(200).json({success: false, 'message': 'userID is invalid'})
    }
}

/* Updating alarm based on token */
exports.updateAlarm = function (req, res) {
    if (req.params.id) {
        alarmModel.findOne({_id: req.params.id}).exec(function (err, obj) {
            if (err) {
                res.status(400).send("error" + err.message);
            } else {
                alarmModel.update({_id: req.params.id}, {
                    $set: {
                        active: req.body.state, date_time: req.body.date_time,  updated_at: Date.now()
                    }
                }, function (err, obj) {
                    if (err) res.send(400).json(err.errors)
                    else {
                        alarmModel.find({user_id: req.userId}).exec(function (err, obj) {
                            if (err) {
                                res.status(400).send("error" + err.message);
                            } else {
                                if (obj) {
                                    res.status(200).json({
                                        success: true,
                                        message: 'updated successfully.',
                                        data: obj
                                    });
                                } else {
                                    res.status(200).json({
                                        success: true,
                                        message: 'updated successfully.',
                                        data: []
                                    });
                                }
                            }
                        });
                    }
                })
            }
        });
    } else {
        res.status(422).json({success: false, message: 'alarm id is missing in parameter.'})
    }
};