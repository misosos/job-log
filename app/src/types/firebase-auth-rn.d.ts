import "firebase/auth";

declare module "firebase/auth" {
    // RN 타입 선언 누락 보완(런타임에는 존재)
    export function getReactNativePersistence(storage: any): any;
}

export {};