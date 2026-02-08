export const RIPPLE_SHADER_SOURCE = `
uniform float2 iResolution;
uniform float iTime;
uniform float2 iTouch;
uniform float iAmplitude;
uniform float iFrequency;
uniform float iDecay;
uniform float iSpeed;

float wave(float x, float y, float t, float amp, float freq, float decay) {
  float dist = distance(vec2(x, y), iTouch);
  float delay = dist / iSpeed;
  float actualTime = t - delay;
  if (actualTime < 0.0) return 0.0;
  
  float wave = sin(freq * actualTime) * amp * exp(-decay * actualTime);
  return wave;
}

vec4 main(vec2 fragCoord) {
  float2 uv = fragCoord / iResolution;
  
  float dx = wave(fragCoord.x, fragCoord.y, iTime, iAmplitude, iFrequency, iDecay);
  float dy = wave(fragCoord.x, fragCoord.y, iTime, iAmplitude, iFrequency, iDecay);
  
  float2 distortedUV = uv + vec2(dx, dy) / iResolution;
  distortedUV = clamp(distortedUV, 0.0, 1.0);
  
  return vec4(distortedUV.x, distortedUV.y, 0.0, 1.0);
}
`;
