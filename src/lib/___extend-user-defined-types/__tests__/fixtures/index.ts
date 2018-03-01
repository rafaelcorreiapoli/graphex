import { IGraphexType } from '../../src/lib/graphex-schema/ast-to-graphex-schema';

const defaults = {
  isArray: false,
  itemRequired: false,
  required: false,
}

export const graphexSchema: IGraphexType[] = [{
  name: 'User',
  type: 'User',
  directives: {
    auth: {
      fn: 'isOwner',
    },
  },
  fields: [{
    name: '_id',
    type: 'ID',
    attributes: {
      ...defaults,
      required: true,
      isArray: false,
    },
    directives: {},
  }, {
    name: 'name',
    type: 'String',
    attributes: {
      ...defaults,
      required: true,
    },
    directives: {},
  }, {
    name: 'numbers',
    type: 'Float',
    attributes: {
      ...defaults,
      isArray: true,
    },
    directives: {},
  }, {
    name: 'scopes',
    type: 'String',
    attributes: {
      ...defaults,
      isArray: true,
      itemRequired: true,
      required: true,
    },
    directives: {},
  }, {
    name: 'posts',
    type: 'Post',
    attributes: {
      ...defaults,
      isArray: true,
      required: true,
      itemRequired: false,
    },
    directives: {
      relation: {
        name: 'UserPosts',
      },
    },
  }],
}, {
  name: 'Post',
  type: 'Post',
  directives: {

  },
  fields: [{
    name: '_id',
    type: 'ID',
    attributes: {
      ...defaults,
      required: true,
      isArray: false,
    },
    directives: {},
  }, {
    name: 'text',
    type: 'String',
    attributes: {
      ...defaults,
      required: false,
    },
    directives: {},
  }, {
    name: 'secretNote',
    type: 'String',
    attributes: {
      ...defaults,
    },
    directives: {
    },
  }, {
    name: 'author',
    type: 'User',
    attributes: {
      ...defaults,
      required: true,
    },
    directives: {
      relation: {
        name: 'UserPosts',
      },
    },
  }],
}]
