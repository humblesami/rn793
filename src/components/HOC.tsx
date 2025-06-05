import React from 'react';
import { StyleProp, ViewStyle, SafeAreaView } from 'react-native';

// The generic wrapper HOC
export function wrapperWithStyle<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  wrapper: React.ComponentType<any> = SafeAreaView,
) {
  return ({ style, ...props }: P & { style?: StyleProp<ViewStyle> }) => {
    const Wrapper = wrapper;
    return (
      <Wrapper style={style}>
        <WrappedComponent {...(props as P)} />
      </Wrapper>
    );
  };
}
