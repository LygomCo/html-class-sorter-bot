import { ModifierList } from './types';

export const BOT_NAME: string = 'html-class-sorter[bot]';

export const MODIFIERS_LIST: ModifierList = {
        MEDIA_QUERY_MODIFIERS: ['sm:', 'md:', 'lg:', 'xl:', '2xl:', 'max-sm:', 'max-md:', 'max-lg:', 'max-xl:', 'max-2xl:'],
        PSEUDO_CLASS_MODIFIERS: ['active:', 'focus-visible:', 'focus-within:', 'focus:', 'hover:', 'target:', 'visited:'],
        CHILD_ELEMENT_MODIFIERS: ['even:', 'first:', 'last:', 'odd:', 'only:'],
        SIBLING_ELEMENT_MODIFIERS: ['first-of-type:', 'last-of-type:', 'only-of-type:'],
        STATE_MODIFIERS: ['autofill:', 'checked:', 'default:', 'disabled:', 'empty:', 'enabled:', 'in-range:', 'indeterminate:', 'invalid:', 'out-of-range:', 'placeholder-shown:', 'read-only:', 'required:', 'valid:'],
        PSEUDO_ELEMENT_MODIFIERS: ['after:', 'backdrop:', 'before:', 'file:', 'first-letter:', 'first-line:', 'marker:', 'placeholder:', 'selection:'],
        PREFERS_MODIFIERS: ['contrast-less:', 'contrast-more:', 'dark:', 'landscape:', 'motion-reduce:', 'motion-safe:', 'portrait:'],
        DIRECTION_MODIFIERS: ['ltr', 'rtl'],
        ATTRIBUTE_MODIFIERS: ['aria-checked:', 'aria-disabled:', 'aria-expanded:', 'aria-hidden:', 'aria-pressed:', 'aria-readonly:', 'aria-required:', 'aria-selected:'],
        MISCELLANEOUS_MODIFIER: ['open:']
    };

export const FILE_TYPES_TO_SORT: string[] = [
    '.astro',
    '.cjs',
    '.htm',
    '.html',
    '.hbs',
    '.js',
    '.jsx',
    '.mjs',
    '.svelte',
    '.ts',
    '.tsx',
    '.vue'
];