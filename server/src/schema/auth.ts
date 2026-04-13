import bcrypt from "bcryptjs";
import { builder } from "./builder";
import { signToken } from "../auth";

const AuthPayload = builder.objectRef<{ token: string; email: string }>("AuthPayload").implement({
  fields: (t) => ({
    token: t.string({ resolve: (p) => p.token }),
    email: t.string({ resolve: (p) => p.email }),
  }),
});

builder.mutationField("register", (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_root, { email, password }, ctx) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("Email already in use");
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await ctx.prisma.user.create({ data: { email, passwordHash } });
      return { token: signToken(user.id), email: user.email };
    },
  })
);

builder.mutationField("login", (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_root, { email, password }, ctx) => {
      const user = await ctx.prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid email or password");
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error("Invalid email or password");
      return { token: signToken(user.id), email: user.email };
    },
  })
);
