/**
 * Created by Tim on 15/07/2014.
 */
angular.module('oreflow')
.service('webGLService', ['modelService', function (modelService) {


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

            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        }


        var mvMatrix = mat4.create();
        var mvMatrixStack = [];
        var pMatrix = mat4.create();

        function setMatrixUniforms() {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
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

                model.vertexPositionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexPositionBuffer);
                //console.log(model.vertices.slice(1, model.vertices.length).length);
                //console.log(model.vertices.slice(1, model.vertices.length ));
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
                model.vertexPositionBuffer.itemSize = 3;
                model.vertexPositionBuffer.numItems = (model.vertices.length) / 3;



                model.colorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);

                var colorArray = [];
                for(var j = 0; j < model.vertexPositionBuffer.numItems; j++) {
                    var material = model.materials[model.verticeObjects[j * 3].material];
                    colorArray = colorArray.concat(material.diffuse.concat(material.opacity));
                }
                //console.log(colorArray);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
                model.colorBuffer.itemSize = 4;
                model.colorBuffer.numItems = model.vertexPositionBuffer.numItems;


                model.vertexIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);
                var cubeVertexIndices = [];
                for(var i = 0; i < model.faces.length; i++) {
                    cubeVertexIndices = cubeVertexIndices.concat(model.faces[i].face);
                }
                //console.log(cubeVertexIndices);
                //console.log(cubeVertexIndices.length/3);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
                model.vertexIndexBuffer.itemSize = 1;
                model.vertexIndexBuffer.numItems = cubeVertexIndices.length;
            }



        }



        var rRomb = 0;

        function drawScene() {
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

            mat4.identity(mvMatrix);

            mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);


            var objectKeys = Object.keys(models);
            for(var i = 0; i < objectKeys.length; i++) {
                var key = objectKeys[i];
                mvPushMatrix();

                mat4.translate(mvMatrix, [0.0, -2.0, 0.0]);
                mat4.rotate(mvMatrix, degToRad(rRomb), [0, 1, 0]);
                gl.bindBuffer(gl.ARRAY_BUFFER, models[key].vertexPositionBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, models[key].vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);


                gl.bindBuffer(gl.ARRAY_BUFFER, models[key].colorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, models[key].colorBuffer.itemSize, gl.FLOAT, false, 0, 0);


                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[key].vertexIndexBuffer);
                setMatrixUniforms();
                gl.drawElements(gl.TRIANGLES, models[key].vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                //gl.drawArrays(gl.TRIANGLES, 0, models[key].vertexPositionBuffer.numItems);

                mvPopMatrix();
            }


        }

        var models = {};

        var modelAwaits = [];




        var lastTime = 0;
        function animate() {
            var timeNow = new Date().getTime();
            if (lastTime != 0) {
                var elapsed = timeNow - lastTime;

                rRomb += (10 * elapsed) / 1000.0;
            }
            lastTime = timeNow;
        }

        function tick() {
            requestAnimFrame(tick);
            drawScene();
            animate();
        }

        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }




        var models = {};

        var modelAwaits = [];

        var webGLStart = function(canvas) {
            var modelObj = $.get('models/testhouse.obj');

            $.when(modelObj).done(function () {
                models['testcubes'] = modelService.loadModel(modelObj.responseText, 'testcubes', modelAwaits);

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