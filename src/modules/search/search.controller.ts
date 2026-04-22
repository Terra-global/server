import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { searchService } from "./search.service";
import { ApiError } from "../../utils/ApiError";

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const query = typeof req.query.query === "string" ? req.query.query : "";
    const type = typeof req.query.type === "string" ? req.query.type : "groups";

    if (!query || query.length < 2) {
      throw ApiError.badRequest("Search query must be at least 2 characters long");
    }

    if (type === "users") {
      const users = await searchService.searchUsers(query);
      return res.json({ success: true, data: users });
    }

    res.json({ success: true, data: [] });
  }),
};
