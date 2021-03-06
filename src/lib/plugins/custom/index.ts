import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql';
import { ITypeDefinitions, IResolvers} from 'graphql-tools/dist/Interfaces';
import { resolvers } from '../../../playground/resolvers'
import { ISchemaPlugin } from '../interface';

export class CustomSchemaPlugin implements ISchemaPlugin {
  private userDefinedTypes: ITypeDefinitions

  constructor(userDefinedTypes: string) {
    this.userDefinedTypes = userDefinedTypes
  }
  private getTypeDefs(): ITypeDefinitions {
    return `
      type Mutation {
        myCustomThing(message: String): String
      }
      type Query {
        test: String
      }
    `
  }

  private getResolvers(): IResolvers {
    return {
      Mutation: {
        myCustomThing: () => 'Hello',
      },
    }
  }

  public getSchema(): GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: this.getTypeDefs(),
      resolvers: this.getResolvers(),
    })
  }
}
