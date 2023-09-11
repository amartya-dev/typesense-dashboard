import { LocalStore } from "apps/common/utils/localStore";
import { TypeSenseConnection } from "./models";

export const AuthUtils = {
  persistAuth: (
    connectionValues: TypeSenseConnection,
    rememberChecked?: boolean
  ) => {
    LocalStore.add(
      "typeSenseAuth",
      connectionValues,
      rememberChecked ? 24 * 60 : 24 * 60
    );
  },
  getAuthDetails: () => {
    return LocalStore.get("typeSenseAuth");
  },
  isLoggedIn: () => {
    return LocalStore.get("typeSenseAuth") !== null;
  },
};
