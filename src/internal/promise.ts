import type {Thenable} from '../models/misc.model';
import {noop} from './function/misc';

// #region Functions

export function swallow(thenable: Thenable<unknown>): void {
	void thenable.then(noop, noop);
}

// #endregion
