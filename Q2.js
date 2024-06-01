function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

showError("This is Q2");

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
        -0.5, -0.5, 0, //bot left
        -0.5, 0.5, 0, //top left
        0.5, 0.5, 0, //top right

        0.5, 0.5, 0, //top right
        0.5, -0.5, 0, //bot right
        -0.5, -0.5, 0, //bot left

        //square 2
        -0.5, -0.5, -1, //bot left
        -0.5, 0.5, -1, //top left
        0.5, 0.5, -1, //top right

        0.5, 0.5, -1, //top right
        0.5, -0.5, -1, //bot right
        -0.5, -0.5, -1, //bot left
    ];
    
    const textureData = [ //step1 replace the colordata with texturedata coordinates
        // I swapped the y values around to flip the image the rightside up
        // Corresponding to Triangle 1
        0, 1, //bot left
        0, 0, //top left
        1, 0, //top right

        // Corresponding to Triangle 2
        1, 0, //top right
        1, 1,  //bot right
        0, 1, //bot left

        // Corresponding to Triangle 1
        0, 1, //bot left
        0, 0, //top left
        1, 0, //top right

        // Corresponding to Triangle 2
        1, 0, //top right
        1, 1,  //bot right
        0, 1, //bot left
    ]

    // Position buffer for position attribute
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // step2 create textture buffer 
    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureData), gl.STATIC_DRAW);
    
    const vertexShaderSourceCode = `
        precision mediump float;

        attribute vec3 position;
        attribute vec2 texture; //step3 change to vec 2 and call it texture
        varying vec2 vTexture;

        void main() {
            vTexture = texture;
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
    
        varying vec2 vTexture;
        uniform sampler2D sampler; //step4 add this line then use the texture2D instead
    
        void main() {
            gl_FragColor = texture2D(sampler, vTexture);
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

    //step5 set up the texture location
    const textureLocation = gl.getAttribLocation(program, `texture`);
    if (textureLocation < 0) {
        showError(`Failed to get attribute location for texture`);
        return;
    }
    gl.enableVertexAttribArray(textureLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 0, 0);

    //step6 create the texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //set the texure picture here by id see the index.html
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('pictureID'));

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
