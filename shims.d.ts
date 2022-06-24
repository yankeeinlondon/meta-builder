import { PipelineStage } from 'vite-plugin-md'
import { Pipeline } from 'vite-plugin-md'

declare interface Window {
  // extend the window
}

// with vite-plugin-md, markdowns can be treat as Vue components
declare module '*.md' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vitest' {
  export interface TestContext {
    sfc:  Pipeline<PipelineStage.closeout>
  }
}