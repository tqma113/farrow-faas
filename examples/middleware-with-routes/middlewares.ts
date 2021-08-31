import { defineMiddlewares } from 'farrow-faas'
import { Provider as random } from './middlewares/random'

export default defineMiddlewares([
  {
    Provider: random,
    options: void 0 as never,
  },
])
