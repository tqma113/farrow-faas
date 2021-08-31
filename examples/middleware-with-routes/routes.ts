import { createRoutes } from 'farrow-faas'
import getTodos from './functions/getTodos'

export default createRoutes([
  {
    path: '/getTodos1',
    func: getTodos,
  },
])
