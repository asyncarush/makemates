import { Request, Response } from "express";
import { validateNewUser, validateUser } from "../utils/validate.js";
import DB from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface User {
  id: number;
}

interface RequestWithUser extends Request {
  user: User;
}

export async function login(req: Request, res: Response): Promise<void> {
  const { error } = validateUser(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  DB.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.email],
    (err: any, result: { id: number; password: string }[]) => {
      if (err) return res.status(400).send(err);

      if (result.length) {
        const user = result[0];
        const hashedPassword = user.password;

        bcrypt.compare(req.body.password, hashedPassword, (err, valid) => {
          if (err) return res.status(400).send(err);

          if (valid) {
            const token = jwt.sign(
              { id: user.id },
              process.env.JWT_PRIVATE_KEY as string,
              { expiresIn: "24hr" }
            );

            return res
              .cookie("x-auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite:
                  process.env.NODE_ENV === "production" ? "None" : "Lax",
              })
              .status(200)
              .send({ id: user.id });
          } else {
            return res.status(401).send("Incorrect Password");
          }
        });
      } else {
        return res.status(400).send("Email id not found");
      }
    }
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  const { error } = validateNewUser(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: hash,
    gender: req.body.gender,
    dob: `${req.body.day} ${req.body.month} ${req.body.year}`,
  };

  try {
    const user = await prisma.user.create({ data: newUser });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_PRIVATE_KEY as string,
      { expiresIn: "24hr" }
    );

    return res
      .cookie("x-auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      })
      .status(200)
      .send({ id: user.id });
  } catch (err) {
    return res.status(400).send(err.message);
  }
}

export async function getUserData(
  req: RequestWithUser,
  res: Response
): Promise<void> {
  const { id } = req.user;

  const query =
    "SELECT u.id, u.name, u.email, p.image_url FROM users u LEFT JOIN profileimages p ON u.img = p.id WHERE u.id = ?";

  DB.query(
    query,
    [id],
    (
      err: any,
      result: { id: number; name: string; email: string; image_url?: string }[]
    ) => {
      if (err) return res.status(401).send(err);
      if (result.length) {
        result[0].password = "************";
        return res.send(result[0]);
      }
    }
  );
}

export function updateUserInfo(req: RequestWithUser, res: Response): void {
  const { id } = req.user;
  const { key, value } = req.body;

  let query: string;
  let params: any[] = [];

  switch (key) {
    case "name":
      query = "UPDATE users SET name = ? WHERE id = ?";
      params = [value, id];
      break;
    case "email":
      query = "UPDATE users SET email = ? WHERE id = ?";
      params = [value, id];
      break;
    case "password":
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(400).send(err);
        bcrypt.hash(value, salt, (err, hash) => {
          if (err) return res.status(400).send(err);
          query = "UPDATE users SET password = ? WHERE id = ?";
          params = [hash, id];
          DB.query(query, params, (err) => {
            if (err) return res.status(401).send(err);
            return res.status(200).send("Password updated Successfully.");
          });
        });
      });
      return;
    case "birthday":
      query = "UPDATE users SET dob = STR_TO_DATE(?, '%d %M %Y') WHERE id = ?";
      params = [value, id];
      break;
    case "mobile_number":
      query = "UPDATE users SET mobile_number = ? WHERE id = ?";
      params = [value, id];
      break;
    case "city":
      query = "UPDATE users SET city = ? WHERE id = ?";
      params = [value, id];
      break;
    case "state":
      query = "UPDATE users SET state = ? WHERE id = ?";
      params = [value, id];
      break;
    case "country":
      query = "UPDATE users SET country = ? WHERE id = ?";
      params = [value, id];
      break;
    default:
      return res.status(400).send("Invalid update key.");
  }

  DB.query(query, params, (err: any) => {
    if (err) return res.status(401).send(err);
    return res
      .status(200)
      .send(
        `${key.charAt(0).toUpperCase() + key.slice(1)} updated Successfully.`
      );
  });
}

export function followUser(req: RequestWithUser, res: Response): void {
  const { id } = req.user;
  const { friendId } = req.body;

  DB.query(
    "INSERT INTO relationships (`follow_id`, `follower_id`) VALUES(?, ?)",
    [friendId, id],
    (err: any) => {
      if (err) return res.status(401).send(err);
      return res.status(200).send("DONE");
    }
  );
}

export function unfollowUser(req: RequestWithUser, res: Response): void {
  const { id } = req.user;
  const { friendId } = req.body;

  DB.query(
    "DELETE FROM relationships WHERE follow_id = ? AND follower_id = ?",
    [friendId, id],
    (err: any) => {
      if (err) return res.status(401).send(err);
      return res.status(200).send("DONE");
    }
  );
}

export function getFriendList(req: RequestWithUser, res: Response): void {
  const { id } = req.user;

  const query =
    "SELECT r.follow_id, r.follower_id, u.name, u.email, u.mobile_number, u.city, pis.image_url AS profileImage " +
    "FROM relationships r " +
    "JOIN users u ON r.follow_id = u.id " +
    "LEFT JOIN profileimages pis ON u.img = pis.id " +
    "WHERE follower_id = ?";

  DB.query(
    query,
    [id],
    (
      err: any,
      result: {
        follow_id: number;
        follower_id: number;
        name: string;
        email: string;
        mobile_number?: string;
        city?: string;
        profileImage?: string;
      }[]
    ) => {
      if (err) return res.status(401).send(err);
      return res.status(200).send(result.length > 0 ? result : []);
    }
  );
}

export function setProfilePic(req: RequestWithUser, res: Response): void {
  const { id } = req.user;
  const { profileImgUrl } = req.body;

  DB.query(
    "INSERT INTO profileimages (`user_id`, `image_url`, `currentImg`) VALUES(?, ?, ?)",
    [id, profileImgUrl, 1],
    (err: any, result: { insertId: number }) => {
      if (err) return res.status(401).send(err);

      const query = "UPDATE users SET img = ? WHERE id = ?";
      DB.query(query, [result.insertId, id], (err: any) => {
        if (err) return res.status(401).send(err);
        return res.status(200).send("Updated Successfully.");
      });
    }
  );
}

export function logoutUser(req: Request, res: Response): void {
  return res
    .clearCookie("x-auth-token")
    .status(200)
    .send("Logout Successfully..");
}
