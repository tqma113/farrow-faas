import { toSchemaCtor, TypeOf, ToSchemaCtor, Prettier } from 'farrow-schema'
import { createSchemaValidator, ValidationError } from 'farrow-schema/validator'
import {
  createAsyncPipeline,
  MaybeAsync,
  useContainer,
  Container,
  AsyncPipeline,
  RunPipelineOptions,
} from 'farrow-pipeline'

import {
  ApiDefinition,
  TypeOfTypeable,
  ApiSchema,
  Typeable,
  isApi,
} from 'farrow-api'

export type HandleSuccess<T> = {
  type: 'HandleSuccess'
  value: T
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HandleSuccess = <T>(output: T): HandleSuccess<T> => {
  return {
    type: 'HandleSuccess',
    value: output,
  }
}

export type InputValidationError = {
  type: 'InputValidationError'
  message: string
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const InputValidationError = (message: string): InputValidationError => {
  return {
    type: 'InputValidationError',
    message,
  }
}

export type OutputValidationError = {
  type: 'OutputValidationError'
  message: string
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const OutputValidationError = (message: string): OutputValidationError => {
  return {
    type: 'OutputValidationError',
    message,
  }
}

export type RuntimeError = {
  type: 'RuntimeError'
  message: string
}

const getErrorMessage = (error: ValidationError) => {
  let { message } = error

  if (Array.isArray(error.path) && error.path.length > 0) {
    message = `path: ${JSON.stringify(error.path)}\n${message}`
  }

  return message
}

export type Func<T extends ApiDefinition> = (
  input: TypeOfTypeable<T['input']>,
) => MaybeAsync<TypeOf<ToSchemaCtor<TypeableContentType<T['output']>>>>

type TypeableContentType<T extends Typeable> = T extends Typeable<infer U>
  ? U
  : never

export type WarpeOutput<T> =
  | HandleSuccess<T>
  | InputValidationError
  | OutputValidationError
export type FuncImplOptions = {
  container?: Container
}
export type FuncImpl<T extends ApiDefinition> = (
  input: TypeOfTypeable<T['input']>,
  options?: FuncImplOptions,
) => MaybeAsync<
  Prettier<WarpeOutput<TypeOf<ToSchemaCtor<TypeableContentType<T['output']>>>>>
>

export type FuncPipeline<T extends ApiDefinition = ApiDefinition> =
  AsyncPipeline<
    TypeOfTypeable<T['input']>,
    Prettier<
      WarpeOutput<TypeOf<ToSchemaCtor<TypeableContentType<T['output']>>>>
    >
  >

export type FuncSchema<T extends ApiDefinition = ApiDefinition> = {
  type: 'Func'
  definition: T
}

export type FuncMethods<T extends ApiDefinition = ApiDefinition> = {
  new: () => FuncType<T>
}

export type FuncType<T extends ApiDefinition = ApiDefinition> = FuncImpl<T> &
  ApiSchema<T> &
  FuncPipeline<T> &
  FuncMethods<T>

export const createFunc = <T extends ApiDefinition>(
  definition: T,
  func: Func<T>,
): FuncType<T> => {
  const validateApiInput = createSchemaValidator(toSchemaCtor(definition.input))

  const validateApiOutput = createSchemaValidator(
    toSchemaCtor(definition.output),
  )

  const apiPipeline = createAsyncPipeline<
    TypeOfTypeable<T['input']>,
    Prettier<
      WarpeOutput<TypeOf<ToSchemaCtor<TypeableContentType<T['output']>>>>
    >
  >()

  const apiSchema: ApiSchema<T> = {
    type: 'Api',
    definition,
  }

  const apiImpl = (
    input: TypeOfTypeable<T['input']>,
    options?: FuncImplOptions,
  ) => {
    const container = options?.container || useContainerSafe()

    return apiPipeline.run(input, {
      container,
      onLast: async (input) => {
        const inputResult = validateApiInput(input)
        if (inputResult.isErr) {
          return InputValidationError(getErrorMessage(inputResult.value))
        }

        const output = await func(input)

        const outputResult = validateApiOutput(output)
        if (outputResult.isErr) {
          return OutputValidationError(getErrorMessage(outputResult.value))
        }

        return HandleSuccess(output)
      },
    })
  }

  const apiMethods = {
    new() {
      return createFunc(definition, func)
    },
  }

  return Object.assign(apiImpl, apiSchema, apiPipeline, apiMethods)
}

const useContainerSafe = (): Container | undefined => {
  try {
    return useContainer()
    // eslint-disable-next-line no-empty
  } catch (_) {}
}

export type Route = {
  path: string
  func: FuncType | (() => Promise<{ default: FuncType }>)
}

export const createRoutes = (routes: Route[]): Route[] => {
  return routes
}

export const isFunc = <T extends ApiDefinition = ApiDefinition>(
  input: any,
): input is FuncType<T> => {
  return isApi(input)
}
