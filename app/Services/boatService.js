/**
 * Created by Tim on 23/07/2014.
 */
angular.module('oreflow')
    .service('boatService', [ 'commonService', 'objService', function ( commonService, objService) {


        var windAngle = -90;

        var boatModel;
        var boomModel;
        var sailModel = {};
        var boomLength = 4;
        var boomAngle = 0;
        var boomModelAngle = 2; // bommen lutar bakåt 2 grader
        var boatHeel = 0;
        var currentBoatHeel = 0;
        var currentBoomAngle = 0;


        var lastUpdate = 0;
        var updatePosition = function () {
            var timeNow = new Date().getTime();
            var elapsed = timeNow - lastUpdate;
            if(elapsed > 2 * 1000) {
                lastUpdate = new Date().getTime();
                return;
            }

            if (lastUpdate != 0) {
                if (!boatModel) {
                    boatModel = objService.getModel('express');
                }
                if (!boomModel) {
                    boomModel = objService.getModel('boom');
                }
                if (!sailModel.port) {
                    sailModel.port = objService.getModel('curved_port_sail');
                }
                if (!sailModel.starboard) {
                    sailModel.starboard = objService.getModel('curved_starboard_sail');
                }
                if (!sailModel.plain) {
                    sailModel.plain = objService.getModel('plain_sail');
                }
                if (!boatModel || !boomModel) {
                    console.log('returning since model was missing')
                    return;
                }


                if (sailModel.port && sailModel.starboard && sailModel.plain) {
                    sailModel.port.draw = false;
                    sailModel.starboard.draw = false;
                    sailModel.plain.draw = false;

                    switch (true) {
                        case (boomAngle < 0):
                            sailModel.port.draw = true;
                            break;
                        case (boomAngle == 0):
                            sailModel.plain.draw = true;
                            break;
                        case (boomAngle > 0):
                            sailModel.starboard.draw = true;
                            break;
                    }

                }


                /*
                 Kod för ifall separat modell används för bommen, där bommens modell är centrerad vid (0,0,0)
                 boomModel.translation.y = boatModel.translation.y;

                 var dx = -Math.cos(commonService.angles.degToRad(boomAngle)) * boomLength / 2;

                 var dz = 0 + Math.sin(commonService.angles.degToRad(boomAngle)) * boomLength / 2;

                 boomModel.translation.x = boatModel.translation.x;
                 boomModel.translation.x += dx * Math.cos(commonService.angles.degToRad(boatModel.rotation.y)) + dz * Math.sin(commonService.angles.degToRad(boatModel.rotation.y));
                 boomModel.translation.z = boatModel.translation.z;
                 boomModel.translation.z += -dx * Math.sin(commonService.angles.degToRad(boatModel.rotation.y)) + dz * Math.cos(commonService.angles.degToRad(boatModel.rotation.y));
                 */


                var direction = boatModel.rotation.y;
                var windBoatAngle = (direction - windAngle) % 360;

                switch (true) {
                    case windBoatAngle < 45:
                        if(boomAngle > 0) {
                            setBoomAngle(90);
                            setBoatHeel(5);
                        } else {
                            setBoatHeel(0);
                        }
                        break;
                    case windBoatAngle < 90:
                        setBoomAngle(45);
                        setBoatHeel(10);
                        break;
                    case windBoatAngle < 135:
                        setBoomAngle(20);
                        setBoatHeel(30);
                        break;
                    case windBoatAngle < 180:
                        setBoomAngle(20);
                        setBoatHeel(20);
                        break;
                    case windBoatAngle < 225:
                        setBoomAngle(-20);
                        setBoatHeel(-20);
                        break;
                    case windBoatAngle < 270:
                        setBoomAngle(-45);
                        setBoatHeel(-30);
                        break;
                    case windBoatAngle < 315:
                        setBoomAngle(-90);
                        setBoatHeel(-10);
                        break;
                    case windBoatAngle < 360:
                        if(boomAngle < 0) {
                            setBoomAngle(-90);
                            setBoatHeel(-5);
                        } else {
                            setBoatHeel(0);
                        }
                        break;
                }


                var dbh = boatHeel - currentBoatHeel;
                currentBoatHeel += dbh * elapsed / 1000.0;

                var dba = boomAngle - currentBoomAngle;
                currentBoomAngle += dba * elapsed / 1000.0;


                boatModel.rotation.x = currentBoatHeel * Math.cos(commonService.angles.degToRad(direction));
                boatModel.rotation.z = -currentBoatHeel * Math.sin(commonService.angles.degToRad(direction));

                boomModel.rotation.x = boatModel.rotation.x;
                boomModel.rotation.z = boatModel.rotation.z;
                boomModel.rotation.y = boatModel.rotation.y + currentBoomAngle;


                if (sailModel.port) {
                    sailModel.port.rotation.x = boomModel.rotation.x;
                    sailModel.port.rotation.z = boomModel.rotation.z;
                    sailModel.port.rotation.y = boomModel.rotation.y;
                    sailModel.port.translation.x = boatModel.translation.x;
                    sailModel.port.translation.z = boatModel.translation.z;
                    sailModel.port.translation.y = boatModel.translation.y;
                }
                if (sailModel.starboard) {
                    sailModel.starboard.rotation.x = boomModel.rotation.x;
                    sailModel.starboard.rotation.z = boomModel.rotation.z;
                    sailModel.starboard.rotation.y = boomModel.rotation.y;
                    sailModel.starboard.translation.x = boatModel.translation.x;
                    sailModel.starboard.translation.z = boatModel.translation.z;
                    sailModel.starboard.translation.y = boatModel.translation.y;
                }
                if (sailModel.plain) {
                    sailModel.plain.rotation.x = boomModel.rotation.x;
                    sailModel.plain.rotation.z = boomModel.rotation.z;
                    sailModel.plain.rotation.y = boomModel.rotation.y;
                    sailModel.plain.translation.x = boatModel.translation.x;
                    sailModel.plain.translation.z = boatModel.translation.z;
                    sailModel.plain.translation.y = boatModel.translation.y;
                }
            }
            lastUpdate = timeNow;
        };

        var setBoomAngle = function (angle) {
            // tillåter bara vinklar mellan -90º och 90º
            if(Math.cos(commonService.angles.degToRad(angle))< 0) {
                return;
            }
            boomAngle = angle;
        };

        var setBoatHeel = function (angle) {
            // tillåter bara vinklar mellan -90º och 90º
            if(Math.cos(commonService.angles.degToRad(angle))< 0) {
                return;
            }
            boatHeel = angle;
        };

        var getCoordinates = function () {
            if(!boatModel) {
                boatModel = objService.getModel('express');
            }
            if(!boomModel) {
                boomModel = objService.getModel('boom');
            }
            if(!boatModel || !boomModel) {
                console.log('returning since model was missing')
                return;
            }
            return {
                front: {
                    x: boomModel.translation.x + Math.sin(commonService.angles.degToRad(boomAngle)) * boomLength/2,
                    z: boomModel.translation.z + Math.cos(commonService.angles.degToRad(boomAngle)) * boomLength/2,
                    y: boomModel.translation.y + Math.sin(commonService.angles.degToRad(boomModelAngle)) * boomLength/2
                },
                back: {
                    x: boomModel.translation.x - Math.sin(commonService.angles.degToRad(boomAngle)) * boomLength/2,
                    z: boomModel.translation.z - Math.cos(commonService.angles.degToRad(boomAngle)) * boomLength/2,
                    y: boomModel.translation.y - Math.sin(commonService.angles.degToRad(boomModelAngle)) * boomLength/2
                }
            }
        }

        return {
            updatePosition: updatePosition,
            setBoomAngle: setBoomAngle,
            getCoordinates: getCoordinates,
            setBoatHeel: setBoatHeel
        };

    }]);