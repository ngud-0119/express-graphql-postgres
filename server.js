const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')

var Team = new graphql.GraphQLObjectType({
  name: 'Team',
  fields: () => ({
    id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    players: {
      type: graphql.GraphQLList(Player),
      sqlJoin: (teamTable, playerTable, args) => `${teamTable}.id = ${playerTable}.team_id`
   }
  })
})

const Player = new graphql.GraphQLObjectType({
  name: 'Player',
  fields: () => ({
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
    team: {
      type: Team,
      sqlJoin: (playerTable, teamTable, args) => `${playerTable}.team_id = ${teamTable}.id`
    }
  })
});

const MutationRoot = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    player: {
      type: Player,
      args: {
        name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO player (id, name) VALUES ($1, $2) RETURNING *", [args.id, args.name])).rows[0]
        } catch (err) {
          throw new Error("Failed to insert new player")
        }
      }
    }
  })
})

const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hello: {
      type: graphql.GraphQLString,
      resolve: () => "Hello world!"
    },
    players: {
      type: new graphql.GraphQLList(Player),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    player: {
      type: Player,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (playerTable, args, context) => `${playerTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
     }
    },
   //...
  })
})

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot
});
    
const app = express();
app.use('/api', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000);

const { Client } = require('pg')
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "12345678",
  database: "postgres"
})
client.connect()

Player._typeConfig = {
  sqlTable: 'player',
  uniqueKey: 'id',
}
       
Team._typeConfig = {
  sqlTable: 'team',
  uniqueKey: 'id'
}