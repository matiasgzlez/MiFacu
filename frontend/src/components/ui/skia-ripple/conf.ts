export const RIPPLE_SHADER_SOURCE = `
uniform shader child;
uniform float2 iResolution;
uniform float iTime;
uniform float2 iTouch;
uniform float iAmplitude;
uniform float iFrequency;
uniform float iDecay;
uniform float iSpeed;

float wave(float x, float y, float t, float amp, float freq, float decay_val) {
  float dist = distance(vec2(x, y), iTouch);
  float delay = dist / iSpeed;
  float actualTime = t - delay;
  if (actualTime < 0.0) return 0.0;

  return sin(freq * actualTime) * amp * exp(-decay_val * actualTime);
}

half4 main(vec2 fragCoord) {
  float dx = wave(fragCoord.x, fragCoord.y, iTime, iAmplitude, iFrequency, iDecay);
  float dy = wave(fragCoord.x, fragCoord.y, iTime, iAmplitude, iFrequency, iDecay);

  float2 distortedCoord = fragCoord + vec2(dx, dy);
  distortedCoord = clamp(distortedCoord, vec2(0.0), iResolution);

  return child.eval(distortedCoord);
}
`;
