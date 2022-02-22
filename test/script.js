var canvas, gl, shaderProgram;
var drawCollection = []; //{type: int, points: [1,] array, color: [1,4] array, isDrawing: bool}
var arrayDrawingPoligon = [];
var isDrawing = false;
var pen = 0;
var distanceThreshold = 0.02;

window.onload = function() {
    canvas = initCanvas("canvas");
    gl = initGL(canvas);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function(e) {
        onCanvasMouseDown(e, canvas, gl);
    }
    canvas.onmousemove = function(e) {
        onCanvasMouseMove(e, canvas, gl);
    }
    canvas.onmouseup = function(e) {
        onCanvasMouseUp(e, canvas, gl);
    }

    document.getElementById("drawLine").onclick = function () {pen = 0;}
    document.getElementById("drawRectangle").onclick = function () {pen = 2;}
    document.getElementById("drawSquare").onclick = function () {pen = 1;}
    document.getElementById("drawPolygon").onclick = function () {pen = 3;}
}

function onCanvasMouseDown(e, canvas, gl) {
    var x = e.pageX - gl.canvas.offsetLeft;
    var y = e.pageY - gl.canvas.offsetTop;
    x = (x - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - y) / (canvas.height / 2);

    // if pen = draw garis
    if (pen == 0) {
        isDrawing = !isDrawing;

        if (isDrawing) {
            // add new point, point 1 = anchor point, point 2 = moving point untuk ditangani onMouseMove()
            drawCollection.push({type: 0, points: [x, y, x, y], color: null, isDrawing: true});
        } else {
            // finalize moving point
            for (var i = 0; i < drawCollection.length; i++) {
                if (drawCollection[i].type == 0 && drawCollection[i].isDrawing == true) {
                    drawCollection[i].points[2] = x;
                    drawCollection[i].points[3] = y;
                    drawCollection[i].isDrawing = false;
                }
            }
        }
    }

    // if pen = draw rectangle
    if (pen == 2){
        isDrawing = true


        drawCollection.push({type: 2, points: [x, y, x, y, x, y, x, y], color: [0.1, 0.1, 0.9, 1.0], isDrawing: true});
    }

    if (pen == 1) {
        var r1 = Math.random();
        var b1 = Math.random();
        var g1 = Math.random();
        isDrawing = true;
        drawCollection.push({
            type: 1, 
            points: [x, y, x, y, x, y,x, y], 
            color: [r1, b1, g1, 1.0], 
            isDrawing: true}
        );
    }
    // if pen = draw poligon
    if (pen == 3) {
        var new_point = true;

        if (!isDrawing) {
            isDrawing = true;
        }

        // jika sedang menggambar poligon
        if (arrayDrawingPoligon.length > 0) {
            // jika poligon ingin ditutup
            if (Math.abs(arrayDrawingPoligon[0]-x) <= distanceThreshold && Math.abs(arrayDrawingPoligon[1]-y) <= distanceThreshold) {
                isDrawing = !isDrawing;
                new_point = false;
            }
        }

        // jika menambah titik baru ke poligon yang ingin digambar
        if (new_point) {
            if (arrayDrawingPoligon.length == 0) {
                arrayDrawingPoligon.push(x, y);
            }
            arrayDrawingPoligon.push(x, y);
            // catatan: pemeriksaan jika poligon self-intersect dilakukan nanti
        }
        // jika menutup poligon
        else {
            // remove titik terakhir karena pasti tidak persis sama dengan titik awal
            arrayDrawingPoligon.splice(arrayDrawingPoligon.length-2, 2);

            
            // pindahkan array drawing poligon ke draw collection sebagai poligon object

            // untuk colors sementara doang, mager nyari cara generate bilangan random di javascript
            // nanti bisa pake global variable color yang di select dari menu tools
            drawCollection.push({type: 3, points: arrayDrawingPoligon, color: [6/arrayDrawingPoligon.length, arrayDrawingPoligon.length/120, 1-6/arrayDrawingPoligon.length, 1.0], isDrawing: false});
            arrayDrawingPoligon = []
        }
    }

    render();
}

