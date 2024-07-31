import type { HexColour } from './hex';
export declare abstract class Colour<Model> {
    private readonly $colour;
    protected readonly state: ColourState<Model>;
    /**
     * Gets the current value of the colour
     */
    get value(): Model;
    constructor(type: string, value: Model, defaults: Model, properties: Array<keyof Model>);
    /**
     * Convert the colour to a hex-colour
     */
    abstract toHex(): HexColour;
    /**
     * Get the colour as a _CSS-formatted_ string
     */
    abstract toString(): string;
}
type ColourState<Model> = {
    value: Model;
};
export {};
