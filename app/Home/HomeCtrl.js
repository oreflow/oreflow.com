/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow')
    .controller('HomeCtrl', ['$scope', '$window', 'webGLService', function ($scope, $window, webGLService) {

        $scope.windowSize = {innerHeight: $window.innerHeight, innerWidth: $window.innerWidth};
        $scope.Math = Math;
        var canvasElement = document.getElementById('webgl-canvas');
        canvasElement.height = $window.innerHeight;//Math.min($window.innerWidth, $window.innerHeight);
        canvasElement.width = $window.innerWidth - 10;//Math.min($window.innerWidth, $window.innerHeight);
        webGLService.webGLStart(canvasElement);

        var windowSizeChange = function () {

        };

        angular.element($window).bind('resize', function() {
            console.log($window);
            $scope.windowSize.innerHeight = $window.innerHeight;
            $scope.windowSize.innerWidth = $window.innerWidth;


            webGLService.setDimensions($window.innerHeight, $window.innerWidth);
            //webGLService.setDimensions(Math.min($window.innerWidth, $window.innerHeight),Math.min($window.innerWidth, $window.innerHeight));
            canvasElement.height = $window.innerHeight; //Math.min($window.innerWidth, $window.innerHeight);
            canvasElement.width = $window.innerWidth - 10; //Math.min($window.innerWidth, $window.innerHeight);
            try {
                $scope.$digest();
            } catch (exception) {

            }
        })
}]);