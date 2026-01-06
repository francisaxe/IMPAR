import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isWeb = Platform.OS === 'web';
export const isDesktop = isWeb && width >= 1024;
export const isTablet = isWeb && width >= 768 && width < 1024;
export const isMobile = width < 768;

export const getResponsiveWidth = () => {
  if (isDesktop) return Math.min(1200, width * 0.8);
  if (isTablet) return width * 0.9;
  return width;
};

export const getResponsivePadding = () => {
  if (isDesktop) return 32;
  if (isTablet) return 24;
  return 16;
};

export const getCardWidth = () => {
  if (isDesktop) return '48%'; // 2 columns on desktop
  if (isTablet) return '48%'; // 2 columns on tablet
  return '100%'; // 1 column on mobile
};

export const getMaxContentWidth = () => {
  if (isDesktop) return 1400;
  if (isTablet) return 900;
  return width;
};
