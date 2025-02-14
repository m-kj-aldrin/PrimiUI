declare global {
    interface HTMLElementTagNameMap {
        'select-root': import('./custom-elements/Select/root.js').SelectRoot;
        'select-trigger': import('./custom-elements/Select/trigger.js').SelectTrigger;
        'select-item': import('./custom-elements/Select/item.js').SelectItem;
    }
}

export {};
