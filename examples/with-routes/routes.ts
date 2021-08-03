import { createRoutes } from 'farrow-faas-runtime'
import getTodos from './functions/getTodos'

export default createRoutes([{
  path: '/getTodos',
  func: getTodos
}])
