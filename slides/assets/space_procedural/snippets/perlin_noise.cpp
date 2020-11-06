float PerlinNoise2D(int x, int y, float persistence, int octaves, float zoom) {
    float total = 0.0f;
    // initial frequency and amplitude
    float frequency = zoom;
    float amplitude = 1.0f;
 
    for (int i = 0; i < octaves; i++) {
        // calculate noise
        total = total + InterpolatedNoise(x*frequency, y*frequency) * amplitude;
        // update frequency and amplitude
        frequency = frequency * 2;
        amplitude = amplitude * persistence;
    }
    return total;
}