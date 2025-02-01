import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (email: string, password: string, name: string) => {
  const attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
    new CognitoUserAttribute({
      Name: "name",
      Value: name,
    }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, [], (error, result) => {
      if (error) {
        if (error.name === "UsernameExistsException") {
          reject("User already exists");
        }
        reject(error);
      }
      resolve(result);
    });
  });
};

export const signIn = (email: string, password: string) => {
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise<CognitoUserSession>((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const signOut = (): Promise<void> => {
  const user = userPool.getCurrentUser();
  if (!user) {
    return Promise.reject("No user session found");
  }

  return new Promise((resolve, reject) => {
    try {
      user.signOut();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const getSession = (): Promise<CognitoUserSession> => {
  const user = userPool.getCurrentUser();
  if (!user) {
    return Promise.reject("No user session found");
  }

  return new Promise<CognitoUserSession>((resolve, reject) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject(err || "Invalid Session");
      } else {
        resolve(session);
      }
    });
  });
};

export const verifyEmail = (email: string, code: string) => {
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

export const deleteUser = () => {
  const user = userPool.getCurrentUser();

  return new Promise((resolve, reject) => {
    if (!user) {
      reject("No user session found");
      return;
    }
    user.getSession((err, session) => {
      if (err || !session) {
        reject(err || "No user session found");
        return;
      }

      user.deleteUser((deleteErr, result) => {
        if (deleteErr) {
          reject(deleteErr);
        } else {
          resolve(result);
        }
      });
    });
  });
};
