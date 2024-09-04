const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth"); // Assuming you have an auth utility for token checks
const db = require("./config/connection");

// Import the GraphQL schema
const { typeDefs, resolvers } = require("./schemas"); // Will need to create these

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware, // If you're using auth with context for the API
  persistedQueries: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Apply Apollo Server as middleware with Express
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  // Start listening for requests
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the function to start Apollo Server
startApolloServer();
