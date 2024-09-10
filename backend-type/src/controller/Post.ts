import { Request, Response } from "express";
import DB from "../db/db"; // Assuming DB is a type of database client instance
import { logger } from "../config/winston";

interface User {
  id: number;
}

interface RequestWithUser extends Request {
  user: User;
}

export const addPost = (req: RequestWithUser, res: Response): void => {
  const { desc, imgUrl } = req.body;

  DB.query(
    "INSERT INTO posts (`user_id`, `desc`) VALUES (?, ?)",
    [req.user.id, desc],
    (err: any, result: { insertId: number }) => {
      if (err) return res.status(500).send(err);

      DB.query(
        "INSERT INTO post_media (`post_id`, `media_url`, `user_id`) VALUES (?, ?, ?)",
        [result.insertId, imgUrl, req.user.id],
        (err: any, result: any) => {
          if (err) return res.status(500).send(err);
          if (result) {
            return res.status(200).send("Post uploaded...");
          }
        }
      );
    }
  );
};

export const getUserPosts = (req: Request, res: Response): void => {
  const { userId } = req.params;

  const query = `SELECT p.id AS postId, u.id, u.name, p.desc, pm.media_url, 
    p.date, pis.image_url AS profileImage FROM posts p JOIN post_media pm 
    ON p.id = pm.post_id JOIN users u ON u.id = p.user_id 
    LEFT JOIN profileimages pis ON u.img = pis.id WHERE p.user_id = ? ORDER BY date DESC;`;

  DB.query(query, [userId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(result);
    }
  });
};

export const likeThePost = (req: RequestWithUser, res: Response): void => {
  const { id } = req.user;
  const { postId } = req.body;

  const query = "INSERT INTO likes (`post_id`, `user_id`) VALUES (?, ?)";

  DB.query(query, [postId, id], (err: any) => {
    if (err) {
      logger.error("Post hasn't been liked...", err);
    }
    return res.status(200).send(true);
  });
};

export const unLikeThePost = (req: RequestWithUser, res: Response): void => {
  const { id } = req.user;
  const { postId } = req.body;

  const query = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";

  DB.query(query, [id, postId], (err: any) => {
    if (err) {
      logger.error(err);
    }
    return res.status(200).send(true);
  });
};

export const checkPostLikeStatus = (
  req: RequestWithUser,
  res: Response
): void => {
  DB.query(
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
    [req.user.id, req.body.postId],
    (err: any, result: any) => {
      if (err) {
        logger.error(err);
      }
      if (result.length > 0) {
        return res.status(200).send(true);
      }
      return res.status(200).send(false);
    }
  );
};

export const postNewComment = (req: RequestWithUser, res: Response): void => {
  DB.query(
    "INSERT INTO comments (`user_id`, `post_id`, `desc`) VALUES(?, ?, ?)",
    [req.user.id, req.body.postId, req.body.desc],
    (err: any) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send("success");
    }
  );
};

export const getPostComments = (req: Request, res: Response): void => {
  const { postId } = req.params;

  const query =
    "SELECT u.name, u.id, c.desc, c.commentDate FROM comments as c JOIN users as u ON u.id = c.user_id AND c.post_id = ?";

  DB.query(query, [parseInt(postId, 10)], (err: any, result: any) => {
    if (err) {
      return res.status(400).send(err);
    }
    return res.status(200).send(result);
  });
};
