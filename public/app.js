(function() {
    var apiUrl = 'http://192.168.1.123:8080/buildStatus'; //./json/dummy.json
    var apiUrl = './json/dummy.json'; //./json/dummy.json

    var successCompo = Vue.extend({
        template : "#success-template",
        data : {
            msg : null
        },
        created : function() {
            this.msg = "Build Cop standby...";
        }
    })

    var failedCompo = Vue.extend({
        template : "#failed-template",
        props : [ 'counterClock', 'photoSize', 'counterId', 'userName',
                'imgUrl', 'soundUrl' ],
        data : {
            about : null,
            message : null,
        },
        created : function() {
            var msg = '';
            msg = "Warning!";
            for (var i = 0; i < 20; ++i) {
                msg += " Warning!";
            }
            this.message = msg;
            this.about = "Build broken!!!";
            this.$data.photoSize = 200;
        },
        ready : function() {
            var foo = 0;
            var inter = 40;
            var zoom = 0;
            var grand = this;
            var id = setInterval(function() {
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

                if (foo - zoom > 1000 && grand.photoSize <= 600) {
                    grand.scalePhotoSize(1.05);
                    zoom = foo;
                }
                grand.$data.counterClock = formated(day) + ":" + formated(hour)
                        + ":" + formated(min) + ":" + formated(sec) + ":"
                        + formated(msec);
            }, inter);
            this.setCounterId(id);
            return id;
        },
        beforeDestroy : function() {
            clearInterval(this.$data.counterId);
        },
        methods : {
            setData : function(name, imgUrl, soundUrl) {
                this.$data.userName = name;
                this.$data.imgUrl = imgUrl;
                this.$data.soundUrl = soundUrl;
            },
            setCount : function(count) {
                this.$data.counterClock = count;
            },
            scalePhotoSize : function(scale) {
                this.$data.photoSize *= scale;
            },
            setCounterId : function(id) {
                this.$data.counterId = id;
            },
            resetCounter : function() {
                clearInterval(this.$data.counterId);
            }
        },
    })

    var recoveredCompo = Vue.extend({
        template : "#recovered-template",
        props : [ 'userName', 'imgUrl', 'soundUrl' ],
        data : {
            msg : null,
            photoSize : null
        },
        created : function() {
            this.msg = "thanks!";
            this.photoSize = "450px";
        },
        methods : {
            setData : function(name, imgUrl, soundUrl) {
                this.$data.userName = name;
                this.$data.imgUrl = imgUrl;
                this.$data.soundUrl = soundUrl;
            },
        },
    })

    var vm = new Vue({
        el : '#app',
        data : {
            currentView : 'success-component'
        },
        components : {
            'failed-component' : failedCompo,
            'success-component' : successCompo,
            'recovered-component' : recoveredCompo,
        }
    });

    function formated(num) {
        return ("00" + num).substr(-2);
    }

    setInterval(function() {
        $.getJSON(apiUrl, {
            ts : new Date().getTime()
        }).done(
                function(json) {
                    var status = json.status;
                    if (status == "failed") {
                        vm.currentView = 'failed-component';
                        // TODO: Is there other method?
                        vm.$children[0].setData(json.detail.name,
                                json.detail.photo, json.detail.sound);
                    } else if (status == "success") {
                        vm.currentView = 'success-component';
                    } else if (status == "recovered") {
                        vm.currentView = 'recovered-component';
                        vm.$children[0].setData(json.detail.name,
                                json.detail.photo, json.detail.sound);
                    } else {
                        vm.currentView = 'success-component';
                    }
                })
    }, 2000);
})();