function onCanvasMouseMove(e, canvas, gl) {
    // jika mouse moving dan sudah meng-klik mouse jumlah ganjil (start drawing, ATAU start-end-start drawing, ATAU ...)
    if (!isDrawing) {
        return;
    }

    // POSISI TITIK X
    var x = e.pageX - gl.canvas.offsetLeft;
    // POSISI TITIK Y 
    var y = e.pageY - gl.canvas.offsetTop;
    // POSISI X dalam clip space
    x = (x - canvas.width / 2) / (canvas.width / 2);
    // POSISI Y dalam clip space
    y = (canvas.height / 2 - y) / (canvas.height / 2);

    // jika drawing menggunakan pen garis
    if (pen == 0) {
        for (var i = 0; i < drawCollection.length; i++) {
            // cari garis mana yang sedang digambar
            if (drawCollection[i].type == 0 && drawCollection[i].isDrawing == true) {
                // update point 2 (moving point)
                drawCollection[i].points[2] = x;
                drawCollection[i].points[3] = y;
            }
        }
    }

    //jika drawing menggunakan rectangle
    if (pen == 2){

        for (var i = 0; i < drawCollection.length; i++) {
            // cari rectangle mana yang sedang digambar
            if (drawCollection[i].type == 2 && drawCollection[i].isDrawing == true) {
                //update lokasi titik sudut
                drawCollection[i].points[3] = y;
                drawCollection[i].points[4] = x;
                drawCollection[i].points[5] = y;
                drawCollection[i].points[6] = x;
            }
        }
    }

    //put point 
    if (pen == 1){

        for (var i = 0; i < drawCollection.length; i++) {
            // cari rectangle mana yang sedang digambar
            if (drawCollection[i].type == 1 && drawCollection[i].isDrawing == true) {
                //0  1   2  3  4  5  6  7 8 9 10 11
                //x  y   x  y  x  y  x  y x y  x  y
                console.log("ini X");
                console.log(x);
                console.log("ini Y");
                console.log(y);
                // //berubah sumbu x
                drawCollection[i].points[6] =   x;
                //berubah sumbu y
                drawCollection[i].points[3] = -x;
                //berubah kedua sumbu
                drawCollection[i].points[4] = x ;
                drawCollection[i].points[5] = -x; 

                // MENCOBA
                // if(x < 0){
                //         drawCollection[i].points[6] =  x;
                //         //berubah sumbu y
                //         drawCollection[i].points[3] = drawCollection[i].points[1];
                //         //berubah kedua sumbu
                //         drawCollection[i].points[4] = x ;
                //         drawCollection[i].points[5] = drawCollection[i].points[3];                   
                // }else{
                //     drawCollection[i].points[6] =  x;
                //     //berubah sumbu y
                //     drawCollection[i].points[3] = -x;
                //     //berubah kedua sumbu
                //     drawCollection[i].points[4] = x ;
                //     drawCollection[i].points[5] = -x;                   
                // }
                // for(var j = 0; j < drawCollection[i].points.length; j++){
                //     if(j != 0 && j != 1 && drawCollection[i].points[j] <= 0){
                //         // //berubah sumbu x
                //         drawCollection[i].points[6] =  x;
                //         //berubah sumbu y
                //         drawCollection[i].points[3] = -x;
                //         //berubah kedua sumbu
                //         drawCollection[i].points[4] = x ;
                //         drawCollection[i].points[5] = -x;                   
                //     }else{
                //         // //berubah sumbu x
                //         drawCollection[i].points[6] =   x;
                //         //berubah sumbu y
                //         drawCollection[i].points[3] = -x;
                //         //berubah kedua sumbu
                //         drawCollection[i].points[4] = x ;
                //         drawCollection[i].points[5] = -x;    
                //     }
                // }
                

            }        
        }
    }
    // jika drawing menggunakan pen poligon
    if (pen == 3) {
        if (isDrawing) {
            // karena hanya array 1-d biasa, untuk update poin dari poligon yang sedang digambar, hanya perlu ubah elemen terakhir
            var i = arrayDrawingPoligon.length;
            arrayDrawingPoligon[i-2] = x;
            arrayDrawingPoligon[i-1] = y;
        }
    }
    
    render();
}

function onCanvasMouseUp(e, canvas, gl){
    if (!isDrawing && pen != 2 && pen != 1) {
        return;
    }

    for (var i = 0; i < drawCollection.length; i++) {
        if (drawCollection[i].type == 2 || drawCollection[i].type == 1 && drawCollection[i].isDrawing == true) {
            drawCollection[i].isDrawing = false;
        }
    }

    isDrawing = false;

    render()
}

// fungsi render

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < drawCollection.length; i++) {
        // if objek yang digambar adalah garis
        if (drawCollection[i].type == 0) {
            // garis = line + points
            renderLine(gl, drawCollection[i].points);
            renderPoints(gl, drawCollection[i].points);
        }
        // if objek yang digambar adalah poligon
        else if (drawCollection[i].type == 3 || drawCollection[i].type == 2 || drawCollection[i].type == 1) {
            // render poligon from points to triangles
            let success = renderPolygon(gl, drawCollection[i]);
            // jika sukses, gambar juga titik-titiknya
            if (success) {
                renderPoints(gl, drawCollection[i].points);
            }
        }

    }

    // render drawing poligon selalu terakhir
    renderDrawingPoligon(gl, arrayDrawingPoligon);
    renderPoints(gl, arrayDrawingPoligon);
}

