window.BioShaders = {
    liquidCell: {
        uniforms: {
            "time": { value: 0.0 },
            "colorC": { value: new THREE.Color(0x0ea5e9) }, 
            "colorG": { value: new THREE.Color(0x38bdf8) }  
        },
        vertexShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                
                vec3 newPosition = position;
                float displacement = sin(position.x * 3.0 + time * 2.0) * 0.05 
                                   + cos(position.y * 3.0 + time * 1.5) * 0.05;
                newPosition += normal * displacement;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 colorC;
            uniform vec3 colorG;
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vPositionNormal), 2.5);
                float pulse = sin(time * 3.0) * 0.1 + 0.9;
                vec3 finalColor = mix(colorC * pulse, colorG, intensity * 1.5);
                gl_FragColor = vec4(finalColor, 0.85); 
            }
        `
    }
};
