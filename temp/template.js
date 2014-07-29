angular.module('oreflow').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/Home/home.html',
    "\r" +
    "\n" +
    "<!-- ng-style=\"{left: windowSize.innerWidth / 2 - Math.min(windowSize.innerWidth,windowSize.innerHeight)/2}\" -->\r" +
    "\n" +
    "<canvas id=\"webgl-canvas\"\r" +
    "\n" +
    "\r" +
    "\n" +
    "        style=\"position: absolute; top:0px;\" width=\"500\" height=\"500\" ></canvas>"
  );

}]);
