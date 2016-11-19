
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;

//factor to scale the image by
var factor = 1.0;
//initial counter to see when scaling factor should reverse
var counter = 50;

//value to increment the factor by per draw call
var scalar = 0.01;

//plays the CHRISTMASMUSIC YAYYY
song.loop=true;
song.play();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [
      
    //top bar
            //middle
            0.25, 0.875, 0.0,
            0.25, 0.625, 0.0,
           -0.25, 0.625, 0.0,
      
           -0.25, 0.625, 0.0,
           -0.25, 0.875, 0.0,
            0.25, 0.875, 0.0,
      
            //right side
            0.25, 0.875, 0.0,
            0.25, 0.625, 0.0,
            0.55, 0.625, 0.0,
            
            0.25, 0.875, 0.0,
            0.55, 0.875, 0.0,
            0.55, 0.625, 0.0,
      
            0.55, 0.875, 0.0,
            0.55, 0.625, 0.0,
            0.70, 0.625, 0.0,
      
            0.55, 0.875, 0.0,
            0.70, 0.875, 0.0,
            0.70, 0.625, 0.0,
      
            //left side
            -0.25, 0.875, 0.0,
            -0.25, 0.625, 0.0,
            -0.55, 0.625, 0.0,
      
            -0.25, 0.875, 0.0,
            -0.55, 0.875, 0.0,
            -0.55, 0.625, 0.0,
      
            -0.55, 0.875, 0.0,
            -0.55, 0.625, 0.0,
            -0.70, 0.625, 0.0,
      
            -0.55, 0.875, 0.0,
            -0.70, 0.875, 0.0,
            -0.70, 0.625, 0.0,
      
      //Middle part
        //right -> moving top to bottom and right to left
            0.25, 0.625, 0.0,
            0.55, 0.625, 0.0,
            0.25, 0.375,0.0,
      
            0.55, 0.625, 0.0,
            0.55, 0.375, 0.0,
            0.25, 0.375, 0.0,
      
            0.15, 0.375, 0.0,
            0.25, 0.375, 0.0,
            0.25, 0.0, 0.0,
      
            0.15, 0.0, 0.0,
            0.15, 0.375, 0.0,
            0.25, 0.0, 0.0,
      
            0.25, 0.375, 0.0,
            0.55, 0.375, 0.0,
            0.55, 0.0, 0.0,
      
            0.25, 0.0, 0.0,
            0.55, 0.0, 0.0,
            0.25, 0.375, 0.0,
      
            0.25, 0.0, 0.0,
            0.55, 0.0, 0.0,
            0.55, -0.25, 0.0,
      
            0.25, 0.0, 0.0,
            0.25, -0.25, 0.0,
            0.55, -0.25, 0.0,
      
        //left
      
            -0.25, 0.625, 0.0,
            -0.55, 0.625, 0.0,
            -0.25, 0.375,0.0,
      
            -0.55, 0.625, 0.0,
            -0.55, 0.375, 0.0,
            -0.25, 0.375, 0.0,
      
            -0.15, 0.375, 0.0,
            -0.25, 0.375, 0.0,
            -0.25, 0.0, 0.0,
      
            -0.15, 0.0, 0.0,
            -0.15, 0.375, 0.0,
            -0.25, 0.0, 0.0,
      
            -0.25, 0.375, 0.0,
            -0.55, 0.375, 0.0,
            -0.55, 0.0, 0.0,
      
            -0.25, 0.0, 0.0,
            -0.55, 0.0, 0.0,
            -0.25, 0.375, 0.0,
      
            -0.25, 0.0, 0.0,
            -0.55, 0.0, 0.0,
            -0.55, -0.25, 0.0,
      
            -0.25, 0.0, 0.0,
            -0.25, -0.25, 0.0,
            -0.55, -0.25, 0.0,
      
      //bottom part
        //right side - first bar
            0.05, -0.3, 0.0,
            0.15, -0.3, 0.0,
            0.05, -0.6, 0.0,
      
            0.15, -0.3, 0.0,
            0.05, -0.6, 0.0,
            0.15, -0.6, 0.0,
      
            0.05, -0.6, 0.0,
            0.15, -0.6, 0.0,
            0.05, -0.65, 0.0,
      
        //second bar
            0.25, -0.3, 0.0,
            0.35, -0.3, 0.0,
            0.25, -0.5, 0.0,
            
            0.35, -0.3, 0.0,
            0.25, -0.5, 0.0,
            0.35, -0.5, 0.0,
      
            0.25, -0.5, 0.0,
            0.35, -0.5, 0.0,
            0.25, -0.55, 0.0,
      
      //third bar
            0.45, -0.3, 0.0,
            0.55, -0.3, 0.0,
            0.45, -0.4, 0.0,
      
            0.55, -0.3, 0.0,
            0.55, -0.4, 0.0,
            0.45, -0.4, 0.0,
      
            0.45, -0.4, 0.0,
            0.55, -0.4, 0.0,
            0.45, -0.45, 0.0,
      
      //left side -> first bar
            -0.05, -0.3, 0.0,
            -0.15, -0.3, 0.0,
            -0.05, -0.6, 0.0,
      
            -0.15, -0.3, 0.0,
            -0.05, -0.6, 0.0,
            -0.15, -0.6, 0.0,
      
            -0.05, -0.6, 0.0,
            -0.15, -0.6, 0.0,
            -0.05, -0.65, 0.0,
      
        //second bar
            -0.25, -0.3, 0.0,
            -0.35, -0.3, 0.0,
            -0.25, -0.5, 0.0,
            
            -0.35, -0.3, 0.0,
            -0.25, -0.5, 0.0,
            -0.35, -0.5, 0.0,
      
            -0.25, -0.5, 0.0,
            -0.35, -0.5, 0.0,
            -0.25, -0.55, 0.0,
      
      //third bar
            -0.45, -0.3, 0.0,
            -0.55, -0.3, 0.0,
            -0.45, -0.4, 0.0,
      
            -0.55, -0.3, 0.0,
            -0.55, -0.4, 0.0,
            -0.45, -0.4, 0.0,
      
            -0.45, -0.4, 0.0,
            -0.55, -0.4, 0.0,
            -0.45, -0.45, 0.0,
            
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 132;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
      
      //blue
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
        0.098, 0.098, 0.439, 1.0,
      
        //bottom half colors - orange
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
      
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0,
        1.0, 0.388, 0.0, 1.0 
      
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 132;  
}

