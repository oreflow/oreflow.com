/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow')
    .service('webGLService', ['modelService', 'commonService', 'boomService', function (modelService, commonService, boomService) {


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

                var vertexPositions = []
                var vertexIndices = [];
                var vertexNormals = [];
                var colorArray = [];
                for(var j = 0; j < model.faces.length; j++) {
                    vertexPositions = vertexPositions.concat(model.vertices[model.faces[j].face[0]]);
                    vertexPositions = vertexPositions.concat(model.vertices[model.faces[j].face[1]]);
                    vertexPositions = vertexPositions.concat(model.vertices[model.faces[j].face[2]]);

                    var material = model.materials[model.verticeObjects[model.faces[j].face[0]].material];
                    colorArray = colorArray.concat(material.diffuse.concat(material.opacity));
                    colorArray = colorArray.concat(material.diffuse.concat(material.opacity));
                    colorArray = colorArray.concat(material.diffuse.concat(material.opacity));

                    vertexNormals = vertexNormals.concat(model.normals[model.faces[j].normal[0]]);
                    vertexNormals = vertexNormals.concat(model.normals[model.faces[j].normal[1]]);
                    vertexNormals = vertexNormals.concat(model.normals[model.faces[j].normal[2]]);

                    vertexIndices = vertexIndices.concat(model.faces[j].face);
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

            boomService.updatePosition();



            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

            mat4.identity(mvMatrix);

            //mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
            mat4.translate(mvMatrix, [scene.translation.x, scene.translation.y, scene.translation.z]);


            var objectKeys = Object.keys(models);
            for(var i = 0; i < objectKeys.length; i++) {
                var model = models[objectKeys[i]];
                mvPushMatrix();
                mat4.translate(mvMatrix, [model.translation.x, model.translation.y, model.translation.z]);


                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.x), [1, 0, 0]);
                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.z), [0, 0, 1]);
                mat4.rotate(mvMatrix, commonService.angles.degToRad(model.rotation.y), [0, 1, 0]);


                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexPositionBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexNormalIndexBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, model.vertexNormalIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, model.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.uniform3f(shaderProgram.ambientColorUniform,0.2, 0.2, 0.2);

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
                models['express'].rotation.y += (45 * elapsed) / 1000.0;
                models['express'].rotation.y = models['express'].rotation.y % 360;

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
                {name: 'testhouse', url: 'models/testhouse.obj'},
                {name: 'island', url: 'models/island.obj'},
                {name: 'express', url: 'models/express.obj'},
                {name: 'boom', url: 'models/boom.obj'},
                {name: 'plain_sail', url: 'models/plain_sail.obj'}
            ];

            models = modelService.getModels();

            var loadingModels = [];
            for(var i = 0; i < modelReferences.length; i++){
                loadingModels.push($.get(modelReferences[i].url));
            }

            var modelDefer = $.when.apply($, loadingModels);

            modelDefer.done(function () {
                for(var i = 0; i < modelReferences.length; i++) {
                    models[modelReferences[i].name] = modelService.loadModel(loadingModels[i].responseText, modelReferences[i].name, modelAwaits);
                    models[modelReferences[i].name].rotation = {x: 0, y: 0, z: 0};
                    models[modelReferences[i].name].translation = {x: 0, y: 0, z: -25};
                }

                scene.translation = {x: 0, y: 0, z: -5};
                scene.lightingDirection = [1.0, 1.0,-1.0];

                models['testhouse'].translation.y += -7;

                models['island'].translation.y += -8;
                models['island'].rotation.y += 180;

                models['express'].translation.y += -5;
                models['express'].translation.x += 7;
                models['express'].rotation.y += 0;


                // default boom placement


                var defer = $.when.apply($, modelAwaits);

                defer.done(function () {

                    console.log(models);
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