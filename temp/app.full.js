/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow', ['ng', 'ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/',
            {
                controller: 'HomeCtrl',
                templateUrl: '/app/Home/home.html'
            })
            .otherwise({redirectTo: '/'});

    }]);;angular.module('oreflow').run(['$templateCache', function($templateCache) {
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
;/**
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
}]);;/**
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

    }]);;/**
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
    }]);;/**
 * Created by Tim on 15/07/2014.
 */

angular.module('oreflow')
    .service('objService', ['$q', function ($q) {
        var models = {};
        var paths = {};

        var loadObj = function (modelData, modelReference, modelAwaits) {
            if(modelReference.type === 'model') {
                var model = {
                    vertices: [ ],
                    verticeObjects: [ ],
                    normals: [],
                    faces: [],
                    objects: {}
                };
                var currentObject;
                lines = modelData.split('\n');
                for(var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.substr(0,1) === 'o') {
                        currentObject = line.substr(2);
                        model.objects[currentObject] = {};
                        model.objects[currentObject].vertices = [];
                        model.objects[currentObject].normals = [];
                    } else if(currentObject && line.substr(0, 2) === 'vt'){
                        // # Texture coordinates, in (u, v [,w]) coordinates, these will vary between 0 and 1, w is optional and default to 0.
                        throw 'Not implemented Texture coordinates';
                    } else if(currentObject && line.substr(0, 2) === 'vn'){
                        //  # Normals in (x,y,z) form; normals might not be unit.
                        var splitted = line.split(' ');
                        model.normals.push([parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3])]);

                    } else if(currentObject && line.substr(0, 2) === 'vp'){
                        // # Parameter space vertices in ( u [,v] [,w] ) form; free form geometry statement ( see below )
                        throw 'Not implemented parameter space vertices';
                    } else if(currentObject && line.substr(0, 1) === 'v'){
                        var splitted = line.split(' ');
                        switch(splitted.length) {
                            case 4:
                                model.vertices.push([parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3])]);
                                model.verticeObjects.push(model.objects[currentObject]);
                                break;
                            case 5:
                                throw 'Not implemented vertices with [w]'
                                // hanteras inte ännu
                                break;
                        }
                    } else if(currentObject && line.substr(0, 1) === 'f'){
                        var splitted = line.split(' ');
                        var faceHelper = function (face) {
                            var innerSplit = face.split('/');
                            return {
                                face: parseFloat(innerSplit[0]) - 1,
                                textureCoordinate: parseFloat(innerSplit[1]),
                                normal: parseFloat(innerSplit[2]) - 1
                            }

                        };
                        switch(splitted.length) {
                            case 4:
                                model.faces.push( {
                                    face: [faceHelper(splitted[1]).face, faceHelper(splitted[2]).face, faceHelper(splitted[3]).face],
                                    textureCoordinate: [faceHelper(splitted[1]).textureCoordinate, faceHelper(splitted[2]).textureCoordinate, faceHelper(splitted[3]).textureCoordinate],
                                    normal: [faceHelper(splitted[1]).normal, faceHelper(splitted[2]).normal, faceHelper(splitted[3]).normal]
                                });
                                break;
                            case 5:
                                model.faces.push( {
                                    face: [faceHelper(splitted[1]).face, faceHelper(splitted[2]).face, faceHelper(splitted[3]).face],
                                    textureCoordinate: [faceHelper(splitted[1]).textureCoordinate, faceHelper(splitted[2]).textureCoordinate, faceHelper(splitted[3]).textureCoordinate],
                                    normal: [faceHelper(splitted[1]).normal, faceHelper(splitted[2]).normal, faceHelper(splitted[3]).normal]
                                });
                                model.faces.push( {
                                    face: [faceHelper(splitted[1]).face, faceHelper(splitted[3]).face, faceHelper(splitted[4]).face],
                                    textureCoordinate: [faceHelper(splitted[1]).textureCoordinate, faceHelper(splitted[3]).textureCoordinate, faceHelper(splitted[4]).textureCoordinate],
                                    normal: [faceHelper(splitted[1]).normal, faceHelper(splitted[3]).normal, faceHelper(splitted[4]).normal]
                                });
                                break;
                            default:
                                console.log(splitted);
                                throw 'Not implemented faces with other than 3 or 4 vertices'
                        }
                    }
                    else if(currentObject && line.substr(0, 6) === 'usemtl'){
                        model.objects[currentObject].material = line.substr(7);
                    }
                    else if(line.substr(0, 6) === 'mtllib'){
                        model.materials = getMaterials(line.substr(7), modelAwaits);
                    }
                }
                model.rotation = {x: 0, y: 0, z: 0};
                model.translation = {x: 0, y: 0, z: 0};
                model.scale = {x: 1, y: 1, z: 1};
                models[modelReference.name] = model;
            } else if(modelReference.type === 'path') {
                var path = {
                    vertices: []
                };

                var currentPath;
                var noVertices = 0;
                lines = modelData.split('\n');

                for(var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.substr(0,1) === 'o') {
                        if(currentPath){
                            throw 'Not allowing more than one path per path file';
                        }
                        currentPath = line.substr(2);
                    } else if(currentPath && line.substr(0, 1) === 'v'){
                        var splitted = line.split(' ');
                        switch(splitted.length) {
                            case 4:
                                path.vertices[noVertices] = {
                                    x: parseFloat(splitted[1]),
                                    y: parseFloat(splitted[2]),
                                    z: parseFloat(splitted[3])
                                };
                                noVertices++;
                                break;
                            case 5:
                                throw 'Not implemented vertices with [w]'
                                break;
                        }
                    } else if(currentPath && line.substr(0, 1) === 'l'){
                        /*
                        var splitted = line.split(' ');
                        switch(splitted.length) {
                            case 3:

                                path.path[currentPathLength].path = [];
                                currentPathLength++;
                                break;
                            default:
                                throw 'Not implemented line definitions with more than two vertices';
                                break;
                        }
                        */

                    }else if(currentPath && line.substr(0, 2) === 'vt'){
                        // # Texture coordinates, in (u, v [,w]) coordinates, these will vary between 0 and 1, w is optional and default to 0.
                        throw 'Textures not allowed in path files';
                    } else if(currentPath && line.substr(0, 2) === 'vn'){
                        //  # Normals in (x,y,z) form; normals might not be unit.
                        throw 'Normals not allowed in path files';
                    } else if(currentPath && line.substr(0, 2) === 'vp'){
                        // # Parameter space vertices in ( u [,v] [,w] ) form; free form geometry statement ( see below )
                        throw 'parameter space vertices not allowed in path files';
                    } else if(currentPath && line.substr(0, 1) === 'f'){
                        throw 'faces not allowed in path files';
                    } else if(currentPath && line.substr(0, 6) === 'usemtl'){
                        throw 'materials not allowed in path files';
                    } else if(line.substr(0, 6) === 'mtllib'){
                        // should only contain references to empty material files, so ignore line
                    }
                }

                paths[modelReference.name] = path;
            }
        };


        var getMaterials = function (url, modelAwaits) {
            var modelMats = $.get('models/' + url);
            modelAwaits.push(modelMats);
            var materials = {};
            $.when(modelMats).done(function () {
                var lines = modelMats.responseText.split('\n');
                var currentMaterial;
                var line;
                for (var i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if (line.substr(0, 6) === 'newmtl') {
                        currentMaterial = line.substr(7);
                        materials[currentMaterial] = {};
                    } else if (currentMaterial && line.substr(0, 2) == 'Ka') {
                        var splitted = line.split(' ');
                        materials[currentMaterial].ambient = [parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3])];
                    } else if (currentMaterial && line.substr(0, 2) == 'Kd') {
                        var splitted = line.split(' ');
                        materials[currentMaterial].diffuse = [parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3])];
                    } else if (currentMaterial && line.substr(0, 2) == 'Ks') {
                        var splitted = line.split(' ');
                        materials[currentMaterial].specular = [parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3])];
                    } else if (currentMaterial && (line.substr(0, 1) == 'd' || line.substr(0, 2) == 'Tr')) {
                        var splitted = line.split(' ');
                        materials[currentMaterial].opacity = parseFloat(splitted[1]);
                    }
                }
            });
            return materials;
        };


        var getModels = function () {
            return models;
        };

        var getModel = function (name) {
            return models[name];
        };

        var getPaths = function () {
            return paths;
        };

        var getPath = function (name) {
            return paths[name];
        };

        return {
            loadObj: loadObj,
            getMaterials: getMaterials,
            getModels: getModels,
            getModel: getModel,
            getPaths: getPaths,
            getPath: getPath
        };
    }]);;/**
 * Created by Tim on 29/07/2014.
 */
