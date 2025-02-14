declare global {
    interface HTMLElementTagNameMap {
        "select-root": import("./custom-elements/Select/root.js").SelectRoot;
        "select-trigger": import("./custom-elements/Select/trigger.js").SelectTrigger;
        "select-item": import("./custom-elements/Select/item.js").SelectItem;
        "input-root": import("./custom-elements/Input/root.js").InputRoot;
        "input-label": import("./custom-elements/Input/label.js").InputLabel;
        "input-value": import("./custom-elements/Input/value.js").InputValue;
    }
    interface HTMLElement {
        /**
         * Called when the element is connected to the DOM.
         */
        connectedCallback?(): void;

        /**
         * Called when the element is disconnected from the DOM.
         */
        disconnectedCallback?(): void;

        /**
         * Called when an observed attribute has been added, removed, updated, or replaced.
         * @param name - The name of the attribute that changed.
         * @param oldValue - The old value of the attribute.
         * @param newValue - The new value of the attribute.
         */
        attributeChangedCallback?(
            name: string,
            oldValue: string | null,
            newValue: string | null
        ): void;
    }

    interface HTMLElementConstructor {
        /**
         * Returns an array of attribute names to observe for changes.
         */
        observedAttributes?: string[];
    }

    class XSelectEvent extends Event {
        value: string;
        name: string | null;
        target: import("./custom-elements/Select/item.js").SelectItem;
    }
    
    interface DocumentEventMap {
        "x-select": XSelectEvent;
    }

    interface WindowEventMap {
        "x-select": XSelectEvent;
    }

    interface HTMLElementEventMap {
        "x-select": XSelectEvent;
    }

    interface ElementEventMap {
        "x-select": XSelectEvent;
    }
}

export {};
