declare module '*.csv' {
  const words: Array<{
    word: string
    definitions: string[]
    quality: number
  }>
  export default words
}
