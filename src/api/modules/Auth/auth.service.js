import pg from "../../../config/knex-config.js";

const AuthService = {
  getUserByUsername: async (username) => {
    try {
      return await pg("public.User").where("username", username).select("*");
    } catch (error) {
      return error;
    }
  },
  getUserByUUID: async (uuid) => {
    try {
      return await pg("public.User").where("uuid", uuid).select("*");
    } catch (error) {
      return error;
    }
  },
}

export default AuthService;