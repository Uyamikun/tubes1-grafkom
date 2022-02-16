function initCanvas(canvasID) {
    canvas = document.getElementById(canvasID);
 
    if(!canvas) {
        alert("Canvas is not available! :(");
		return null;
    }
 
	return canvas;
}
 
function initGL(canvas) {
    var names = [
        "webgl", "experimental-webgl",
        "webkit-3d", "moz-webgl"
    ];
 
    for(var i = 0; i < names.length; ++i) {
        try {
            gl = canvas.getContext(names[i], {preserveDrawingBuffer: true});console.log("i: " + i + "gl: " + gl);
        } catch(e) {}
 
        if(gl) {
            break; 
        }
    }
 
    if(!gl) {
        alert("WebGL is not available! :(");
		return null;
    }
 
	return gl;
}
 
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if(!shaderScript) {
        return null;
    }
 
    var str = "";
    var k = shaderScript.firstChild;
    while(k) {
        if(k.nodeType == 3) {
            str += k.textContent;
        }
 
        k = k.nextSibling;
    }
 
        var shader;
        if(shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else if(shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            return null;
        }
 
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
 
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
 
        return shader;
    }
 
function initProgram(gl) {
    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");
 
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
 
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders! :(");
    }
 
    gl.useProgram(shaderProgram);
 
	return shaderProgram;
}