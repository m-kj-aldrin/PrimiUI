// --- Helper Types ---

// Trim leading and trailing whitespace.
type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
  ? Trim<R>
  : S;

// Split a string S by a delimiter Delim.
type Split<S extends string, Delim extends string> = S extends ""
  ? []
  : S extends `${infer Head}${Delim}${infer Rest}`
  ? [Head, ...Split<Rest, Delim>]
  : [S];

// Get the last element of an array type.
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

// Recursively obtain the final “simple” selector from a complex query.
// For example, "select-root > select-item" yields "select-item".
type FinalSelector<S extends string> = S extends `${infer _}${
  | " "
  | ">"
  | "+"
  | "~"}${infer Rest}`
  ? FinalSelector<Rest>
  : S;

// Remove an ID portion (e.g. "#foo") from a simple selector.
type StripId<S extends string> = Split<S, "#">[0];
// Remove a class portion (e.g. ".bar") from a simple selector.
type StripClass<S extends string> = Split<S, ".">[0];
// Remove an attribute portion (e.g. "[attr=value]") from a simple selector.
type StripAttr<S extends string> = Split<S, "[">[0];
// Remove a pseudo‑class (or pseudo‑element) portion (e.g. ":hover") from a simple selector.
type StripPseudo<S extends string> = Split<S, ":">[0];

// Extract the tag from a simple selector by stripping IDs, classes, attributes, and pseudo‑classes.
type ExtractTag<S extends string> = StripPseudo<
  StripAttr<StripClass<StripId<S>>>
>;

// Given any selector string S, first trim it, then get its final simple selector,
// then extract the bare tag name.
type ExtractFinalTagName<S extends string> = ExtractTag<Trim<FinalSelector<S>>>;

// Map a tag name to its element type using HTMLElementTagNameMap.
// If the tag isn’t found there, fall back to Element.
type ElementOf<Tag extends string> = Tag extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[Tag]
  : Element;

// --- Handling Comma-Separated Selectors ---
//
// When a selector list is provided, we normally split on commas. However,
// if the selector contains a :not(…) clause with a comma inside, we want to
// treat it as a single selector rather than splitting it.
// For example, "select-item.test:not([bla],[blo])" should be handled as one.
type SplitSelectors<S extends string> =
  S extends `${infer _}:not(${infer X},${infer Y})${infer _}`
    ? [S]
    : Split<S, ",">;

// For each selector in the (possibly split) list, produce a union of element types.
type ExtractElementsFromSelectors<Arr extends string[]> = Arr extends [
  infer Head,
  ...infer Tail
]
  ? Head extends string
    ? Tail extends string[]
      ?
          | ElementOf<ExtractFinalTagName<Head>>
          | ExtractElementsFromSelectors<Tail>
      : ElementOf<ExtractFinalTagName<Head>>
    : never
  : never;

// Final specialized result for querySelector/querySelectorAll.
type QuerySelectorResult<S extends string> = ExtractElementsFromSelectors<
  SplitSelectors<S>
>;

// --- Global Augmentation ---

declare global {
  interface Element {
    /**
     * Specialized overload for querySelector:
     * When a string literal is provided, we parse it at compile time
     * and return the appropriate element type (or union for a selector list).
     *
     * Examples:
     * - querySelector("select-root.test-class") returns HTMLElementTagNameMap["select-root"] | null
     * - querySelector("select-root>select-item") returns HTMLElementTagNameMap["select-item"] | null
     * - querySelector("select-item.test:not([bla],[blo])") returns HTMLElementTagNameMap["select-item"] | null
     */
    querySelector<S extends string>(selector: S): QuerySelectorResult<S> | null;
    /** Fallback overload */
    querySelector(selector: string): Element | null;

    /**
     * Specialized overload for querySelectorAll:
     * Returns a NodeListOf of the inferred element type.
     */
    querySelectorAll<S extends string>(
      selector: S
    ): NodeListOf<QuerySelectorResult<S>>;
    /** Fallback overload */
    querySelectorAll(selector: string): NodeListOf<Element>;
  }

  interface Document {
    querySelector<S extends string>(selector: S): QuerySelectorResult<S> | null;
    querySelector(selector: string): Element | null;
    querySelectorAll<S extends string>(
      selector: S
    ): NodeListOf<QuerySelectorResult<S>>;
    querySelectorAll(selector: string): NodeListOf<Element>;
  }
}

export {};
