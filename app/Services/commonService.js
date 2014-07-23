/**
 * Created by Tim on 23/07/2014.
 */
angular.module('oreflow')
    .service('commonService', [function () {

        var angles = {
            degToRad: function (degrees) {
                return degrees * Math.PI / 180;
            },
            radToDeg: function(radians) {
                return radians * 180 / Math.PI;
            }
        };

        return {
            angles: angles
        }
    }]);