/**
 * Created by Tim on 23/07/2014.
 */
angular.module('oreflow')
    .service('boomService', [ 'commonService', 'modelService', function ( commonService, modelService) {
        var boatModel;
        var boomModel;
        var sailModel = {};
        var boomLength = 4;
        var boomAngle = 0;
        var boomModelAngle = 2; // bommen lutar bakåt 2 grader

        var updatePosition = function () {
            if(!boatModel) {
                boatModel = modelService.getModel('express');
            }
            if(!boomModel) {
                boomModel = modelService.getModel('boom');
            }
            if(!sailModel.port) {
                sailModel.port = modelService.getModel('curved_port_sail');
            }
            if(!sailModel.starboard) {
                sailModel.starboard = modelService.getModel('curved_starboard_sail');
            }
            if(!sailModel.plain) {
                sailModel.plain = modelService.getModel('plain_sail');
            }
            if(!boatModel || !boomModel) {
                console.log('returning since model was missing')
                return;
            }



            if(sailModel.port && sailModel.starboard && sailModel.plain) {
                sailModel.port.draw = false;
                sailModel.starboard.draw = false;
                sailModel.plain.draw = false;

                switch(true) {
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


            boomModel.rotation.x = boatModel.rotation.x ;
            boomModel.rotation.z = boatModel.rotation.z ;
            boomModel.rotation.y = boatModel.rotation.y + boomAngle ;


            boomModel.translation.y = boatModel.translation.y;

            var dx = -Math.cos(commonService.angles.degToRad(boomAngle)) * boomLength / 2;

            var dz = 0 + Math.sin(commonService.angles.degToRad(boomAngle)) * boomLength / 2;

            boomModel.translation.x = boatModel.translation.x;
            boomModel.translation.x += dx * Math.cos(commonService.angles.degToRad(boatModel.rotation.y)) + dz * Math.sin(commonService.angles.degToRad(boatModel.rotation.y));
            boomModel.translation.z = boatModel.translation.z;
            boomModel.translation.z += -dx * Math.sin(commonService.angles.degToRad(boatModel.rotation.y)) + dz * Math.cos(commonService.angles.degToRad(boatModel.rotation.y));


            if(sailModel.port) {
                sailModel.port.rotation.x = boomModel.rotation.x ;
                sailModel.port.rotation.z = boomModel.rotation.z ;
                sailModel.port.rotation.y = boomModel.rotation.y;
                sailModel.port.translation.x = boatModel.translation.x;
                sailModel.port.translation.z = boatModel.translation.z;
                sailModel.port.translation.y = boatModel.translation.y;
            }
            if(sailModel.starboard) {
                sailModel.starboard.rotation.x = boomModel.rotation.x ;
                sailModel.starboard.rotation.z = boomModel.rotation.z ;
                sailModel.starboard.rotation.y = boomModel.rotation.y;
                sailModel.starboard.translation.x = boatModel.translation.x;
                sailModel.starboard.translation.z = boatModel.translation.z;
                sailModel.starboard.translation.y = boatModel.translation.y;
            }
            if(sailModel.plain) {
                sailModel.plain.rotation.x = boomModel.rotation.x ;
                sailModel.plain.rotation.z = boomModel.rotation.z ;
                sailModel.plain.rotation.y = boomModel.rotation.y;
                sailModel.plain.translation.x = boatModel.translation.x;
                sailModel.plain.translation.z = boatModel.translation.z;
                sailModel.plain.translation.y = boatModel.translation.y;
            }
        };

        var setBoomAngle = function (angle) {
            // tillåter bara vinklar mellan -90º och 90º
            if(Math.cos(commonService.angles.degToRad(angle))< 0) {
                return;
            }
            boomAngle = angle;
        };

        var getCoordinates = function () {
            if(!boatModel) {
                boatModel = modelService.getModel('express');
            }
            if(!boomModel) {
                boomModel = modelService.getModel('boom');
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
            getCoordinates: getCoordinates
        };

    }]);