function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
    
  mat4.identity(mvMatrix);
  mat4.scale(mvMatrix,mvMatrix, [factor,factor,1]);
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle)); 
    
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}


function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+0.25) % 360;
    }
    lastTime = timeNow;
    
}

function startup() {
    
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

//offset for angles that the bottom bars move by
//two offsets so bar pairings movements look unique-ish
var nonaff = 0;
var nonaff1 = 1;

function tick() {
    
    //adjusting offset over time
    nonaff += 0.075;
    nonaff1 += 0.075;
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexPositionBuffer);
    
    //updating vertices to new offsets
    var triangleVertices = [

            0.25, 0.875, 0.0,
            0.25, 0.625, 0.0,
           -0.25, 0.625, 0.0,
           -0.25, 0.625, 0.0,
           -0.25, 0.875, 0.0,
            0.25, 0.875, 0.0,
            0.25, 0.875, 0.0,
            0.25, 0.625, 0.0,
            0.55, 0.625, 0.0,
            0.25, 0.875, 0.0,
            0.55, 0.875, 0.0,
            0.55, 0.625, 0.0,
            0.55, 0.875, 0.0,
            0.55, 0.625, 0.0,
            0.70, 0.625, 0.0,    
            0.55, 0.875, 0.0,
            0.70, 0.875, 0.0,
            0.70, 0.625, 0.0,
            -0.25, 0.875, 0.0,
            -0.25, 0.625, 0.0,
            -0.55, 0.625, 0.0,
            -0.25, 0.875, 0.0,
            -0.55, 0.875, 0.0,
            -0.55, 0.625, 0.0,
            -0.55, 0.875, 0.0,
            -0.55, 0.625, 0.0,
            -0.70, 0.625, 0.0,
            -0.55, 0.875, 0.0,
            -0.70, 0.875, 0.0,
            -0.70, 0.625, 0.0,
            0.25, 0.625, 0.0,
            0.55, 0.625, 0.0,
            0.25, 0.375,0.0,
            0.55, 0.625, 0.0,
            0.55, 0.375, 0.0,
            0.25, 0.375, 0.0,
            0.15, 0.375, 0.0,
            0.25, 0.375, 0.0,
            0.25, 0.0, 0.0,
            0.15, 0.0, 0.0,
            0.15, 0.375, 0.0,
            0.25, 0.0, 0.0,
            0.25, 0.375, 0.0,
            0.55, 0.375, 0.0,
            0.55, 0.0, 0.0,
            0.25, 0.0, 0.0,
            0.55, 0.0, 0.0,
            0.25, 0.375, 0.0,
            0.25, 0.0, 0.0,
            0.55, 0.0, 0.0,
            0.55, -0.25, 0.0,
            0.25, 0.0, 0.0,
            0.25, -0.25, 0.0,
            0.55, -0.25, 0.0,
            -0.25, 0.625, 0.0,
            -0.55, 0.625, 0.0,
            -0.25, 0.375,0.0,
            -0.55, 0.625, 0.0,
            -0.55, 0.375, 0.0,
            -0.25, 0.375, 0.0,
            -0.15, 0.375, 0.0,
            -0.25, 0.375, 0.0,
            -0.25, 0.0, 0.0,
            -0.15, 0.0, 0.0,
            -0.15, 0.375, 0.0,
            -0.25, 0.0, 0.0,
            -0.25, 0.375, 0.0,
            -0.55, 0.375, 0.0,
            -0.55, 0.0, 0.0,
            -0.25, 0.0, 0.0,
            -0.55, 0.0, 0.0,
            -0.25, 0.375, 0.0,
            -0.25, 0.0, 0.0,
            -0.55, 0.0, 0.0,
            -0.55, -0.25, 0.0,
            -0.25, 0.0, 0.0,
            -0.25, -0.25, 0.0,
            -0.55, -0.25, 0.0,
      
      //bottom part -> changed to satisfy non-affine transformation
        //right side - first bar
            0.05, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            0.15, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            0.05, -0.6+Math.sin(nonaff1)*0.05, 0.0,
      
            0.15, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            0.05, -0.6+Math.sin(nonaff1)*0.05, 0.0,
            0.15, -0.6+Math.sin(nonaff1)*0.05, 0.0,
      
            0.05, -0.6+Math.sin(nonaff1)*0.05, 0.0,
            0.15, -0.6+Math.sin(nonaff1)*0.05, 0.0,
            0.05, -0.65+Math.sin(nonaff1)*0.05, 0.0,
      
        //second bar
            0.25, -0.3+Math.cos(nonaff)*0.05, 0.0,
            0.35, -0.3+Math.cos(nonaff)*0.05, 0.0,
            0.25, -0.5+Math.cos(nonaff)*0.05, 0.0,
            
            0.35, -0.3+Math.cos(nonaff)*0.05, 0.0,
            0.25, -0.5+Math.cos(nonaff)*0.05, 0.0,
            0.35, -0.5+Math.cos(nonaff)*0.05, 0.0,
      
            0.25, -0.5+Math.cos(nonaff)*0.05, 0.0,
            0.35, -0.5+Math.cos(nonaff)*0.05, 0.0,
            0.25, -0.55+Math.cos(nonaff)*0.05, 0.0,
      
      //third bar
            0.45, -0.3+Math.sin(nonaff)*0.05, 0.0,
            0.55, -0.3+Math.sin(nonaff)*0.05, 0.0,
            0.45, -0.4+Math.sin(nonaff)*0.05, 0.0,
      
            0.55, -0.3+Math.sin(nonaff)*0.05, 0.0,
            0.55, -0.4+Math.sin(nonaff)*0.05, 0.0,
            0.45, -0.4+Math.sin(nonaff)*0.05, 0.0,
      
            0.45, -0.4+Math.sin(nonaff)*0.05, 0.0,
            0.55, -0.4+Math.sin(nonaff)*0.05, 0.0,
            0.45, -0.45+Math.sin(nonaff)*0.05, 0.0,
      
      //left side -> first bar
            -0.05, -0.3+Math.sin(nonaff)*0.05, 0.0,
            -0.15, -0.3+Math.sin(nonaff)*0.05, 0.0,
            -0.05, -0.6+Math.sin(nonaff)*0.05, 0.0,
      
            -0.15, -0.3+Math.sin(nonaff)*0.05, 0.0,
            -0.05, -0.6+Math.sin(nonaff)*0.05, 0.0,
            -0.15, -0.6+Math.sin(nonaff)*0.05, 0.0,
      
            -0.05, -0.6+Math.sin(nonaff)*0.05, 0.0,
            -0.15, -0.6+Math.sin(nonaff)*0.05, 0.0,
            -0.05, -0.65+Math.sin(nonaff)*0.05, 0.0,
      
        //second bar
            -0.25, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            -0.35, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            -0.25, -0.5+Math.sin(nonaff1)*0.05, 0.0,
            
            -0.35, -0.3+Math.sin(nonaff1)*0.05, 0.0,
            -0.25, -0.5+Math.sin(nonaff1)*0.05, 0.0,
            -0.35, -0.5+Math.sin(nonaff1)*0.05, 0.0,
      
            -0.25, -0.5+Math.sin(nonaff1)*0.05, 0.0,
            -0.35, -0.5+Math.sin(nonaff1)*0.05, 0.0,
            -0.25, -0.55+Math.sin(nonaff1)*0.05, 0.0,
      
      //third bar
            -0.45, -0.3+Math.cos(nonaff)*0.05, 0.0,
            -0.55, -0.3+Math.cos(nonaff)*0.05, 0.0,
            -0.45, -0.4+Math.cos(nonaff)*0.05, 0.0,
      
            -0.55, -0.3+Math.cos(nonaff)*0.05, 0.0,
            -0.55, -0.4+Math.cos(nonaff)*0.05, 0.0,
            -0.45, -0.4+Math.cos(nonaff)*0.05, 0.0,
      
            -0.45, -0.4+Math.cos(nonaff)*0.05, 0.0,
            -0.55, -0.4+Math.cos(nonaff)*0.05, 0.0,
            -0.45, -0.45+Math.cos(nonaff)*0.05, 0.0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 132;
    
    
    
    requestAnimFrame(tick);

    //when counter hits 0 i.e. factor is at 1.5 or 0.5 times original size, reverse the scaling
    if(counter == 0)
    {
            
        scalar = scalar * (-1);
        //reset counter
        counter = 100;
    
    }
    //incrase/decrease size
    factor+=scalar;
    
    counter--;
    
    
    draw();
    animate();
}
