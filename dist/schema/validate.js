export const validateSchema = (schema) => {
    Object.values(schema.documentTypeDefMap).forEach((def) => validateDocumentOrObjectDef({ def }));
    Object.values(schema.nestedTypeDefMap).forEach((def) => validateDocumentOrObjectDef({ def }));
};
const validateDocumentOrObjectDef = ({ def }) => {
    // TODO move out this code to a new stackbit extension package
    const stackbitExt = def.extensions.stackbit;
    if (stackbitExt?.labelField) {
        const noFieldFoundForLabelField = !def.fieldDefs.some((_) => _.name === stackbitExt.labelField);
        if (noFieldFoundForLabelField) {
            throw new Error(`There is no field with the name "${stackbitExt.labelField}" as specified for "labelField" in ${def._tag} with the name "${def.name}"`);
        }
    }
};
//# sourceMappingURL=validate.js.map