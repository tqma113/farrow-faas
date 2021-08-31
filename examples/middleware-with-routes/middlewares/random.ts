import { FuncMiddleware, createContext } from 'farrow-faas'

const RandomContext = createContext(0)

export const useRandom = () => {
  return RandomContext.use().value
}

export const Provider = (): FuncMiddleware => {
  return (input, next) => {
    RandomContext.set(Math.random() * 10)
    console.log(useRandom())

    return next(input)
  }
}
