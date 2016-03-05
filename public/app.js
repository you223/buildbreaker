var vm = new Vue({
    el : '#app',
    data : {
        about : "Build broken!!!",
        message : 'a',
        counterClock : 'hoge',
        photoSize : '200',
    },
    created : function() {
        var msg = '';
        msg = "Warning!";
        for (var i = 0; i < 20; ++i) {
            msg += " Warning!"
        }
        this.message = msg;
    }
});

function formated(num) {
    return ("00" + num).substr(-2);
}

var foo = 0;
var inter = 40;
var zoom = 0;
setInterval(function() {
    foo += inter;

    var hour = foo % (86400000);
    var day = (foo - hour) / (86400000);
    var min = hour % (3600000);
    hour -= min;
    hour /= (3600000);
    var sec = min % (60000);
    min -= sec;
    min /= (60000);
    var msec = sec % 1000;
    sec -= msec;
    sec /= 1000;
    msec /= 10;

    if (foo - zoom > 5000 && vm.photoSize <= 800) {
        vm.photoSize *= 1.05;
        zoom = foo;
    }
    vm.counterClock = formated(day) + ":" + formated(hour) + ":"
            + formated(min) + ":" + formated(sec) + ":" + formated(msec);
}, inter);

