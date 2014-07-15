/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow')
    .controller('HomeCtrl', ['$scope', function ($scope) {
    console.log('created controller');
    webGLStart();
}]);