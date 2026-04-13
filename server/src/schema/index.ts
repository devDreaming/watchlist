import { builder } from "./builder";
import "./types";
import "./queries";
import "./mutations";
import "./auth";

export const schema = builder.toSchema();