angular.module('oreflow')
    .service('pathService', ['objService', 'commonService', function (objService, commonService) {
        var models;
        var paths;
        var pathControl = {
            boatPath: {
                running: true,
                repeat: true,
                currentIndex: 0,
                speed: 1.5, // 0.1 units / second
                model: 'express',
                translation: {x: 0, y: -6, z: 0},
                rotation: {x: 0, y: 90, z: 0},
                initialized: false,
                rotationAligned: true
            }
        };
        var lastUpdate = 0;
        var updatePaths = function () {
            var timeNow = new Date().getTime();
            if (lastUpdate != 0) {
                var elapsed = timeNow - lastUpdate;
                if (!models || !paths) {
                    models = objService.getModels();
                    paths = objService.getPaths();

                }
                if (models && paths) {


                    var pathKeys = Object.keys(pathControl);
                    for (var i = 0; i < pathKeys.length; i++) {
                        var currentControl = pathControl[pathKeys[i]];
                        if(!currentControl.running || !models[currentControl.model] || !paths[pathKeys[i]]) {
                            continue;
                        }
                        if(!currentControl.initialized){
                            models[currentControl.model].translation.x = paths[pathKeys[i]].vertices[0].x + currentControl.translation.x;
                            models[currentControl.model].translation.y = paths[pathKeys[i]].vertices[0].y + currentControl.translation.y;
                            models[currentControl.model].translation.z = paths[pathKeys[i]].vertices[0].z + currentControl.translation.z;
                            currentControl.initialized = true;
                        }
                        var distance = currentControl.speed * elapsed / 1000; // distance since last update
                        var startPos = JSON.parse(JSON.stringify(models[currentControl.model].translation));


                        if(currentControl.currentIndex >= paths[pathKeys[i]].vertices.length - 1) {
                            if(currentControl.repeat){
                                currentControl.currentIndex = 0;
                            } else {
                                currentControl.running = false;
                                currentControl.currentIndex = paths[pathKeys[i]].vertices.length - 1;
                            }
                        }
                        var distanceToVertex = calcDistance(models[currentControl.model].translation, false, paths[pathKeys[i]].vertices[currentControl.currentIndex + 1], currentControl.translation);



                        if(distance <= distanceToVertex) {
                            // animationens position når inte nästa vertex
                            //console.log('animationens position når inte nästa vertex', distance, distanceToVertex);

                            var dx = (paths[pathKeys[i]].vertices[currentControl.currentIndex + 1].x + currentControl.translation.x) - models[currentControl.model].translation.x;
                            var dy = (paths[pathKeys[i]].vertices[currentControl.currentIndex + 1].y + currentControl.translation.y) - models[currentControl.model].translation.y;
                            var dz = (paths[pathKeys[i]].vertices[currentControl.currentIndex + 1].z + currentControl.translation.z) - models[currentControl.model].translation.z;
                            //console.log(dx, dy, dz);
                            //console.log(dx / distanceToVertex * distance, dy / distanceToVertex * distance, dz / distanceToVertex * distance);

                            models[currentControl.model].translation.x += dx / distanceToVertex * distance;
                            models[currentControl.model].translation.y += dy / distanceToVertex * distance;
                            models[currentControl.model].translation.z += dz / distanceToVertex * distance;
                        } else {
                            /*
                             for (var j = 1; j <= 10; j++) {
                             distanceToVertex = calcDistance(models[currentControl.model].translation, null, paths[pathKeys[i]].vertices[currentControl.currentIndex + j % (paths[pathKeys[i]].vertices.length - 1) ], currentControl.translation);
                             if (distanceToVertex > distance) {
                             currentControl.currentIndex = currentControl.currentIndex + j % (paths[pathKeys[i]].vertices.length - 1) ;
                             break;
                             }
                             }
                             */

                            currentControl.currentIndex++;

                            models[currentControl.model].translation.x = paths[pathKeys[i]].vertices[currentControl.currentIndex].x + currentControl.translation.x;
                            models[currentControl.model].translation.y = paths[pathKeys[i]].vertices[currentControl.currentIndex].y + currentControl.translation.y;
                            models[currentControl.model].translation.z = paths[pathKeys[i]].vertices[currentControl.currentIndex].z + currentControl.translation.z;
                        }

                        if(currentControl.rotationAligned) {


                            var endPos = JSON.parse(JSON.stringify(models[currentControl.model].translation));
                            var dx = endPos.x - startPos.x;
                            var dy = endPos.y - startPos.y;
                            var dz = endPos.z - startPos.z;

                            var rx = commonService.angles.radToDeg(Math.atan(dz/dy)) + currentControl.rotation.x;
                            if(dy > 0) {
                                rx += 180;
                            }

                            var ry = commonService.angles.radToDeg(Math.atan(dx/dz)) + currentControl.rotation.y;
                            if(dz > 0) {
                                ry += 180;
                            }


                            var rz = commonService.angles.radToDeg(Math.atan(dy/dx)) + currentControl.rotation.z;
                            if(dx > 0) {
                                rz += 180;
                            }




                            var drx = rx - models[currentControl.model].rotation.x;
                            if(drx > 1 || drx < -1) {
                                if(Math.abs(drx) > 180) {
                                    models[currentControl.model].rotation.x += (drx * elapsed) / 1000.0 / 36;
                                } else {
                                    models[currentControl.model].rotation.x += (drx * 2 * elapsed) / 1000.0;
                                }

                            }

                            var dry = ry - models[currentControl.model].rotation.y;
                            if(dry > 1 ||dry < -1) {
                                if(Math.abs(dry) > 180) {
                                    models[currentControl.model].rotation.y -= (dry * elapsed) / 1000.0 / 36;
                                } else {
                                    models[currentControl.model].rotation.y += (dry * 2 * elapsed) / 1000.0;
                                }
                            }

                            var drz = rz - models[currentControl.model].rotation.z;
                            if(drz > 1 || drz < -1) {
                                if(Math.abs(drz) > 180) {
                                    models[currentControl.model].rotation.z += (drz * elapsed) / 1000.0 / 36;
                                } else {
                                    models[currentControl.model].rotation.z += (drz * 2 * elapsed) / 1000.0;
                                }
                            }

                            models[currentControl.model].rotation.x = models[currentControl.model].rotation.x % 360;
                            models[currentControl.model].rotation.y = models[currentControl.model].rotation.y % 360;
                            models[currentControl.model].rotation.z = models[currentControl.model].rotation.z % 360;

                        }
                    }
                }
                var pathKeys = Object.keys(pathControl);
                for (var i = 0; i < pathKeys.length; i++) {
                    var currentControl = pathControl[pathKeys[i]];
                    if(currentControl.keyFrames){
                        console.log('updating keyFrames');

                    }
                }

            }
            lastUpdate = timeNow;
        };
        var calcDistance = function (v1, v1mod, v2 ,v2mod) {
            //console.log(v1, v1mod, v2, v2mod);
            if(v1mod && v2mod) {
                return Math.sqrt(
                        Math.pow((v2.x + v2mod.x) - (v1.x + v1mod.x), 2) +
                        Math.pow((v2.y + v2mod.y) - (v1.y + v1mod.y), 2) +
                        Math.pow((v2.z + v2mod.z) - (v1.z + v1mod.z), 2));
            } else if(v1mod) {
                return Math.sqrt(
                        Math.pow(v2.x - (v1.x + v1mod.x), 2) +
                        Math.pow(v2.y - (v1.y + v1mod.y), 2) +
                        Math.pow(v2.z - (v1.z + v1mod.z), 2));
            } else if(v2mod) {
                return Math.sqrt(
                        Math.pow((v2.x + v2mod.x) - v1.x, 2) +
                        Math.pow((v2.y + v2mod.y) - v1.y, 2) +
                        Math.pow((v2.z + v2mod.z) - v1.z, 2));
            }
            return Math.sqrt(
                    Math.pow(v2.x - v1.x, 2) +
                    Math.pow(v2.y - v1.y, 2) +
                    Math.pow(v2.z - v1.z, 2));

        }


        return {
            updatePaths: updatePaths
        };
    }]);;/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow')
    .service('webGLService', ['objService', 'commonService', 'boatService', 'pathService', function (objService, commonService, boatService, pathService) {


        var gl;

        function initGL(canvas) {
            try {
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;
            } catch (e) {
            }
            if (!gl) {
                alert("Could not initialise WebGL, sorry :-(");
            }
        }


        function getShader(gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }


        var shaderProgram;

        function initShaders() {
            var fragmentShader = getShader(gl, "shader-fs");
            var vertexShader = getShader(gl, "shader-vs");

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
            gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
            shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
            shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
            shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
            shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
            shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
        }


        var mvMatrix = mat4.create();
        var mvMatrixStack = [];
        var pMatrix = mat4.create();

        function setMatrixUniforms() {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

            var normalMatrix = mat3.create();
            mat4.toInverseMat3(mvMatrix, normalMatrix);
            mat3.transpose(normalMatrix);
            gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
        }

        function mvPushMatrix() {
            var copy = mat4.create();
            mat4.set(mvMatrix, copy);
            mvMatrixStack.push(copy);
        }

        function mvPopMatrix() {
            if (mvMatrixStack.length == 0) {
                throw "Invalid popMatrix!";
            }
            mvMatrix = mvMatrixStack.pop();
        }


        function initBuffers() {
            var objectKeys = Object.keys(models);
            for(var i = 0; i < objectKeys.length; i++) {

                var model = models[objectKeys[i]];

                var vertexPositions = [];//new Array(model.faces.length * 9);
                var vertexIndices = [];
                var vertexNormals = [];
                var colorArray = [];
                for(var j = 0; j < model.faces.length; j++) {

                    vertexPositions[j * 9 + 0 ]= model.vertices[model.faces[j].face[0]][0];
                    vertexPositions[j * 9 + 1 ]= model.vertices[model.faces[j].face[0]][1];
                    vertexPositions[j * 9 + 2 ]= model.vertices[model.faces[j].face[0]][2];

                    vertexPositions[j * 9 + 3 ]= model.vertices[model.faces[j].face[1]][0];
                    vertexPositions[j * 9 + 4 ]= model.vertices[model.faces[j].face[1]][1];
                    vertexPositions[j * 9 + 5 ]= model.vertices[model.faces[j].face[1]][2];

                    vertexPositions[j * 9 + 6 ]= model.vertices[model.faces[j].face[2]][0];
                    vertexPositions[j * 9 + 7 ]= model.vertices[model.faces[j].face[2]][1];
                    vertexPositions[j * 9 + 8 ]= model.vertices[model.faces[j].face[2]][2];


                    var material = model.materials[model.verticeObjects[model.faces[j].face[0]].material];

                    colorArray[j * 12 + 0] = material.diffuse[0];
                    colorArray[j * 12 + 1] = material.diffuse[1];
                    colorArray[j * 12 + 2] = material.diffuse[2];
                    colorArray[j * 12 + 3] = material.opacity;

                    colorArray[j * 12 + 4] = material.diffuse[0];
                    colorArray[j * 12 + 5] = material.diffuse[1];
                    colorArray[j * 12 + 6] = material.diffuse[2];
                    colorArray[j * 12 + 7] = material.opacity;

                    colorArray[j * 12 + 8] = material.diffuse[0];
                    colorArray[j * 12 + 9] = material.diffuse[1];
                    colorArray[j * 12 + 10] = material.diffuse[2];
                    colorArray[j * 12 + 11] = material.opacity;

                    vertexNormals[j * 9 + 0] = model.normals[model.faces[j].normal[0]][0];
                    vertexNormals[j * 9 + 1] = model.normals[model.faces[j].normal[0]][1];
                    vertexNormals[j * 9 + 2] = model.normals[model.faces[j].normal[0]][2];

                    vertexNormals[j * 9 + 3] = model.normals[model.faces[j].normal[1]][0];
                    vertexNormals[j * 9 + 4] = model.normals[model.faces[j].normal[1]][1];
                    vertexNormals[j * 9 + 5] = model.normals[model.faces[j].normal[1]][2];

                    vertexNormals[j * 9 + 6] = model.normals[model.faces[j].normal[2]][0];
                    vertexNormals[j * 9 + 7] = model.normals[model.faces[j].normal[2]][1];
                    vertexNormals[j * 9 + 8] = model.normals[model.faces[j].normal[2]][2];

                    vertexIndices[j * 3 + 0] = model.faces[j].face[0];
                    vertexIndices[j * 3 + 1] = model.faces[j].face[1];
                    vertexIndices[j * 3 + 2] = model.faces[j].face[2];
                }

                model.vertexPositionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexPositionBuffer);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
                model.vertexPositionBuffer.itemSize = 3;
                model.vertexPositionBuffer.numItems = vertexPositions.length / 3;


                model.colorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
                model.colorBuffer.itemSize = 4;
                model.colorBuffer.numItems = colorArray.length / 4;


                model.vertexNormalIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexNormalIndexBuffer);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
                model.vertexNormalIndexBuffer.itemSize = 3;
                model.vertexNormalIndexBuffer.numItems = vertexNormals.length / 3;

                model.vertexIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);

                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
                model.vertexIndexBuffer.itemSize = 1;
                model.vertexIndexBuffer.numItems = vertexIndices.length;
            }
        }



        var rRomb = 0;

        function drawScene() {
            // functions that need to be called each draw cycle
            pathService.updatePaths();
            boatService.updatePosition();



            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

            mat4.identity(mvMatrix);

            //mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
            mat4.translate(mvMatrix, [scene.translation.x, scene.translation.y, scene.translation.z]);


            var objectKeys = Object.keys(models);
            for(var i = 0; i < objectKeys.length; i++) {
                var model = models[objectKeys[i]];
                if(model.draw === false) {
                    continue;
                }
                mvPushMatrix();
                mat4.translate(mvMatrix, [model.translation.x, model.translation.y, model.translation.z]);



                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.x), [1, 0, 0]);
                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.z), [0, 0, 1]);
                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.y), [0, 1, 0]);


                mvMatrix[0] = mvMatrix[0] * model.scale.x;
                mvMatrix[5] = mvMatrix[5] * model.scale.y;
                mvMatrix[10] = mvMatrix[10] * model.scale.z;


                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexPositionBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexNormalIndexBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, model.vertexNormalIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, model.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.uniform3f(shaderProgram.ambientColorUniform,scene.ambient.r,scene.ambient.g, scene.ambient.b);

                var adjustedLD = vec3.create();
                vec3.normalize(scene.lightingDirection, adjustedLD);
                vec3.scale(adjustedLD, -1);
                gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

                gl.uniform3f(shaderProgram.directionalColorUniform,0.8,0.8,0.8);


                //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[key].vertexIndexBuffer);
                setMatrixUniforms();

                //gl.drawElements(gl.TRIANGLES, model.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                gl.drawArrays(gl.TRIANGLES, 0, model.vertexPositionBuffer.numItems);

                mvPopMatrix();
            }
        }

        var models = {};

        var modelAwaits = [];

        var scene = {};




        var lastTime = 0;
        function animate() {
            var timeNow = new Date().getTime();
            if (lastTime != 0) {
                var elapsed = timeNow - lastTime;
                // rotation
                //scene.rotation.x += (10 * elapsed) / 1000.0
                models['water'].rotation.y += (1 * elapsed) / 1000.0;
                models['water'].rotation.y = models['water'].rotation.y % 360;


            }
            lastTime = timeNow;
        }

        function tick() {
            requestAnimFrame(tick);
            drawScene();
            animate();
        }



        var webGLStart = function(canvas) {

            var modelReferences = [
                {name: 'house', url: 'models/house.obj', type: 'model'},
                {name: 'island', url: 'models/island.obj', type: 'model'},
                {name: 'express', url: 'models/express.obj', type: 'model'},
                {name: 'boom', url: 'models/boom.obj', type: 'model'},
                {name: 'plain_sail', url: 'models/plain_sail.obj', type: 'model'},
                {name: 'curved_starboard_sail', url: 'models/curved_starboard_sail.obj', type: 'model'},
                {name: 'curved_port_sail', url: 'models/curved_port_sail.obj', type: 'model'},
                {name: 'water', url: 'models/water.obj', type: 'model'},
                {name: 'boatPath', url: 'paths/boatPath.obj', type: 'path'},
                {name: 'airtext_clouds_test', url: 'models/airtext_clouds_test.obj', type: 'model'},
                {name: 'airtext_clouds_dot', url: 'models/airtext_clouds_dot.obj', type: 'model'},
                //{name: 'Cube', url: 'models/Cube.obj', type: 'model'},
                {name: 'airPath', url: 'paths/airPath2.obj', type: 'path'}
            ];

            models = objService.getModels();

            var loadingModels = [];
            for(var i = 0; i < modelReferences.length; i++){
                loadingModels.push($.get(modelReferences[i].url));
            }

            var modelDefer = $.when.apply($, loadingModels);

            modelDefer.done(function () {
                for(var i = 0; i < modelReferences.length; i++) {
                    objService.loadObj(loadingModels[i].responseText, modelReferences[i], modelAwaits);
                }

                scene.translation = {x: 0, y: -3, z: -55};
                scene.lightingDirection = [1.0, -1.0, 1.0];
                scene.ambient = {r: 0.4, g: 0.4, b: 0.4};

                models['house'].translation.y += -7;

                models['island'].translation.y += -8;
                models['island'].rotation.y += 180;

                models['express'].translation.y += -5.8;
                models['express'].translation.x += 10;
                models['express'].translation.z += 10;



                models['water'].translation.y += -8;
                models['water'].translation.x += 2;

                models['airtext_clouds_test'].translation.y = 10;
                /*
                models['airtext_clouds_test'].scale.x = 2;
                models['airtext_clouds_test'].scale.y = 2;
                models['airtext_clouds_test'].scale.z = 2;
*/


                models['plain_sail'].draw = false;
                models['boom'].draw = false;






                var defer = $.when.apply($, modelAwaits);

                defer.done(function () {


                    initGL(canvas);
                    initShaders();
                    initBuffers();

                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.enable(gl.DEPTH_TEST);

                    tick();
                });

            })
        };

        var setDimensions = function (height, width) {
            gl.viewportHeight = height;
            gl.viewportWidth = width;
        };

        return {
            webGLStart: webGLStart,
            setDimensions: setDimensions
        };
    }]);