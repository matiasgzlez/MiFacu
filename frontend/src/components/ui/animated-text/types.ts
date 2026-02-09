import type { TextStyle } from 'react-native';

export interface CharacterAnimationParams {
    opacity: number;
    translateY: number;
    scale: number;
    rotate: number;
}

export interface AnimationConfig {
    characterDelay: number;
    characterEnterDuration: number;
    characterExitDuration: number;
    layoutTransitionDuration: number;
    maxBlurIntensity?: number;
    spring: {
        damping: number;
        stiffness: number;
        mass: number;
    };
}

export interface CharacterProps {
    char: string;
    style?: TextStyle;
    index: number;
    totalChars: number;
    animationConfig: AnimationConfig;
    enterFrom: CharacterAnimationParams;
    enterTo: CharacterAnimationParams;
    exitFrom: CharacterAnimationParams;
    exitTo: CharacterAnimationParams;
}

export interface StaggeredTextProps {
    text: string;
    style?: TextStyle;
    animationConfig?: Partial<AnimationConfig & { spring: Partial<AnimationConfig['spring']> }>;
    enterFrom?: Partial<CharacterAnimationParams>;
    enterTo?: Partial<CharacterAnimationParams>;
    exitFrom?: Partial<CharacterAnimationParams>;
    exitTo?: Partial<CharacterAnimationParams>;
}
