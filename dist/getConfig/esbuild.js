var _a, _b;
import { errorToString } from '@contentlayer2/utils';
import { E, Ex, H, M, O, OT, pipe, Q, Ref, S, T, Tagged } from '@contentlayer2/utils/effect';
import * as esbuild from 'esbuild';
export const EsbuildWatcherTypeId = Symbol();
export class EsbuildWatcher {
    constructor() {
        this[_a] = EsbuildWatcherTypeId;
    }
}
_a = EsbuildWatcherTypeId;
export class UnknownEsbuildError extends Tagged('UnknownEsbuildError') {
    constructor() {
        super(...arguments);
        this.toString = () => `UnknownEsbuildError: ${errorToString(this.error)}`;
    }
}
export class KnownEsbuildError extends Tagged('KnownEsbuildError') {
    constructor() {
        super(...arguments);
        this.toString = () => `KnownEsbuildError: ${JSON.stringify(this.error, null, 2)}`;
    }
}
class ConcreteEsbuildWatcher {
    constructor(initialBuildResult, buildContext, buildOptions, fsEventsHub) {
        this.initialBuildResult = initialBuildResult;
        this.buildContext = buildContext;
        this.buildOptions = buildOptions;
        this.fsEventsHub = fsEventsHub;
        this[_b] = EsbuildWatcherTypeId;
        this.shutdown = pipe(Ref.get(this.buildContext), T.chain((buildContext) => T.tryPromise(async () => {
            if (O.isSome(buildContext)) {
                return buildContext.value.dispose();
            }
            else {
                throw new Error(`This should never happen. Esbuild build context is not set.`);
            }
        })), T.catchAll((_) => T.unit));
        this.start = pipe(T.suspend(() => {
            const { fsEventsHub, buildOptions, initialBuildResult } = this;
            const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
            return T.gen(function* ($) {
                const runtime = yield* $(T.runtime());
                const buildWatchPlugin = {
                    name: 'contentlayer-watch-plugin',
                    setup(build) {
                        let isFirstBuild = false;
                        build.onEnd((result) => {
                            runtime.runFiber(OT.addEvent('esbuild-build-result', { result: JSON.stringify(result) }));
                            if (isFirstBuild) {
                                isFirstBuild = false;
                            }
                            else {
                                if (result.errors.length > 0) {
                                    runtime.runFiber(H.publish_(fsEventsHub, Ex.succeed(E.left(new KnownEsbuildError({ error: result.errors })))));
                                }
                                else {
                                    runtime.runFiber(H.publish_(fsEventsHub, Ex.succeed(E.right(result))));
                                }
                            }
                        });
                    },
                };
                const buildContext = yield* $(T.tryCatchPromise(() => esbuild.context({
                    ...buildOptions,
                    plugins: [buildWatchPlugin, ...(buildOptions.plugins ?? [])],
                }), (error) => new UnknownEsbuildError({ error })));
                yield* $(Ref.set_(self.buildContext, O.some(buildContext)));
                yield* $(T.tryCatchPromise(
                // TODO remove `async` once `watch()` returns a Promise (bug in esbuild)
                async () => buildContext.watch(), (error) => new UnknownEsbuildError({ error })));
                yield* $(pipe(T.tryCatchPromise(() => buildContext.rebuild(), (error) => new UnknownEsbuildError({ error })), T.tap((res) => Ref.set_(initialBuildResult, O.some(res))), T.tap((res) => H.publish_(fsEventsHub, Ex.succeed(E.right(res)))), OT.withSpan('esbuild:initial-rebuild')));
            });
        }), OT.withSpan('esbuild:start', { attributes: { buildOptions: JSON.stringify(this.buildOptions) } }), T.catchAll((error) => H.publish_(this.fsEventsHub, Ex.succeed(E.left(error)))));
        this.subscribe = pipe(H.subscribe(this.fsEventsHub), M.chain((_) => M.ensuringFirst_(M.succeed(S.fromQueue()(_)), Q.shutdown(_))), M.map(S.flattenExit));
    }
}
_b = EsbuildWatcherTypeId;
function concrete(esbuildWatcher) {
    //
}
export const make = (buildOptions) => T.gen(function* ($) {
    const initialBuildResult = yield* $(Ref.makeRef(O.none));
    const hub = yield* $(H.makeUnbounded());
    const buildContext = yield* $(Ref.makeRef(O.none));
    return new ConcreteEsbuildWatcher(initialBuildResult, buildContext, buildOptions, hub);
});
export const subscribe = (self) => {
    concrete(self);
    return self.subscribe;
};
const start = (self) => {
    concrete(self);
    return self.start;
};
// export const makeAndSubscribeManaged = (
//   buildOptions: esbuild.BuildOptions,
// ): M.Managed<unknown, UnknownEsbuildError, S.Stream<unknown, never, E.Either<EsbuildError, esbuild.BuildResult>>> =>
//   pipe(M.make_(make(buildOptions), shutdown), M.chain(subscribe))
export const makeAndSubscribeManaged = (buildOptions) => pipe(M.make_(make(buildOptions), shutdown), M.chain((esbuildWatcher) => pipe(subscribe(esbuildWatcher), M.tap(() => T.toManaged(start(esbuildWatcher))))));
export const makeAndSubscribe = (buildOptions) => pipe(makeAndSubscribeManaged(buildOptions), S.unwrapManaged);
export const shutdown = (self) => {
    concrete(self);
    return self.shutdown;
};
export const esbuildOnce = (buildOptions) => pipe(T.tryPromise(() => esbuild.build(buildOptions)), T.chain((result) => result.errors.length > 0 ? T.fail(new KnownEsbuildError({ error: result.errors })) : T.succeed(result)), T.mapError((error) => new UnknownEsbuildError({ error })), OT.withSpan('esbuild:build'));
//# sourceMappingURL=esbuild.js.map