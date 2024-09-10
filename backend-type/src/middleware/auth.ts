import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: JwtPayload;
}

function auth(req: CustomRequest, res: Response, next: NextFunction): void {
  const token = req.cookies["x-auth-token"];

  if (token) {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY as string, (err, decoded) => {
      if (err) {
        return res.status(401).send("Logged In First");
      } else {
        req.user = decoded as JwtPayload;
        return next();
      }
    });
  } else {
    return res.status(401).send("Logged In First");
  }
}

export default auth;
