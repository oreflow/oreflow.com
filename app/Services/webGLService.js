/**
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

                models['airtext_clouds_test'].scale.x = 0.6;
                models['airtext_clouds_test'].scale.y = 0.6;
                models['airtext_clouds_test'].scale.z = 0.6;



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