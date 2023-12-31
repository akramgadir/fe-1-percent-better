import graphqlAPI from "./graphqlClient";

export const CREATE_USER_MUTATION = `
  mutation createUser(
    $username:String!,
    $password:String!,
    $email:String!,
  ) {
    createUser(
    username:$username,
    password:$password,
    email:$email)
    {
      user 
      {
        userId,
        username
      }
   }
}`;

export const createUser = async (username, password, email) => {
  try {
    const response = await graphqlAPI({
      data: {
        query: CREATE_USER_MUTATION,
        variables: {
          password: password,
          username: username,
          email: email,
        },
      },
    });

    if (response.data.errors) {
      console.error("Errors returned from the mutation:", response.data.errors);
      throw new Error("Error performing GraphQL mutation");
    }

    const createdUser = response.data.data.createUser.user;
    return createdUser;
  } catch (error) {
    console.error("Error in createUser", error);
    throw error;
  }
};
