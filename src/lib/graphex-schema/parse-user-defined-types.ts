import { parse, DocumentNode } from 'graphql';

export const userDefinedTypesToAst = (userDefinedTypes: string): DocumentNode => parse(userDefinedTypes)
