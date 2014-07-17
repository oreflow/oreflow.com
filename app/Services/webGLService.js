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

                model.vertexNormalIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexNormalIndexBuffer);

                model.vertexIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);




                var vertexIndices = [];
                var vertexNormals = [];
                for(var i = 0; i < model.faces.length; i++) {
                    vertexIndices = vertexIndices.concat(model.faces[i].face);

                    vertexNormals = vertexNormals.concat(model.normals[model.faces[i].normal[0]]);
                    vertexNormals = vertexNormals.concat(model.normals[model.faces[i].normal[1]]);
                    vertexNormals = vertexNormals.concat(model.normals[model.faces[i].normal[2]]);
                }
                console.log(vertexIndices);
                console.log(vertexNormals);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
                model.vertexNormalIndexBuffer.itemSize = 3;
                model.vertexNormalIndexBuffer.numItems = vertexNormals.length / 3;


                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
                model.vertexIndexBuffer.itemSize = 1;
                model.vertexIndexBuffer.numItems = vertexIndices.length;
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


                gl.bindBuffer(gl.ARRAY_BUFFER, models[key].vertexNormalIndexBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, models[key].vertexNormalIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, models[key].colorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, models[key].colorBuffer.itemSize, gl.FLOAT, false, 0, 0);



                gl.uniform3f(shaderProgram.ambientColorUniform,0.2, 0.2, 0.2);

                var lightingDirection = [0.0, -1.0,0.0];
                var adjustedLD = vec3.create();
                vec3.normalize(lightingDirection, adjustedLD);
                vec3.scale(adjustedLD, -1);
                gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

                gl.uniform3f(shaderProgram.directionalColorUniform,0.8,0.8,0.8);


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
            var modelObj = $.get('models/testcube.obj');

            $.when(modelObj).done(function () {
                models['testhouse'] = modelService.loadModel(modelObj.responseText, 'testcubes', modelAwaits);

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