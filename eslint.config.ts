import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: {
    tsconfigPath: '.nuxt/tsconfig.json',
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  yaml: false,
  markdown: false,
  ignores: [
    '.nuxt/**',
    '.output/**',
    'dist/**',
    'public/**',
    'docs/**',
    'archive/**',
  ],
}, {
  rules: {
    // Project convention: <template> first, <script> second
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    // process.env is idiomatic in Nuxt configs
    'node/prefer-global/process': 'off',
    // JSON.parse and localStorage patterns are idiomatic JS; the type-safety cost isn't worth it
    'ts/no-unsafe-assignment': 'off',
    // Truthy checks on string|null and boolean|undefined are idiomatic; too noisy to enforce
    'ts/strict-boolean-expressions': 'off',
    // Nuxt pages can have comment-only templates when all rendering is in a layout
    'vue/valid-template-root': 'off',
  },
})
