/*
  purpose: Socket connection service 
  author: saurabh
  date : ***
*/
var io = require('socket.io');
var jwt = require('jsonwebtoken');
var socketClientModel = require('../model/userClientSocket.js');
var hubSocketModel = require('../model/userHubSocket.js');
var socketConn;
var deviceNSP, clientNSP;


module.exports = {
  connectServer: connectServer,
  connectClientSocket: connectClientSocket,
  connectDeviceSocket: connectDeviceSocket,
  initVideoCall: initVideoCall,
  startStreamingVideoCall: startStreamingVideoCall,
  rejectVideoCall: rejectVideoCall,
  startDropIn: startDropIn,
  woohooCameraPan: woohooCameraPan
}


function connectServer(server) {
  socketConn = io.listen(server);
}

/* Connecting multiple device over socket */
function connectDeviceSocket() {
  deviceNSP = socketConn.of('/socket/device');
  deviceNSP.on('connection', function (deviceSocket) {
    var socketId = deviceSocket.id;
    /*hubSocket*/
    deviceNSP.to(deviceSocket.id).emit('test_ack', { message: 'working' });
    deviceSocket.on('setDetailsHub', function (data) {
      if (data) {
        jwt.verify(data.id, 'woohooappapisecret', function (err, decoded) {
          if (err) {
            return;
          } else {
            var userId;
            userId = decoded.userId;
            hubSocketModel.findOne({
              hub_id: data.hub_id
            }, function (err, obj) {
              if (!err) {
                if (obj == null) {
                  var socket = new hubSocketModel();
                  socket.user_id = userId;
                  socket.device_socket_id = socketId;
                  socket.hub_id = data.hub_id;
                  socket.is_connected = true;
                  socket.save(function (err, object) {
                    console.log('hub device id saved')
                  })
                } else {
                  hubSocketModel.update({
                    hub_id: data.hub_id
                  }, {
                      $set: {
                        device_socket_id: socketId,
                        user_id: userId,
                        is_connected: true
                      }
                    }, function (err, object) {
                      console.log('hub device id updated')
                    })
                }
              }
            })
          }
        });
      }
    })
    /* Calling the disconnect hubSocket */
    deviceSocket.on('disconnect', function () {
      hubSocketModel.update({
        device_socket_id: deviceSocket.id
      }, {
          $set: {
            is_connected: false,
            is_busy: false
          }
        }, function (err, object) {
          console.log('status updated');
        })
      console.log('somebody disconnected from device', deviceSocket.id);
    })
  });
}
/* Connecting multiple client device over socket */
function connectClientSocket() {
  clientNSP = socketConn.of('/socket/client');
  clientNSP.on('connection', function (clientSocket) {
    var socketId = clientSocket.id;
    clientSocket.on('setDetails', function (data) {
      if (data) {
        jwt.verify(data.id, 'woohooappapisecret', function (err, decoded) {
          if (err) {
            socketClientModel.remove({
              token: data.id
            }, function (err, object) {
              console.log('client deleted')
            })
            return;
          } else {
            var userId;
            userId = decoded.userId;
            socketClientModel.findOne({
              user_id: userId,
              id: data.id
            }, function (err, obj) {
              if (!err) {
                if (obj == null) {
                  var socket = new socketClientModel();
                  socket.user_id = userId;
                  socket.client_socket_id = socketId;
                  socket.token = data.id;
                  socket.is_connected = true;
                  socket.user_agent = data.user_agent;
                  socket.save(function (err, object) {
                    console.log('client id saved')
                  })
                } else {
                  socketClientModel.update({
                    user_id: userId,
                    id: data.id
                  }, {
                      $set: {
                        client_socket_id: socketId,
                        token: data.id,
                        is_connected: true
                      }
                    }, function (err, object) {
                      console.log('client id updated')
                    })
                }
              }
            })
          }
        });
      }
    })
    clientSocket.on('disconnect', function () {
      socketClientModel.deleteOne({
        client_socket_id: clientSocket.id
      }, function (err, object) {
          console.log('status updated')
        })
      console.log('somebody disconnected from client', clientSocket.id);
    })
  });
}
/* Initiating the twilio video call */
function initVideoCall(data) {
  return new Promise(function (resolve, reject) {
    var arr = [];
    var i = 0;
    hubSocketModel.find({
      user_id: data.receiver_id,
      is_connected: true
    }, function (err, hubs) {
      if (err) {
        resolve({
          code: 500
        });
      } else {
        next()
        function next() {
          const value = hubs[i++];
          if (!value) {
            resolve({
              code: 200
            })
          } else {
            // event sender
            deviceNSP.to(value.device_socket_id).emit('init_video_call', {
              data: {
                room_name: data.room_name,
                token: data.token,
                reject: {
                  end_point: '/video_call/' + data.id + '/join?source=' + value.hub_id,
                  method: 'DELETE'
                }
                // accept: {
                //   end_point: '/video_call/' + data.id + '/join?source=' + value.hub_id,
                //   method: 'PUT'
                // }
              }
            });
            next();
          }
        }
      }
    })
  })
};
/* Displaying the video stream over call through socket */
function startStreamingVideoCall(data) {
  return new Promise(function (resolve, reject) {
    socketClientModel.findOne({ user_id: data.sender_id, token: data.sender_token }, function (err, obj) {
      if (err) {
        return;
      } else {
        clientNSP.to(obj.client_socket_id).emit('start_video_streaming', { data: { id: data.receiver_id, status: 'active' } });
        hubSocketModel.find({
          user_id: data.receiver_id,
          is_connected: true
        }, function (err, hubs) {
          if (err) {
            resolve({
              code: 500
            });
          } else {
            var i = 0;
            next()
            function next() {
              const value1 = hubs[i++];
              if (!value1) {
                resolve({
                  code: 200
                })
              } else {
                // event sender
                if (value1.hub_id !== data.source) {
                  deviceNSP.to(value1.device_socket_id).emit('start_video_streaming', {
                    data: { id: data.receiver_id, status: 'ongoing_call' }
                  });
                }
                next();
              }
            }
          }
        })
      }
    })
  })


}