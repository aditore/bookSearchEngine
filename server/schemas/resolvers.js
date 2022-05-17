const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password');
  
                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        //add user and give token
        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        //login and give token
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        //save book to savedBooks
        saveBook: async (_parent, { input }, context) => {
            if (context.user) {
                console.log(context.user);
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            
            throw new AuthenticationError('Please log in!')
        }, 
              
        //delete book from savedBooks
        deleteBook: async (_parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }

            throw new AuthenticationError('Please log in!')
        }
    }
};

module.exports = resolvers;