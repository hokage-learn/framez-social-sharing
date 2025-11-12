import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from 'react-native';
import { cn } from '../utils/cn';
import { forwardRef, type ElementRef } from 'react';

type PressableVariant = 'primary' | 'secondary' | 'ghost';

type PressableProps = RNPressableProps & {
  variant?: PressableVariant;
  className?: string;
};

const variantClasses: Record<PressableVariant, string> = {
  primary:
    'rounded-full bg-framez-primary px-5 py-3 shadow-card active:bg-framez-primary/85 dark:bg-framez-secondary',
  secondary:
    'rounded-full border border-outline-soft px-5 py-3 active:bg-surface-light/90 dark:border-surface-dark-elevated dark:bg-surface-dark-elevated/50',
  ghost: 'rounded-full px-4 py-2',
};

type PressableRef = ElementRef<typeof RNPressable>;

export const Pressable = forwardRef<PressableRef, PressableProps>(
  ({ variant = 'primary', className, ...props }, ref) => {
    return (
      <RNPressable
        ref={ref}
        {...props}
        className={cn(variantClasses[variant], className)}
      />
    );
  },
);

Pressable.displayName = 'Pressable';

