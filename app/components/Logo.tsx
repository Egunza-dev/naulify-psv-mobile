import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}

/**
 * Variation G: The Compass 'N'.
 * A professional and reliable logo that places a stylized 'N' within a
 * compass, symbolizing routes, guidance, and management.
 */
const NaulifyLogo = ({ size = 64, color = '#fff' }: LogoProps) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 100 100">
      {/* The outer compass ring */}
      <Circle cx="50" cy="50" r="40" stroke={color} strokeWidth="8" fill="none" />
      {/* The stylized 'N' inside */}
      <Path
        d="M 35 65 V 35 L 65 65 V 35"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default NaulifyLogo;
/*
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}


const NaulifyLogo = ({ size = 64, color = '#fff' }: LogoProps) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 100 100">
      <Path
        d="M 25 90 V 10 L 75 90 V 25"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default NaulifyLogo;
*/


