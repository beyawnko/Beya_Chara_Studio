export const kindMap = {
  base: { base: 'base', variant: 'variant' },
  head: { base: 'headBase', variant: 'headVariant' },
  body: { base: 'bodyBase', variant: 'bodyVariant' }
} as const

export type KindMap = typeof kindMap
