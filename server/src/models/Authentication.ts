// Custom types
import { Context, IAuth, ResponseData, UserModel } from "@types";

// JWK imports
import { verify } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

// Utility libraries
import { GraphQLError } from "graphql";
import axios, { AxiosResponse } from "axios";
import _ from "lodash";
import consola from "consola";

// Models
import { Users } from "./Users";
import { Workspaces } from "./Workspaces";

// Variables
import { DEMO_USER_ORCID } from "src/variables";

const TOKEN_URL = "https://orcid.org/oauth/token";
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://127.0.0.1:8080"
    : "https://app.metadatify.com";

export class Authentication {
  /**
   * Perform login operation
   * @returns Authentication information including name, ORCID, and a token
   */
  static login = async (code: string): Promise<ResponseData<IAuth>> => {
    // Format login data for POST request
    const loginData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }).toString();

    // Generate the authentication payload
    let authenticationPayload: IAuth;
    if (process.env.NODE_ENV === "production") {
      // If production, obtain the ORCiD token data
      const response: AxiosResponse = await axios.post(TOKEN_URL, loginData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      if (response.status !== 200) {
        throw new Error("Invalid");
      }
      authenticationPayload = {
        name: response.data.name,
        orcid: response.data.orcid,
        token: response.data.id_token,
        workspace: "",
      };
    } else {
      // If non-production, resolve with test user
      authenticationPayload = {
        orcid: DEMO_USER_ORCID,
        name: "Test User",
        token: "test_token_value",
        workspace: "",
      };
    }

    // Check if the User exists, and create a new User if not
    const exists = await Users.exists(authenticationPayload.orcid);
    if (!exists) {
      // Public use only
      // await Users.create({
      //   _id: authenticationPayload.orcid,
      //   firstName: "",
      //   lastName: "",
      //   email: "",
      //   affiliation: "",
      //   token: authenticationPayload.token,
      //   workspaces: [],
      // });
      return {
        success: false,
        message: "User does not have access",
        data: {
          name: authenticationPayload.name,
          orcid: authenticationPayload.orcid,
          token: "",
          workspace: "",
        },
      };
    }

    return {
      success: true,
      message: "Logged in successfully",
      data: authenticationPayload,
    };
  };

  static validate = async (token: string): Promise<UserModel> => {
    if (process.env.NODE_ENV === "production") {
      // Validate the token and obtain the ORCiD
      const client = new JwksClient({
        jwksUri: "https://orcid.org/oauth/jwks",
        requestHeaders: {},
        timeout: 30000,
      });

      const result = await client.getSigningKey(
        "production-orcid-org-7hdmdswarosg3gjujo8agwtazgkp1ojs",
      );
      const orcid = verify(token, result.getPublicKey()).sub;

      if (_.isUndefined(orcid)) {
        throw new Error("ORCiD could not be retrieved from login token");
      }

      const user = await Users.getOne(orcid.toString());
      if (user) {
        return user;
      }
    } else {
      // Return the test user account
      const user = await Users.getOne(DEMO_USER_ORCID);
      if (user) {
        return user;
      }
    }

    throw new Error(`Could not validate token`);
  };

  static authenticate = async (context: Context): Promise<void> => {
    // Check that a valid token has been provided
    const user = await Authentication.validate(context.token);

    // Check that the user from the context matches the user from the token
    if (!_.isEqual(context.user, user._id)) {
      throw new GraphQLError("Provided user does not match token user", {
        extensions: {
          code: "UNAUTHORIZED",
        },
      });
    }

    if (context.workspace !== "") {
      // Retrieve the Workspace to determine which Entities to return
      const workspace = await Workspaces.getOne(context.workspace);
      if (_.isNull(workspace)) {
        throw new GraphQLError("Workspace does not exist", {
          extensions: {
            code: "NON_EXIST",
          },
        });
      } else if (
        !_.isEqual(workspace.owner, context.user) &&
        !_.includes(workspace.collaborators, context.user)
      ) {
        // Check that the requesting user has access to the Workspace as owner or collaborator
        throw new GraphQLError(
          "User does not have permission to access this Workspace",
          {
            extensions: {
              code: "UNAUTHORIZED",
            },
          },
        );
      }
    }
  };
}
