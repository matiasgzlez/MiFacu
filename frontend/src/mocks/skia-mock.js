/**
 * Mock for @shopify/react-native-skia when running in Expo Go.
 * Exports stubs so Metro doesn't try to resolve the real Skia
 * (which would crash due to react-native-worklets version mismatch).
 */

const noop = () => null;

module.exports = {
    __MOCK__: true,
    Canvas: noop,
    Circle: noop,
    Group: noop,
    Image: noop,
    Mask: noop,
    Rect: noop,
    RoundedRect: noop,
    Paint: noop,
    RuntimeShader: noop,
    Skia: {
        RuntimeEffect: { Make: () => null },
        Path: { Make: () => ({ addRRect: noop }) },
    },
    rect: () => ({}),
    rrect: () => ({}),
    useImage: () => null,
    makeImageFromView: () => Promise.resolve(null),
};
