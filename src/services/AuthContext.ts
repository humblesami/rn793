import React from 'react';

type SignInParams = {
  username: string;
  password: string;
};

type AuthContextState = {
  signIn: (data: SignInParams) => Promise<void>;
  signOut: () => void;
};

const AuthContext = React.createContext({} as AuthContextState);

export { AuthContext, type SignInParams };
