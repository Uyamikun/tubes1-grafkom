function initCanvas(canvasID) {
    var canvas = document.getElementById(canvasID);
 
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
            gl = canvas.getContext(names[i], {preserveDrawingBuffer: true});
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
 
	return shaderProgram;
}

function createPointsShaderProgram(gl) {
    const program = gl.createProgram();
    if (!program) {
        console.log("Error creating program");
        return null;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
        console.log("Error creating shader");
        return null;
    }
    
    var vertexShaderCode = `
    attribute vec2 a_position;
    void main() {
        gl_PointSize = 5.0;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
    `;
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    const vertexShaderCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!vertexShaderCompiled) {
        const lastError = gl.getShaderInfoLog(vertexShader);
        console.log(lastError);
        return null;
    }

    const fragmentShaderCode = `
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }`;

    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    const fragmentShaderCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!fragmentShaderCompiled) {
        const lastError = gl.getShaderInfoLog(fragmentShader);
        console.log(lastError);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //if not linked
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const lastError = gl.getProgramInfoLog(program);
        console.log(lastError);
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createLinesShaderProgram(gl) {
    const program = gl.createProgram();
    if (!program) {
        console.log("Error creating program");
        return null;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
        console.log("Error creating shader");
        return null;
    }
    
    var vertexShaderCode = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
    `;
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    const vertexShaderCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!vertexShaderCompiled) {
        const lastError = gl.getShaderInfoLog(vertexShader);
        console.log(lastError);
        return null;
    }

    const fragmentShaderCode = `
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }`;

    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    const fragmentShaderCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!fragmentShaderCompiled) {
        const lastError = gl.getShaderInfoLog(fragmentShader);
        console.log(lastError);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //if not linked
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const lastError = gl.getProgramInfoLog(program);
        console.log(lastError);
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createShapesShaderProgram(gl) {
    const program = gl.createProgram();
    if (!program) {
        console.log("Error creating program");
        return null;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
        console.log("Error creating shader");
        return null;
    }
    
    var vertexShaderCode = `
    attribute vec2 a_position;
    attribute vec4 a_color;

    varying vec4 v_color;

    void main() {
        gl_Position = vec4(a_position, 0, 1);

        v_color = a_color;
    }
    `;
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    const vertexShaderCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!vertexShaderCompiled) {
        const lastError = gl.getShaderInfoLog(vertexShader);
        console.log(lastError);
        return null;
    }

    const fragmentShaderCode = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }`;

    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    const fragmentShaderCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!fragmentShaderCompiled) {
        const lastError = gl.getShaderInfoLog(fragmentShader);
        console.log(lastError);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //if not linked
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const lastError = gl.getProgramInfoLog(program);
        console.log(lastError);
        gl.deleteProgram(program);
        return null;
    }
    return program;
}