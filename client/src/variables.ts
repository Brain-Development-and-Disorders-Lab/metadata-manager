/**
 * Specify important application-wide variables
 */
// Utility functions and libraries
import _ from "lodash";

// URL of the API server, either local or remote depending on deployment status
export const SERVER_URL = _.isEqual(process.env.REACT_APP_NODE_ENV, "development")
  ? "https://api.reusable.bio/mars"
  : "http://localhost:8000/mars";

// export const SERVER_URL = "http://localhost:8000/mars";

// Key of the local storage data containing the ORCiD token data and authentication data
export const TOKEN_KEY = "reusable_token";