function renderDrawingPoligon(gl, drawingPoligonBuffer) {
    if (drawingPoligonBuffer.length > 2) {
        // gunakan line shader, warna tidak bisa dipilih
        var linesShaderProgram = createLinesShaderProgram(gl);
        gl.useProgram(linesShaderProgram);
        
        // standard web gl shader setup
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        var positionLocation = gl.getAttribLocation(linesShaderProgram, "a_position");

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawingPoligonBuffer), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        // draw menggunakan line strips
        gl.drawArrays(gl.LINE_STRIP, 0, Math.floor(drawingPoligonBuffer.length/2));
        return true;
    } else {
        return false;
    }
}

function renderPolygon(gl, drawObject) {
    poligonPoints = drawObject.points;
    var colors = [];
    console.log("INI ADALAH POLYGON POINTS",poligonPoints);
    // ubah poligon dalam bentuk ordered 1-d set of points menjadi array 1-d points dimana 
    //setiap 6 elemen merepresentasikan 3 vertex dari satu segitiga (x0, y0, x1, y1, x2, y2)
    var polygonBuffer = poligonPointsToTriangles(poligonPoints);
    // push colors, implementasi nanti mungkin berubah
    for (var j = 0; j < polygonBuffer.length; j++) {
        colors.push(drawObject.color[0], drawObject.color[1], drawObject.color[2], drawObject.color[3]);
    }

    console.log("INI ADALAH POLYGONBUFFER",polygonBuffer);
    // jika minimal ada 6 nilai a.k.a. tiga vertex
    if (polygonBuffer.length >= 6) {
        // gunakan shapes shader, shader titik dua dimensi tanpa matriks transformasi dan warna bisa diubah
        var shapesShaderProgram = createShapesShaderProgram(gl);
        gl.useProgram(shapesShaderProgram);

        // standard web gl shader setup
        var positionLocation = gl.getAttribLocation(shapesShaderProgram, "a_position");
        var colorLocation = gl.getAttribLocation(shapesShaderProgram, "a_color");

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygonBuffer), gl.STATIC_DRAW);

        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

        var size = 4;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

        // draw menggunakan triangles
        gl.drawArrays(gl.TRIANGLES, 0, Math.floor(polygonBuffer.length/2));
        return true;
    } else {
        return false;
    }
}

function renderLine(gl, lineBuffer) {
    // line harus 2 vertex a.k.a. 4 nilai
    if (lineBuffer.length == 4) {
        // gunakan line shader, warna tidak bisa dipilih
        var linesShaderProgram = createLinesShaderProgram(gl);
        gl.useProgram(linesShaderProgram);
        
        // standard web gl shader setup
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        var positionLocation = gl.getAttribLocation(linesShaderProgram, "a_position");

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineBuffer), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        // draw kedua titik menggunakan lines
        // mungkin tidak efisien, optimization yang mungkin:
        //      untuk sederet drawCollection element yang semuanya tipe line,
        //      gambar sekaligus menggunakan satu program shader
        gl.drawArrays(gl.LINES, 0, 2);
        return true;
    } else {
        return false;
    }
}

function renderPoints(gl, pointBuffer) {
    // draw n points
    var pointsShaderProgram = createPointsShaderProgram(gl);
    gl.useProgram(pointsShaderProgram);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // standard web gl shader setup
    var positionLocation = gl.getAttribLocation(pointsShaderProgram, "a_position");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointBuffer), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // draw points
    gl.drawArrays(gl.POINTS, 0, Math.floor(pointBuffer.length/2));
}




// {Bagian Poligon}

// fungsi poligon

// fungsi untuk periksa jika poligon hasil triangulasi merupakan valid (tidak menjadi self-intersect)

// periksa intersection dua bagian garis

function isPointOnSegment(x0, y0, x1, y1, x2, y2) {
    if (x1 <= Math.max(x0, x2) && x1 >= Math.min(x0, x2) && y1 <= Math.max(y0, y2) && y1 >= Math.min(y0, y2)) {
        return true;
    } else {
        return false;
    }
}

