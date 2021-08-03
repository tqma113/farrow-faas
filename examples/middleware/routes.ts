import { createRoutes } from 'farrow-faas-runtime'
import getTodos from './src/index'

export default createRoutes([
  {
    path: 'getTodos1',
    func: getTodos,
  },
])
