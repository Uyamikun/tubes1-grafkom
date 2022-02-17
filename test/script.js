var canvas, gl, shaderProgram;
var drawBuffer = [];
var arrayGaris = [];
var arrayPoligon = [];
var arrayDrawingPoligon = [];
var isDrawing = false;
var pen = 0;
var distanceThreshold = 0.02;

window.onload = function() {
    canvas = initCanvas("canvas");console.log(canvas);
    gl = initGL(canvas);console.log(gl);
    shaderProgram = initProgram(gl);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    canvas.onmousedown = function(e) {
        onCanvasMouseDown(e, positionLocation, canvas, gl);
    }
    canvas.onmousemove = function(e) {
        onCanvasMouseMove(e, positionLocation, canvas, gl);
    }

    document.getElementById("drawLine").onclick = function () {pen = 0;}
    document.getElementById("drawPolygon").onclick = function () {pen = 3;}
}

function onCanvasMouseDown(e, positionLocation, canvas, gl) {
    var x = e.pageX - gl.canvas.offsetLeft;
    var y = e.pageY - gl.canvas.offsetTop;
    x = (x - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - y) / (canvas.height / 2);

    if (pen == 0) {
        var new_point = true;
        isDrawing = !isDrawing;

        for (var ii = 0; ii < arrayGaris.length; ii += 2) {
            if (Math.abs(arrayGaris[ii]-x) <= distanceThreshold && Math.abs(arrayGaris[ii+1]-y) <= distanceThreshold) {
                new_point = false;
                if (arrayGaris.length > 2) {
                    if (ii % 4 == 0) {
                        arrayGaris.push(arrayGaris[ii+2], arrayGaris[ii+3], arrayGaris[ii], arrayGaris[ii+1]);
                        arrayGaris.splice(ii, 4);
                    } else {
                        arrayGaris.push(arrayGaris[ii-2], arrayGaris[ii-1], arrayGaris[ii], arrayGaris[ii+1]);
                        arrayGaris.splice(ii-2, 4);
                    }
                } else {
                    arrayGaris = []
                }
                break;
            }
        }

        if (new_point) {
            arrayGaris.push(x, y);
            arrayGaris.push(x, y);
        }
    }

    if (pen == 3) {
        var new_point = true;

        if (!isDrawing) {
            isDrawing = true;
        }

        if (arrayDrawingPoligon.length > 0) {
            if (Math.abs(arrayDrawingPoligon[0]-x) <= distanceThreshold && Math.abs(arrayDrawingPoligon[1]-y) <= distanceThreshold) {
                isDrawing = !isDrawing;
                new_point = false;
            }
        }

        if (new_point) {
            arrayDrawingPoligon.push(x, y);
            arrayDrawingPoligon.push(x, y);
        } else {
            arrayDrawingPoligon.splice(arrayDrawingPoligon.length-2, 2);
            arrayDrawingPoligon.push(arrayDrawingPoligon[0], arrayDrawingPoligon[1]);
            var tempPoligon = [];
            for (var i = 0; i < arrayDrawingPoligon.length; i += 2) {
                tempPoligon.push(arrayDrawingPoligon[i], arrayDrawingPoligon[i+1]);
            }
            arrayPoligon.push(tempPoligon);
            arrayDrawingPoligon = [];
        }
    }

    render(positionLocation);
}

function onCanvasMouseMove(e, positionLocation, canvas, gl) {
    if (!isDrawing) {
        return;
    }
    var x = e.pageX - gl.canvas.offsetLeft;
    var y = e.pageY - gl.canvas.offsetTop;
    x = (x - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - y) / (canvas.height / 2);

    if (pen == 0) {
        i = arrayGaris.length;
        arrayGaris.push(x, y);
        arrayGaris.splice(i-2, 2);
    }
    if (pen == 3) {
        if (isDrawing) {
            var i = arrayDrawingPoligon.length;
            arrayDrawingPoligon.push(x, y);
            arrayDrawingPoligon.splice(i-2, 2);
        }
    }
    
    render(positionLocation)
}

function render(positionLocation) {
    drawBuffer = [];

    for (var i = 0; i < arrayPoligon.length; i++) {
        for (var j = 0; j < arrayPoligon[i].length; j++) {
            drawBuffer.push(arrayPoligon[i][j]);
        }
    }

    for (var i = 0; i < arrayGaris.length; i++) {
        drawBuffer.push(arrayGaris[i]);
    }

    for (var i = 0; i < arrayDrawingPoligon.length; i++) {
        drawBuffer.push(arrayDrawingPoligon[i]);
    }

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawBuffer), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    var n = Math.floor(arrayGaris.length/2);
    var p = 0;
    if (n % 2 == 1) {
        n--;
        p = 1;
    }

    var o = 0;

    for (var i = 0; i < arrayPoligon.length; i++) {
        gl.drawArrays(gl.LINE_STRIP, o, Math.floor(arrayPoligon[i].length/2));
        o += Math.floor(arrayPoligon[i].length/2);
    }

    if (arrayGaris.length > 0) {
        gl.drawArrays(gl.LINES, o, Math.floor(arrayGaris.length/2));
        o += Math.floor(arrayGaris.length/2)
    }

    if (arrayDrawingPoligon.length > 0) {
        gl.drawArrays(gl.LINE_STRIP, o, Math.floor(arrayDrawingPoligon.length/2));
        o += Math.floor(arrayDrawingPoligon.length/2)
    }
    
    gl.drawArrays(gl.POINTS, 0, Math.floor(drawBuffer.length/2));
}