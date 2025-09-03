/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}