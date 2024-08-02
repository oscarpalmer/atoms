export type SanitiseOptions = {
    /**
     * - Sanitise boolean attributes? _(Defaults to `true`)_
     * - E.g. `checked="abc"` => `checked=""`
     */
    sanitiseBooleanAttributes?: boolean;
};
/**
 * - Sanitise one or more nodes _(as well as all their children)_:
 * - Removes or sanitises bad attributes
 */
export declare function sanitise(value: Node | Node[], options?: Partial<SanitiseOptions>): Node[];
