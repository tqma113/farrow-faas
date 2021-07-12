import { createRoutes } from 'farrow-faas-runtime'
import getTodos from './src/index'

export default createRoutes([{
  name: 'getTodos',
  func: () => import('./src/index')
}, {
  name: 'getTodos1',
  func: getTodos
}])
