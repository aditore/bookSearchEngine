const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { user = null, params }) => {
            const foundUser = await User.findOne({
                $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
            });

            if (!foundUser) {
                return { message: 'Cannot find a user with this id!' };
            }
            
            return foundUser;
        },
    },

    Mutation: {
        //add user and give token
        addUser: async (parent, { body }) => {
            const user = await User.create(body);

            if (!user) {
                return { message: 'Something is wrong!' };
            }

            const token = signToken(user);
            return { token, user };
        },
        //login and give token
        login: async (parent, { body }) => {
            const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });

            if (!user) {
                throw new AuthenticationError('No user found');
            }

            const correctPw = await user.isCorrectPassword(body.password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        //save book to savedBooks
        saveBook: async (parent, { user, body }) => {
            console.log(user);
            try {
              const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
              );
              return updatedUser;
            } catch (err) {
              console.log(err);
              return err;
            }
        },
        //delete book from savedBooks
        deleteBook: async (parent, { user, params }) => {
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: { bookId: params.bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              return { message: "Couldn't find user with this id!" };
            }
            return updatedUser;
        }
    }
}