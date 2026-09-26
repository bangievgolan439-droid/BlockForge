import { shaderMaterial } from '@react-three/drei';
import { extend, type ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  // three.js auto-injects "attribute mat4 instanceMatrix;" for instanced meshes on any
  // ShaderMaterial — declaring it again here causes a "redefinition" shader compile error.

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 instancePosition = vec4(position, 1.0);
    mat3 instanceNormalMatrix = mat3(1.0);

    #ifdef USE_INSTANCING
      instancePosition = instanceMatrix * instancePosition;
      instanceNormalMatrix = mat3(instanceMatrix);
    #endif

    vec4 worldPosition = modelMatrix * instancePosition;
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * instanceNormalMatrix * normal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float scale;
  uniform vec3 sunDirection;
  uniform float ambient;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 n = normalize(vWorldNormal);

    // Triplanar blend weights: for axis-aligned voxel faces this collapses to a
    // hard pick of the dominant axis; for arbitrary CSG-mesh normals it blends
    // smoothly, so a stretched/sheared face never stretches the texture.
    vec3 blending = pow(abs(n), vec3(4.0));
    blending /= (blending.x + blending.y + blending.z + 1e-5);

    vec3 p = vWorldPosition * scale;
    vec4 xProj = texture2D(map, p.yz);
    vec4 yProj = texture2D(map, p.xz);
    vec4 zProj = texture2D(map, p.xy);
    vec4 texColor = xProj * blending.x + yProj * blending.y + zProj * blending.z;

    float diffuse = max(dot(n, normalize(sunDirection)), 0.0);
    float light = clamp(ambient + diffuse * (1.0 - ambient), 0.0, 1.0);

    gl_FragColor = vec4(texColor.rgb * light, texColor.a);
  }
`;

export const TriplanarMaterialImpl = shaderMaterial(
  {
    map: null as THREE.Texture | null,
    scale: 0.5,
    sunDirection: new THREE.Vector3(0.4, 1.0, 0.25).normalize(),
    ambient: 0.4
  },
  vertexShader,
  fragmentShader
);

extend({ TriplanarMaterial: TriplanarMaterialImpl });

// drei's `shaderMaterial()` helper types its return as plain `typeof THREE.ShaderMaterial`,
// dropping the custom uniforms — so the JSX element is typed by hand against the real shape.
export interface TriplanarUniforms {
  map: THREE.Texture | null;
  scale: number;
  sunDirection: THREE.Vector3;
  ambient: number;
}

export type TriplanarMaterialInstance = THREE.ShaderMaterial & TriplanarUniforms;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      triplanarMaterial: ReactThreeFiber.MaterialNode<TriplanarMaterialInstance, [THREE.ShaderMaterialParameters]>;
    }
  }
}
