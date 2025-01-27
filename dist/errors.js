import { errorToString } from '@contentlayer2/utils';
import { Tagged } from '@contentlayer2/utils/effect';
export class NoConfigFoundError extends Tagged('NoConfigFoundError') {
    constructor() {
        super(...arguments);
        this.toString = () => this.configPath
            ? `Couldn't find ${this.configPath}`
            : `Could not find contentlayer.config.ts or contentlayer.config.js in ${this.cwd}`;
    }
}
export class ConfigReadError extends Tagged('ConfigReadError') {
    constructor() {
        super(...arguments);
        this.toString = () => `ConfigReadError (${this.configPath}): ${errorToString(this.error)}`;
    }
}
export class ConfigNoDefaultExportError extends Tagged('ConfigNoDefaultExportError') {
}
export class SourceFetchDataError extends Tagged('SourceFetchDataError') {
    constructor() {
        super(...arguments);
        this.toString = () => `SourceFetchDataError: ${errorToString(this.error)}`;
        this.toJSON = () => ({ _tag: this._tag, error: errorToString(this.error), alreadyHandled: this.alreadyHandled });
    }
}
SourceFetchDataError.fromJSON = (json) => new SourceFetchDataError({ error: json.error, alreadyHandled: json.alreadyHandled });
export const isSourceFetchDataError = (_) => _.hasOwnProperty('_tag') && _._tag === 'SourceFetchDataError';
export class SourceProvideSchemaError extends Tagged('SourceProvideSchemaError') {
    constructor() {
        super(...arguments);
        this.toString = () => `SourceProvideSchemaError: ${errorToString(this.error)}`;
        this.toJSON = () => ({ _tag: this._tag, error: errorToString(this.error) });
    }
}
SourceProvideSchemaError.fromJSON = (json) => new SourceProvideSchemaError({ error: json.error });
/**
 * This error is triggered for inconsistent data according to the provided error flags by the user.
 * The error was already handled (i.e. logged to the console) so it can be ignored in the application entry points.
 *
 * NOTE the modeling of this error handling should probably still be improved further.
 */
export class HandledFetchDataError extends Tagged('HandledFetchDataError') {
}
export class EsbuildBinNotFoundError extends Tagged('EsbuildBinNotFoundError') {
}
export class SuccessCallbackError extends Tagged('SuccessCallbackError') {
    constructor() {
        super(...arguments);
        this.toString = () => `SuccessCallbackError: ${errorToString(this.error)}`;
    }
}
//# sourceMappingURL=errors.js.map