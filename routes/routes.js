/*
  purpose: Routes with jwt integrated
  author: saurabh
  date : ***
*/
var router = require('express').Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var middleware = require('../middleware/validator.js');
var dashboardController = require("../controller/dashboardController.js");
var videoDropIn = require('../controller/videoDropInController.js');
var hubController = require('../controller/hubController.js');
var userInfo = require('../controller/userInfoController.js');
var logout = require('../controller/logoutController.js');
var versionController = require('../controller/versionController');

// dashboard route
router.post('/services/weather', function (req, res) {
    dashboardController.getWeatherDetails(req, res);
});

router.post('/services/todo', function (req, res) {
    dashboardController.addTodo(req, res)
});
router.get('/services/todo', function (req, res) {
    dashboardController.getTodos(req, res);
});
router.delete('/services/scheduler/:id', function (req, res) {
    dashboardController.delSchedule(req, res)
});
router.delete('/services/scheduler', function (req, res) {
    dashboardController.deleteAllSchedule(req, res)
})
// dashboard routes end

//video call & drop in routes
router.post('/video_call/:id/join', videoDropIn.startVideoCall);

router.put('/video_call/:id/join', videoDropIn.acceptVideoCall);

router.delete('/video_call/:id/join', videoDropIn.stopVideoCall);
//drop in 
router.get('/livefeed/shared', videoDropIn.getSharedDevices)

router.get('/livefeed/token', videoDropIn.getLiveFeedToken);

router.post('/livefeed/token', videoDropIn.postLiveFeedToken);
router.post('/livefeed/:hub_id', videoDropIn.startDropIn);
//end
//adding contacts in bulk
router.post('/bulkContact', userInfo.addBulkContact);

// search youtube
router.get('/ytSearch', youtubeController.searchYoutube);
//adapter routes
router.get('/adapter', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        gmail.connected(req, res).then(function (obj, err) {
            var data = adapterRegistry.getAdapterList()
            data.data[2].connected = obj.connected
            res.status(200).json({ success: true, message: 'executed successfully.', data: data });
        })
		} catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})
/* getting adapter details based on id */
router.get('/adapter/:adapterId', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, message: 'executed successfully.', 'data': adapterRegistry.getAdapter(req.params.adapterId) })
    } catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})
/* getting adapter details based on id */
router.post('/adapter/:adapterId/trigger/:triggerId/validate', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, message: 'executed successfully.', 'data': adapterRegistry.validateTrigger(req.params.adapterId, req.params.triggerId, req.body) })
    } catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})
/* validating the adapter trigger and action */
router.post('/adapter/:adapterId/action/:actionId/validate', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, message: 'executed successfully.', 'data': adapterRegistry.validateAction(req.params.adapterId, req.params.actionId, req.body) })
    } catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})
//end

//iflow routes
router.post('/iflow', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        var p = scenario.createScenario(req, res).then(function (data) {
           res.status(200).json({ success: true, message: 'executed successfully.', data: data })
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})
/* getting all the iflows list */
router.get('/iflow', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        var p = scenario.getScenario(req).then(function (data) {
           res.status(200).json({ success: true, message: 'executed successfully.', data: data })
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Unknown");
    }
})

//end
module.exports = router;