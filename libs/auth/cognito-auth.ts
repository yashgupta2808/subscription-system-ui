import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserSession,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_Fq73iSmCi",
  ClientId: "7afa4m4cgknb7fna5l2mdro183",
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
    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((err as any).code === "UsernameExistsException") {
          reject("User already exists");
        }
        reject(err);
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
