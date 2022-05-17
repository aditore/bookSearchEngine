const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    bookCount: Int
    savedBooks: [Book]!
}

type Book {
    bookId: String!
    authors: [String]
    description: String!
    title: String
    image: String
    link: String
}

type Auth {
    token: ID!
    user: User!
}

input BookData {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
}

type Query {
    me: User 
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(
        username: String!
        email: String!
        password: String!
    ): Auth
    saveBook(savedBooks: BookData): User
    deleteBook(bookId: String!): User
}
`

module.exports = typeDefs;