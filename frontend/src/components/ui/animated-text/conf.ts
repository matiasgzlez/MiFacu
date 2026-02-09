import type { AnimationConfig, CharacterAnimationParams } from './types';

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
    characterDelay: 30,
    characterEnterDuration: 400,
    characterExitDuration: 300,
    layoutTransitionDuration: 300,
    maxBlurIntensity: 12,
    spring: {
        damping: 15,
        stiffness: 200,
        mass: 1,
    },
};

export const DEFAULT_ENTER_FROM: CharacterAnimationParams = {
    opacity: 0,
    translateY: 20,
    scale: 0.8,
    rotate: 0,
};

export const DEFAULT_ENTER_TO: CharacterAnimationParams = {
    opacity: 1,
    translateY: 0,
    scale: 1,
    rotate: 0,
};

export const DEFAULT_EXIT_FROM: CharacterAnimationParams = {
    opacity: 1,
    translateY: 0,
    scale: 1,
    rotate: 0,
};

export const DEFAULT_EXIT_TO: CharacterAnimationParams = {
    opacity: 0,
    translateY: -20,
    scale: 0.8,
    rotate: 0,
};
