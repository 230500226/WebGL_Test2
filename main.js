function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

showError("Hello Test error 1");

function helloTriangle(){
    const canvas  = document.getElementById("IDcanvas");
    if (!canvas){
        showError("Can't find canvas reference");
        return;
    }
    const gl = canvas.getContext('webgl2');
    if (!gl){
        showError("Can't find webgl2 support");
        return;
    }
    
    const triangleVertices = [
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];
    
    const triangleVerticesCpuBuffer = new Float32Array(triangleVertices);

    const triangleGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW);

    const vertexShaderSourceCode = `
    precision mediump float;
    
    attribute vec3 vertexPosition;

    void main() {
    
       gl_Position = vec4(vertexPosition, 1.0);

    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        const compileError = gl.getShaderInfoLog(vertexShader);
            showError('compile vertex error: ' + compileError);
                return;
    }

    const fragmentShaderSourceCode = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(0.8,0,0,1);
    }`;


    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        const compileError = gl.getShaderInfoLog(fragmentShader);
            showError('compile fragment error: ' + compileError);
                return;
    }

    const triangleShaderProgram = gl.createProgram();
    gl.attachShader(triangleShaderProgram, vertexShader);
    gl.attachShader(triangleShaderProgram, fragmentShader);

    gl.linkProgram(triangleShaderProgram);
    if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)){
        const linkError = gl.getProgramInfoLog(triangleShaderProgram);
            showError('link program error:'+ linkError);
                return;
    }

    const vertexPositionAttributLocation = gl.getAttribLocation(triangleShaderProgram, 'vertexPosition');
    if (vertexPositionAttributLocation < 0) {
        showError('failed to get attribute location for vertexPosition');
            return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(triangleShaderProgram);
    gl.enableVertexAttribArray(vertexPositionAttributLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.vertexAttribPointer(vertexPositionAttributLocation,2,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLES, 0,3);
}

try {
    helloTriangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}
