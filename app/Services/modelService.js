/**
 * Created by Tim on 15/07/2014.
 */

angular.module('oreflow')
    .service('modelService', [function () {


        var loadModel = function (modelData, modelName, modelAwaits) {
            var model = {
                vertices: [ ],
                verticeObjects: [ ],
                faces: [],
                objects: {}
            };
            var currentObject;
            lines = modelData.split('\n');
            for(var i = 0; i < lines.length; i++) {
                line = lines[i];
                if (line.substr(0,1) === 'o') {
                    currentObject = line.substr(2);
                    model.objects[currentObject] = {};
                    model.objects[currentObject].vertices = [];
                } else if(currentObject && line.substr(0, 2) === 'vt'){
                    // # Texture coordinates, in (u, v [,w]) coordinates, these will vary between 0 and 1, w is optional and default to 0.
                    throw 'Not implemented Texture coordinates';
                } else if(currentObject && line.substr(0, 2) === 'vn'){
                    //  # Normals in (x,y,z) form; normals might not be unit.
                    throw 'Not implemented Normals';
                } else if(currentObject && line.substr(0, 2) === 'vp'){
                    // # Parameter space vertices in ( u [,v] [,w] ) form; free form geometry statement ( see below )
                    throw 'Not implemented parameter space vertices';
                } else if(currentObject && line.substr(0, 1) === 'v'){
                    var splitted = line.split(' ');
                    switch(splitted.length) {
                        case 4:
                            model.vertices.push(parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3]));
                            model.verticeObjects.push(model.objects[currentObject], model.objects[currentObject], model.objects[currentObject]);
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
                            normal: parseFloat(innerSplit[2])
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
            return model;
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

        return {
            loadModel: loadModel,
            getMaterials: getMaterials
        };
    }]);