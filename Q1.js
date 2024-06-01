function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

showError("This is Q1");

function main(){
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
    
    const vertexData = [
        //square 1 
        -0.5, -0.5, 0,
        -0.5, 0.5, 0,
        0.5, 0.5, 0,

        0.5, 0.5, 0,
        0.5, -0.5, 0,
        -0.5, -0.5, 0,

        //square 2
        -0.5, -0.5, -1,
        -0.5, 0.5, -1,
        0.5, 0.5, -1,

        0.5, 0.5, -1,
        0.5, -0.5, -1,
        -0.5, -0.5, -1,
    ];
    
    const colorData = [
        //square 2
        0,0,1,
        0,0,1,
        0,0,1,
        
        0,0,1,
        0,0,1,
        0,0,1,
        //square 1 
        1,0,0,
        1,0,0,
        1,0,0,

        1,0,0,
        1,0,0,
        1,0,0,
    ];

    // Position buffer for position attribute
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // Color buffer for color attribute
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    
    const vertexShaderSourceCode = `
        precision mediump float;

        attribute vec3 position;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
            vColor = color;
            gl_Position = vec4(position, 1);
        }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError('Compile vertex error: ' + errorMessage);
        return;
    }

    const fragmentShaderSourceCode =`
        precision mediump float;
    
        varying vec3 vColor;
    
        void main() {
            gl_FragColor = vec4(vColor, 1);
        }
    `;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        const compileError = gl.getShaderInfoLog(fragmentShader);
            showError('compile fragment error: ' + compileError);
                return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(program);
    showError(`Failed to link GPU program: ${errorMessage}`);
        return;
    }

    const positionLocation = gl.getAttribLocation(program, `position`);
    if (positionLocation < 0) {
        showError(`Failed to get attribute location for position`);
        return;
    }
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);


    const colorLocation = gl.getAttribLocation(program, `color`);
    if (colorLocation < 0) {
        showError(`Failed to get attribute location for color`);
        return;
    }
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing for a 3d object

    // Used later for perspective 
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    function animate() {
        //requestAnimationFrame(animate);
        gl.clearColor(0.0, 0.2, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //first square red
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawArrays(gl.TRIANGLES, 3, 3);
        //second square blue
        gl.drawArrays(gl.TRIANGLES, 6, 3);
        gl.drawArrays(gl.TRIANGLES, 9, 3);
    }
    animate();
}

try {
    main();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}
