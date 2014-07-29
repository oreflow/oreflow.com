/**
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
    }]);