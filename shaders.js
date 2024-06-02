const vertexShaderSourceCode = `
    precision mediump float;

    attribute vec3 position;
    attribute vec2 texture; 
    varying vec2 vTexture;
    uniform float moveX;
    uniform float moveY;

    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    uniform mat4 u_rotateZ;

    //step5 create the uniform for the perspective and view
    uniform mat4 u_perspective;
    uniform mat4 u_view;

    void main() {
        vTexture = texture;
        gl_Position = u_perspective * u_view * u_rotateX * u_rotateY * u_rotateZ * vec4(position.x + moveX, position.y + moveY, position.z, 1);
    }
`;

const fragmentShaderSourceCode =`
    precision mediump float;
    
    varying vec2 vTexture;
    uniform sampler2D sampler; 
    
    void main() {
        gl_FragColor = texture2D(sampler, vTexture);
    }
`;

export {vertexShaderSourceCode, fragmentShaderSourceCode}