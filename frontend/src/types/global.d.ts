declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

declare const process: {
  env: {
    NODE_ENV?: string;
    API_BASE_URL?: string;
    REACT_APP_API_URL?: string;
    REVERB_HOST?: string;
    REVERB_PORT?: string;
    REVERB_KEY?: string;
    [key: string]: string | undefined;
  };
};
