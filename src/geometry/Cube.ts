import {vec3, vec4, mat4, glMatrix} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  buffer: ArrayBuffer;
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {

    let faceCount = 6;
    let triCount = 12;
    let vertCount = 24;

    this.buffer = new ArrayBuffer(
      // indices
      triCount * 3 * Uint32Array.BYTES_PER_ELEMENT +
      // normals
      vertCount * 4 * Float32Array.BYTES_PER_ELEMENT +
      // positions
      vertCount * 4 * Float32Array.BYTES_PER_ELEMENT
    );

    const indexByteOffset = 0;
    const normalByteOffset = triCount * 3 * Uint32Array.BYTES_PER_ELEMENT;
    const positionByteOffset = normalByteOffset + (vertCount * 4 * Float32Array.BYTES_PER_ELEMENT);
    this.indices = new Uint32Array(this.buffer, indexByteOffset, triCount * 3);
    this.normals = new Float32Array(this.buffer, normalByteOffset, vertCount * 4);
    this.positions = new Float32Array(this.buffer, positionByteOffset, vertCount * 4);

    // fill temp verts array
    let startVert = vec4.fromValues(this.center[0] - 0.5, 
                                      this.center[1] - 0.5, 
                                      this.center[2] + 0.5, 
                                      1);      
    for (let face = 0; face < 6; face++) {
      let currMat = mat4.create();
      // init bottom left corner of front face
      let currVert = vec4.create();   
      //side faces
      if (face < 4) {
        mat4.fromYRotation(currMat, glMatrix.toRadian(90 * face));
      } else if (face === 4) {
        // bottom face
        mat4.fromXRotation(currMat, glMatrix.toRadian(90));
        mat4.rotateZ(currMat, currMat, glMatrix.toRadian(90));
      } else if (face === 5) {
        // top face
        mat4.fromXRotation(currMat, glMatrix.toRadian(-90));
        mat4.rotateZ(currMat, currMat, glMatrix.toRadian(90));
      }
      // create four corner verts
      for (let corner = 0; corner < 4; corner++) {
        vec4.transformMat4(currVert, startVert, currMat);
        mat4.rotateZ(currMat, currMat, glMatrix.toRadian(90));
        this.positions.set([currVert[0], currVert[1], currVert[2], 1], (corner * 4) + (face * 16));
     
      }
    }
    
    // fill temp normals array
    let frontNorm = vec4.fromValues(0, 0, 1, 1);
    let rMat = mat4.create();
    mat4.fromYRotation(rMat, glMatrix.toRadian(90));
    for (let face = 0; face < 6; face++) {

      if (face < 4) {
        for (let corners = 0; corners < 4; corners++) {
          this.normals.set([frontNorm[0], frontNorm[1], frontNorm[2], 1], 16 * face + corners * 4) 
        }
        vec4.transformMat4(frontNorm, frontNorm, rMat);
        
      } else if (face === 4) {
        // frontNorm is back where it started
        // rotate to bottom face
        mat4.fromXRotation(rMat, glMatrix.toRadian(90));
        vec4.transformMat4(frontNorm, frontNorm, rMat);
        for (let corners = 0; corners < 4; corners++) {
          this.normals.set([frontNorm[0], frontNorm[1], frontNorm[2], 1], 16 * face + corners * 4);
        }
      } else if (face === 5) {
        // front norm is on bottom
        // rotate to top face
        mat4.fromXRotation(rMat, glMatrix.toRadian(180));
        vec4.transformMat4(frontNorm, frontNorm, rMat);
        for (let corners = 0; corners < 4; corners++) {
          this.normals.set([frontNorm[0], frontNorm[1], frontNorm[2], 1], 16 * face + corners * 4);
        }
      }
    }

    // fill temp indices array
    for (let face = 0; face < 6; face++) {
      let index = face * 4;
      for (let tri = 0; tri < 2; tri++) {
        this.indices.set([index, index + 1 + tri, index + 2 + tri], (tri * 3) + (face * 6));
      }
    }

    this.indices = new Uint32Array(this.buffer, indexByteOffset, triCount * 3);
    this.normals = new Float32Array(this.buffer, normalByteOffset, vertCount * 4);
    this.positions = new Float32Array(this.buffer, positionByteOffset, vertCount * 4);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created icosphere with ${vertCount} vertices, 3 per-corner`);
  }
};

export default Cube;