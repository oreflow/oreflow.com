/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow', ['ng', 'ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
        console.log('config');
        $routeProvider
            .when('/',
            {
                controller: 'HomeCtrl',
                templateUrl: '/app/Home/home.html'
            })
            .otherwise({redirectTo: '/'});

    }]);