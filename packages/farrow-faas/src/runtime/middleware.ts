import { IncomingMessage } from 'http'
import { Middleware, MaybeAsync } from 'farrow-pipeline'
import { enable } from 'farrow-pipeline/asyncHooks.node'
import { JsonType } from 'farrow-schema'

export type FuncMiddleware = Middleware<IncomingMessage, MaybeAsync<any>>
export type FuncMiddlewares = FuncMiddleware[]

export type Provider<O> = (options: O) => FuncMiddleware

export type Path = string | RegExp
export type ProviderPath = {
  includes?: Path | Path[]
} | {
  excludes?: Path | Path[]
}

export type ProviderConfig<O> = {
  Provider: Provider<O>
  options: O
} & ProviderPath
export type ProviderConfigs = ProviderConfig<any>[]

type PDC<O> = ProviderConfig<O>

enable()

export const defineMiddlewares = <
  A extends any,
  B extends any,
  C extends any,
  D extends any,
  E extends any,
  F extends any,
  G extends any,
  H extends any,
  I extends any,
  J extends any,
  K extends any,
  L extends any,
  M extends any,
  N extends any,
  O extends any,
  P extends any,
  Q extends any,
  R extends any,
  S extends any,
  T extends any,
  U extends any,
  V extends any,
  W extends any,
  X extends any,
  Y extends any,
  Z extends any,
>(
  list:
    | [PDC<A>]
    | [PDC<A>, PDC<B>]
    | [PDC<A>, PDC<B>, PDC<C>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>, PDC<E>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>, PDC<E>, PDC<F>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>, PDC<E>, PDC<F>, PDC<G>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>, PDC<E>, PDC<F>, PDC<G>, PDC<H>]
    | [PDC<A>, PDC<B>, PDC<C>, PDC<D>, PDC<E>, PDC<F>, PDC<G>, PDC<H>, PDC<I>]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
        PDC<V>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
        PDC<V>,
        PDC<W>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
        PDC<V>,
        PDC<W>,
        PDC<X>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
        PDC<V>,
        PDC<W>,
        PDC<X>,
        PDC<Y>,
      ]
    | [
        PDC<A>,
        PDC<B>,
        PDC<C>,
        PDC<D>,
        PDC<E>,
        PDC<F>,
        PDC<G>,
        PDC<H>,
        PDC<I>,
        PDC<J>,
        PDC<K>,
        PDC<L>,
        PDC<M>,
        PDC<N>,
        PDC<O>,
        PDC<P>,
        PDC<Q>,
        PDC<R>,
        PDC<S>,
        PDC<T>,
        PDC<U>,
        PDC<V>,
        PDC<W>,
        PDC<X>,
        PDC<Y>,
        PDC<Z>,
      ],
) => {

  return Object.assign(list, {
    [FUNC_PROVIDERS_LOADER]: true,
  })
}

const FUNC_PROVIDERS_LOADER = Symbol('FUNC_PROVIDERS_LOADER')
export type ProviderConfigsLoader = () => ProviderConfigs

export const isFuncMiddlewaresLoader = (
  input: any,
): input is ProviderConfigsLoader => {
  return typeof input === 'function' && input[FUNC_PROVIDERS_LOADER]
}
