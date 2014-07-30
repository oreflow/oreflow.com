/**
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
                if(elapsed > 2 * 1000) {
                    lastUpdate = new Date().getTime();
                    return;
                }
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
    }]);