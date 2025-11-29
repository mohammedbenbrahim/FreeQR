export type DotType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
export type CornerDotType = 'dot' | 'square';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRConfig {
  data: string;
  width: number;
  height: number;
  margin: number;
  image: string | undefined;
  dotsOptions: {
    color: string;
    type: DotType;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    color: string;
    type: CornerSquareType;
  };
  cornersDotOptions: {
    color: string;
    type: CornerDotType;
  };
  qrOptions: {
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  imageOptions: {
    crossOrigin: string;
    margin: number;
  };
  frameOptions: {
    enabled: boolean;
    color: string;
    width: number;
    radius: number;
  };
  downloadOptions: {
    resolution: number;
  };
}