import type { NestedUnnamedTypeDef } from './index.js';
export type FieldDefType = FieldDef['type'];
export type FieldDef = ListFieldDef | ListPolymorphicFieldDef | StringFieldDef | NumberFieldDef | BooleanFieldDef | JSONFieldDef | DateFieldDef | MarkdownFieldDef | MDXFieldDef | ImageFieldDef | EnumFieldDef | NestedFieldDef | NestedPolymorphicFieldDef | NestedUnnamedFieldDef | ReferenceFieldDef | ReferencePolymorphicFieldDef;
export interface FieldDefBase {
    /** Field name should contain only alphanumeric characters, underscore and a hyphen [A-Za-z0-9_]. Must start with a letter. Must not end with an underscore or a hyphen. */
    name: string;
    /** Short description to editors how the field is to be used */
    description: string | undefined;
    /**
     * Default: false
     */
    isRequired: boolean;
    isSystemField: boolean;
}
export interface ListFieldDef extends FieldDefBase {
    type: 'list';
    default: readonly any[] | undefined;
    of: ListFieldDefItem.Item;
}
export declare const isListFieldDef: (_: FieldDef) => _ is ListFieldDef;
export interface ListPolymorphicFieldDef extends FieldDefBase {
    type: 'list_polymorphic';
    default: readonly any[] | undefined;
    of: readonly ListFieldDefItem.Item[];
    /** Field needed to distinguish list data items at run time */
    typeField: string;
}
export declare namespace ListFieldDefItem {
    export type Item = ItemString | ItemNumber | ItemBoolean | ItemJSON | ItemDate | ItemMarkdown | ItemMDX | ItemImage | ItemEnum | ItemNested | ItemNestedUnnamed | ItemDocumentReference;
    type BaseItem = {};
    export type ItemString = BaseItem & {
        type: 'string';
    };
    export type ItemNumber = BaseItem & {
        type: 'number';
    };
    export type ItemBoolean = BaseItem & {
        type: 'boolean';
    };
    export type ItemJSON = BaseItem & {
        type: 'json';
    };
    export type ItemDate = BaseItem & {
        type: 'date';
    };
    export type ItemMarkdown = BaseItem & {
        type: 'markdown';
    };
    export type ItemMDX = BaseItem & {
        type: 'mdx';
    };
    export type ItemImage = BaseItem & {
        type: 'image';
    };
    export type ItemEnum = BaseItem & {
        type: 'enum';
        options: readonly string[];
    };
    export type ItemNested = BaseItem & {
        type: 'nested';
        nestedTypeName: string;
    };
    export type ItemNestedUnnamed = BaseItem & {
        type: 'nested_unnamed';
        typeDef: NestedUnnamedTypeDef;
    };
    export const isDefItemNested: (_: Item) => _ is ItemNested;
    export type ItemDocumentReference = BaseItem & {
        type: 'reference';
        documentTypeName: string;
        /**
         * Whether Contentlayer should embed the referenced document instead of the reference value
         *
         * @experimental
         * @default false
         */
        embedDocument: boolean;
    };
    export const isDefItemReference: (_: Item) => _ is ItemDocumentReference;
    export {};
}
export type StringFieldDef = FieldDefBase & {
    type: 'string';
    default: string | undefined;
};
export type NumberFieldDef = FieldDefBase & {
    type: 'number';
    default: number | undefined;
};
export type BooleanFieldDef = FieldDefBase & {
    type: 'boolean';
    default: boolean | undefined;
};
export type JSONFieldDef = FieldDefBase & {
    type: 'json';
    default: any | undefined;
};
export type DateFieldDef = FieldDefBase & {
    type: 'date';
    default: string | undefined;
};
export type MarkdownFieldDef = FieldDefBase & {
    type: 'markdown';
    default: string | undefined;
};
export type MDXFieldDef = FieldDefBase & {
    type: 'mdx';
    default: string | undefined;
};
export type ImageFieldDef = FieldDefBase & {
    type: 'image';
    default: string | undefined;
};
export type EnumFieldDef = FieldDefBase & {
    type: 'enum';
    default: string | undefined;
    options: readonly string[];
};
export type NestedFieldDef = FieldDefBase & {
    type: 'nested';
    default: any | undefined;
    /** References entry in NestedDefMap */
    nestedTypeName: string;
};
export declare const isNestedFieldDef: (_: FieldDef) => _ is NestedFieldDef;
export type NestedPolymorphicFieldDef = FieldDefBase & {
    type: 'nested_polymorphic';
    default: any | undefined;
    /** References entries in NestedDefMap */
    nestedTypeNames: readonly string[];
    /** Field needed to distinguish list data items at run time */
    typeField: string;
};
export declare const isNestedPolymorphicFieldDef: (_: FieldDef) => _ is NestedPolymorphicFieldDef;
export type NestedUnnamedFieldDef = FieldDefBase & {
    type: 'nested_unnamed';
    default: any | undefined;
    typeDef: NestedUnnamedTypeDef;
};
export declare const isNestedUnnamedFieldDef: (_: FieldDef) => _ is NestedUnnamedFieldDef;
export type ReferenceFieldDef = FieldDefBase & {
    type: 'reference';
    default: string | undefined;
    documentTypeName: string;
    /**
     * Whether Contentlayer should embed the referenced document instead of the reference value
     *
     * @experimental
     * @default false
     */
    embedDocument: boolean;
};
export type ReferencePolymorphicFieldDef = FieldDefBase & {
    type: 'reference_polymorphic';
    default: string | undefined;
    documentTypeNames: readonly string[];
    /** Field needed to distinguish list data items at run time */
    typeField: string;
};
export declare const isReferenceField: (_: FieldDef) => _ is ReferenceFieldDef;
//# sourceMappingURL=field.d.ts.map