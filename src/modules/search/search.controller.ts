import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { searchService } from "./search.service";
import { ApiError } from "../../utils/ApiError";

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const query = typeof req.query.query === "string" ? req.query.query : "";
    const type = typeof req.query.type === "string" ? req.query.type : "global";

    if (!query || query.length < 1) {
      return res.json({ success: true, data: { users: [], posts: [] } });
    }

    if (type === "users") {
      const users = await searchService.searchUsers(query);
      return res.json({ success: true, data: users });
    }

    if (type === "posts") {
      const posts = await searchService.searchPosts(query);
      return res.json({ success: true, data: posts });
    }

    const results = await searchService.globalSearch(query);
    return res.json({ success: true, data: results });
  }),
};
