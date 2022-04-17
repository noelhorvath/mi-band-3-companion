export enum QueryOperator {
    LESS = '<',
    LESS_OR_EQUAL = '<=',
    EQUAL = '==',
    GREATER = '>',
    GREATER_OR_EQUAL = '>=',
    NOT_EQUAL = '!=',
    ARRAY_CONTAINS = 'array-contains',
    ARRAY_CONTAINS_ANY = 'array-contains-any',
    IN = 'in',
    NOT_IN = 'not-in'
}

export enum OrderByDirection {
    DESCENDING = 'desc',
    ASCENDING = 'asc'
}
