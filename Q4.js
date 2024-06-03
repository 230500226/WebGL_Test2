//step 1 move the shdaer to a separete js file called shader.js for example
//step 2 import the shaders here 
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./shaders.js";

function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorSpan = document.createElement('p');
    errorSpan.innerText = errorText;
    errorBoxDiv.appendChild(errorSpan);
    console.error(errorText);
}

showError("This is Q4");

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
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError('Compile vertex error: ' + errorMessage);
        return;
    }


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

    const moveXLocation = gl.getUniformLocation(program, 'moveX');
    const moveYLocation = gl.getUniformLocation(program, 'moveY');
    const rotateXLocation = gl.getUniformLocation(program, 'u_rotateX');
    const rotateYLocation = gl.getUniformLocation(program, 'u_rotateY');
    const rotateZLocation = gl.getUniformLocation(program, 'u_rotateZ');

    const perspectiveLocation = gl.getUniformLocation(program, 'u_perspective')
    const viewLocation = gl.getUniformLocation(program, 'u_view');

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing for a 3d object

    // Used later for perspective i lied about this its just here now because
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    var perspectiveMatrixOutput = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

        //NOTE: it take the identity matrix and an input and modifies it within the function
    perspective(perspectiveMatrixOutput, 75 * Math.PI / 180, canvas.width / canvas.height, 0.1, 10000);  
    
    const viewMatrixOutput = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    // Its meant to place the camera at a position in x,y and z whatever that means
    translator(viewMatrixOutput, viewMatrixOutput, [0, 0, 1]);
    invert(viewMatrixOutput, viewMatrixOutput);

    var moveX = 0.0;
    var moveY = 0.0;
    var rotateX = 0.0;
    var rotateY = 0.0;
    var rotateZ = 0.0;

    function animate() {
        requestAnimationFrame(animate);
        gl.clearColor(0.0, 0.2, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1f(moveXLocation, moveX);
        gl.uniform1f(moveYLocation, moveY);

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

        gl.uniformMatrix4fv(perspectiveLocation, false, perspectiveMatrixOutput);
        gl.uniformMatrix4fv(viewLocation, false, viewMatrixOutput);

        //first square red
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawArrays(gl.TRIANGLES, 3, 3);
        //second square blue
        gl.drawArrays(gl.TRIANGLES, 6, 3);
        gl.drawArrays(gl.TRIANGLES, 9, 3);
    }
    animate();

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
//start of perspective function
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }//End of perspective funciton

  //Start of tranlator function 
   function translator(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }//End of translator function

  //Start of invert function
  function invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }//End of invert function
