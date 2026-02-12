import type { ViewStyle } from 'react-native';

export interface IRippleBase {
    width: number;
    height: number;
    amplitude?: number;
    frequency?: number;
    decay?: number;
    speed?: number;
    duration?: number;
    borderRadius?: number;
    style?: ViewStyle;
    onPress?: () => void;
}

export interface IRippleSkiaEffect extends IRippleBase {
    children?: React.ReactNode;
}

export interface IRippleImage extends IRippleBase {
    source: string | any;
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scaleDown';
}

export interface IRippleRect extends IRippleBase {
    color: string;
    children?: React.ReactNode;
}

export interface UseRippleParams {
    width: number;
    height: number;
    amplitude: number;
    frequency: number;
    decay: number;
    speed: number;
    duration: number;
}
