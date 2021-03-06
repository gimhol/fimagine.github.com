import FI_Object from '../../base/FI_Object'
import {mat4} from '../../utils/gl-matrix'
import GLHelper from '../glHelper'
import {
  FI_Vector3D
} from '../../math/Root'

import FI_Node3D from './FI_Node3D'

import FI_CubeModel from '../static/FI_CubeModel';

export default class Cube extends FI_Node3D{
  constructor(){
    super()
  }
  _initBuffers(gl){
    this.texture = GLHelper.loadTexture('./res/textures/earth_atmos_2048.jpg');

    var {
      position, indices, color, textureCoordinates, normal
    } = FI_CubeModel;

    var positionBuffer;
    if(position){
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    }

    var indexBuffer;
    if(indices){
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    var colorBuffer;
    if( color ){
      colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    }

    var textureCoordinateBuffer;
    if( textureCoordinates ){
      textureCoordinateBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),gl.STATIC_DRAW);
    }

    var normalBuffer;
    if(normal){
      normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal),gl.STATIC_DRAW);
    }

    this.buffers = {
      position: positionBuffer,
      color: colorBuffer,
      normal: normalBuffer,
      textureCoordinate: textureCoordinateBuffer,
      indices: indexBuffer,
      indicesCount: FI_CubeModel.indices.length
    };
    return this.buffers;
  }

  _onRender(gl){
    super._onRender(gl);

    !this.buffers && this._initBuffers(gl)

    var { position, color, textureCoordinate, indices, indicesCount} = this.buffers;

    if(position){
      GLHelper.bindVertexPositionBuffer(position);
    }
    if(indices){
      GLHelper.bindVertexIndexBuffer(indices);
    }
    if(color){
      GLHelper.bindVertexColorBuffer(color);
    }

    if(textureCoordinate){
      GLHelper.bindTextureCoordBuffer(textureCoordinate)
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(GLHelper.uniformLocations.uSampler, 0);
    }

    GLHelper.drawElements('TRIANGLES',this.buffers.indicesCount,'UNSIGNED_SHORT',0);
  }
}
