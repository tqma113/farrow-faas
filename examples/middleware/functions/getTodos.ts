import {
  createFunc,
  Struct,
  Union,
  Literal,
  List,
  TypeOf,
} from 'farrow-faas'
import { useRandom } from '../middlewares/random'

const Todo = Struct({
  content: String,
  createTime: Number,
})

export default createFunc(
  {
    input: {
      id: String,
    },
    output: Union(
      {
        type: Literal('GetTodosSuccess'),
        todos: List(Todo),
      },
      {
        type: Literal('UnknownID'),
        message: String,
      },
    ),
  },
  ({ id }) => {
    const limit = useRandom()

    if (mockData[id]) {
      return {
        type: 'GetTodosSuccess' as const,
        todos: mockData[id].slice(0, limit),
      }
    } else {
      return {
        type: 'UnknownID' as const,
        message: 'unknown id',
      }
    }
  },
)

const now = Date.now()

type Todo = TypeOf<typeof Todo>
const mockData: Record<string, Todo[]> = {
  foo: [
    {
      content: 'foo1',
      createTime: now,
    },
    {
      content: 'foo2',
      createTime: now,
    },
    {
      content: 'foo3',
      createTime: now,
    },
  ],
  bar: [
    {
      content: 'bar1',
      createTime: now,
    },
    {
      content: 'bar2',
      createTime: now,
    },
    {
      content: 'bar3',
      createTime: now,
    },
  ],
}
