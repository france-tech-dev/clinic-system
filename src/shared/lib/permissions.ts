import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["read", "create", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

/** Grants por papel — base org via *Ac.statements, não via defaultStatements. */
const ADMIN = ac.newRole({
  ...adminAc.statements,
  project: ["read", "create", "update", "delete"],
});

const OWNER = ac.newRole({
  ...ownerAc.statements,
  project: ["read", "create", "update", "delete"],
});

const MANAGER = ac.newRole({
  ...adminAc.statements,
  project: ["read", "create", "update", "delete"],
});

const MEMBER = ac.newRole({
  ...memberAc.statements,
  project: ["read", "update"],
});

const CLIENT = ac.newRole({
  project: ["read"],
});

export { ac, ADMIN, OWNER, MANAGER, MEMBER, CLIENT, statement };
