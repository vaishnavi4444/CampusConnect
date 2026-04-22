import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role?.toUpperCase() || "STUDENT",
    },
  });

  const token = generateToken(user);

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken(user);

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};


export const me = async (req) => {

  const user = req.user

  const { password: _, ...safeUser } = user;

  return { user: safeUser };
};