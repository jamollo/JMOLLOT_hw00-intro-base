#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec3 fs_ObjectPos; // Interpolated object-space position.
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

// Deterministic 3D unit gradient at each integer lattice corner.
vec3 gradient(vec3 cell) {
    float h1 = fract(sin(dot(cell, vec3(127.1, 311.7, 74.7))) * 43758.5453);
    float h2 = fract(sin(dot(cell, vec3(269.5, 183.3, 246.1))) * 43758.5453);
    float z = 2.0 * h1 - 1.0;
    float angle = 6.2831853 * h2;
    float radius = sqrt(max(0.0, 1.0 - z * z));
    return vec3(radius * cos(angle), radius * sin(angle), z);
}

// 3D Perlin gradient noise: eight corners, quintic interpolation.
float perlin(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float n000 = dot(gradient(cell), f);
    float n100 = dot(gradient(cell + vec3(1, 0, 0)), f - vec3(1, 0, 0));
    float n010 = dot(gradient(cell + vec3(0, 1, 0)), f - vec3(0, 1, 0));
    float n110 = dot(gradient(cell + vec3(1, 1, 0)), f - vec3(1, 1, 0));
    float n001 = dot(gradient(cell + vec3(0, 0, 1)), f - vec3(0, 0, 1));
    float n101 = dot(gradient(cell + vec3(1, 0, 1)), f - vec3(1, 0, 1));
    float n011 = dot(gradient(cell + vec3(0, 1, 1)), f - vec3(0, 1, 1));
    float n111 = dot(gradient(cell + vec3(1, 1, 1)), f - vec3(1, 1, 1));

    float lower = mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y);
    float upper = mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y);
    return mix(lower, upper, u.z);
}

void main()
{
    // Material base color (before shading)
        float n = perlin(fs_ObjectPos * 5.0);
        float shade = clamp(0.5 + 0.5 * n, 0.0, 1.0);
        vec4 diffuseColor = vec4(u_Color.rgb * shade, u_Color.a);

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

        float ambientTerm = 0.2;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