function cycleOrder(x0, y0, x1, y1, x2, y2) {
    var val = (y1 - y0) * (x2 - x1) - (x1 - x0) * (y2 - y1);

    if (val == 0) {
        return 0; // gradien P1-P2-P3 sama
    } else if (val > 0) {
        return 1; // siklus P1-P2-P3 searah jarum jam
    } else {
        return 2; // siklus P1-P2-P3 berlawanan arah jarum jam
    }
}

function checkIntersect(x0, y0, x1, y1, x2, y2, x3, y3) {
    var cycleOrder1 = cycleOrder(x0, y0, x1, y1, x2, y2);
    var cycleOrder2 = cycleOrder(x0, y0, x1, y1, x3, y3);
    var cycleOrder3 = cycleOrder(x2, y2, x3, y3, x0, y0);
    var cycleOrder4 = cycleOrder(x2, y2, x3, y3, x1, y1);

    // Jika intersect
    if (cycleOrder1 != cycleOrder2 && cycleOrder3 != cycleOrder4)
        return true;

    // Jika ada yang paralel
    if (cycleOrder1 == 0 && isPointOnSegment(x0, y0, x1, y1, x2, y2)) {
        return true;
    }

    if (cycleOrder2 == 0 && isPointOnSegment(x0, y0, x1, y1, x3, y3)) {
        return true;
    }

    if (cycleOrder3 == 0 && isPointOnSegment(x2, y2, x3, y3, x0, y0)) {
        return true;
    }

    if (cycleOrder4 == 0 && isPointOnSegment(x2, y2, x3, y3, x1, y1)) {
        return true;
    }

    return false;
}

// hitung area poligon sembarang non-self-intersecting

function polygon_area(arrayPoints) {
    var area = 0;
    var l = arrayPoints.length;
    if (l > 4) {
        for (var i = 0; i < l; i += 2) {
            area += arrayPoints[i%l]*arrayPoints[(i+3)%l]-arrayPoints[(i+1)%l]*arrayPoints[(i+2)%l];
        }
    }
    area = Math.abs(area/2);
    return area;
}

// algoritma pencarian O(n^2)

function find_ear(arrayPoligon) {
    var l = arrayPoligon.length;
    if (l == 6) {
        return [arrayPoligon, []];
    }
    else if (l > 6) {
        for (var i = 0; i < l; i += 2) {
            var arrayEar = [arrayPoligon[(i-2+l)%l], arrayPoligon[(i-1+l)%l], arrayPoligon[(i+l)%l], arrayPoligon[(i+1+l)%l], arrayPoligon[(i+2+l)%l], arrayPoligon[(i+3+l)%l]];

            var intersect = false;

            var x0 = arrayEar[0];
            var y0 = arrayEar[1];
            var x1 = arrayEar[4];
            var y1 = arrayEar[5];

            var arrayRemainder = [];

            for (var j = 0; j < l; j += 2) {
                if (j != i%l) {
                    arrayRemainder.push(arrayPoligon[j], arrayPoligon[j+1]);

                    if (j != (i-2+l)%l && j != (i+2+l)%l && j != (i-4+l)%l) {
                        intersect = intersect || checkIntersect(x0, y0, x1, y1, arrayPoligon[(j+l)%l], arrayPoligon[(j+1+l)%l], arrayPoligon[(j+2+l)%l], arrayPoligon[(j+3+l)%l]);
                    }
                }
            }

            if (!intersect && Math.abs(polygon_area(arrayEar) + polygon_area(arrayRemainder) - polygon_area(arrayPoligon)) < 0.00000001) {
                return [arrayEar, arrayRemainder];
            }
        }
    }
    return [[], arrayPoligon];
}

// fungsi triangulasi

function poligonPointsToTriangles(poligonPoints) {
    //Copy point from poligon point to temporary
    var poligonPointsCopy = [];
    for (var i = 0; i < poligonPoints.length; i++) {
        poligonPointsCopy.push(poligonPoints[i]);
    }
    var earPoligon = [];
    var poligonTriangles = [];
    // console.log("INI POLIGON POINT COPY");
    // console.log(poligonPointsCopy);

    while (poligonPointsCopy.length > 4) {
        earPoligon = [];
        var resArrays = find_ear(poligonPointsCopy);
        earPoligon = resArrays[0];
        poligonPointsCopy = resArrays[1];
        if (earPoligon.length == 0) {
            break;
        } else {
            for (var i = 0; i < 6; i ++) {
                poligonTriangles.push(earPoligon[i]);
            }
        }
    }
    if (earPoligon.length == 0) {
        console.log("Error: Poligon tidak boleh menyilang");
        poligonTriangles = [];
    }

    return poligonTriangles;
}