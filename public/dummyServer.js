//for Demo purpose.
(function() {
    "use strict";

    var mocky = require('./lib/mocky');
    var dummyName = "Hey Jack";

    var jsonSuccess = {
        "status" : "success",
    };

    var jsonFailed = {
        "status" : "failed",
        "detail" : {
            "name" : dummyName,
            "photo" : "./media/Terror_User1.png",
            "sound" : "./sound/se/02_Gaki.mp3"
        }
    };

    var jsonRecovered = {
        "status" : "recovered",
        "detail" : {
            "name" : dummyName,
            "photo" : "./media/Happy_User1.png",
            "sound" : "./sound/se/01_hakushu.mp3"
        }
    };

    var jsonRtn = jsonSuccess;

    function changeStatus(dummy, callback) {
        jsonRtn = dummy;
        callback(null, {
            status : 200,
            body : JSON.stringify(dummy)
        });
    }

    mocky.createServer([ {
        url : /\/buildStatus\?ts=\d+/,
        method : 'get',
        res : function(req, res, callback) {
            callback(null, {
                status : 200,
                headers : {
                    'Access-Control-Allow-Origin' : '*'
                },
                body : JSON.stringify(jsonRtn)
            });
        }
    }, {
        url : '/buildStatus/failed',
        method : 'get',
        res : function(req, res, callback) {
            changeStatus(jsonFailed, callback);
        }
    }, {
        url : '/buildStatus/success',
        method : 'get',
        res : function(req, res, callback) {
            changeStatus(jsonSuccess, callback);
        }
    }, {
        url : '/buildStatus/recovered',
        method : 'get',
        res : function(req, res, callback) {
            changeStatus(jsonRecovered, callback);
        }
    } ]).listen(8081);
})();
