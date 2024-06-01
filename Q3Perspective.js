function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

showError("This is Q3");

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
    
    const textureData = [ 
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

    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureData), gl.STATIC_DRAW);
    
    const vertexShaderSourceCode = `
        precision mediump float;

        attribute vec3 position;
        attribute vec2 texture; 
        varying vec2 vTexture;
        //step1 add the uniforms (similar steps apply to the rotations just add buttons to the html)
        uniform float moveX;
        uniform float moveY;

        uniform mat4 u_rotateX;
        uniform mat4 u_rotateY;
        uniform mat4 u_rotateZ;

        void main() {
            vTexture = texture;
            //step2 add the uniform values to the position
            gl_Position = u_rotateX * u_rotateY * u_rotateZ * vec4(position.x + moveX, position.y + moveY, position.z, 1);
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
        uniform sampler2D sampler; 
    
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

    const textureLocation = gl.getAttribLocation(program, `texture`);
    if (textureLocation < 0) {
        showError(`Failed to get attribute location for texture`);
        return;
    }
    gl.enableVertexAttribArray(textureLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //set the texure picture here by id
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('pictureID'));

    //step3 get the uniform locations
    const moveXLocation = gl.getUniformLocation(program, 'moveX');
    const moveYLocation = gl.getUniformLocation(program, 'moveY');
    const rotateXLocation = gl.getUniformLocation(program, 'u_rotateX');
    const rotateYLocation = gl.getUniformLocation(program, 'u_rotateY');
    const rotateZLocation = gl.getUniformLocation(program, 'u_rotateZ');

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing for a 3d object

    // Used later for perspective 
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    //step4 initialise the move varibles
    var moveX = 0.0;
    var moveY = 0.0;
    let rotateX = 0.0;
    let rotateY = 0.0;
    let rotateZ = 0.0;

    function animate() {
        requestAnimationFrame(animate);
        gl.clearColor(0.0, 0.2, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //step5 update the uniforms in the animation funciton
        gl.uniform1f(moveXLocation, moveX);
        gl.uniform1f(moveYLocation, moveY);

        //step7 rotation matrix        
        const matrixX = [
            1, 0, 0, 0,
            0, Math.cos(rotateX), -Math.sin(rotateX), 0,
            0, Math.sin(rotateX), Math.cos(rotateX), 0,
            0, 0, 0, 1
        ]

        const matrixY = [
            Math.cos(rotateY), 0, Math.sin(rotateY), 0,
            0, 1, 0, 0,
            -Math.sin(rotateY), 0, Math.cos(rotateY), 0,
            0, 0, 0, 1
        ]

        const matrixZ = [
            Math.cos(rotateZ), -Math.sin(rotateZ), 0, 0,
            Math.sin(rotateZ), Math.cos(rotateZ), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]

        gl.uniformMatrix4fv(rotateXLocation, false, matrixX);
        gl.uniformMatrix4fv(rotateYLocation, false, matrixY);
        gl.uniformMatrix4fv(rotateZLocation, false, matrixZ);

        //first square red
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawArrays(gl.TRIANGLES, 3, 3);
        //second square blue
        gl.drawArrays(gl.TRIANGLES, 6, 3);
        gl.drawArrays(gl.TRIANGLES, 9, 3);
    }
    animate();

    //step6 event listeners for the keys pressed
    document.addEventListener('keydown', function (event) {
        const moveAmount = 0.05;
        switch (event.key) {
            case 'ArrowUp':
                moveY += moveAmount;
                break;
            case 'ArrowDown':
                moveY -= moveAmount;
                break;
            case 'ArrowLeft':
                moveX -= moveAmount;
                break;
            case 'ArrowRight':
                moveX += moveAmount;
                break;
        }
    });

    document.getElementById('rotateX').addEventListener('click', function () {
        rotateX += 0.1;
    });
    document.getElementById('rotateY').addEventListener('click', function () {
        rotateY += 0.1;
    });
    document.getElementById('rotateZ').addEventListener('click', function () {
        rotateZ += 0.1;
    });
}

try {
    main();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}
