import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { squareService } from "./square.service";
import { createSquareSchema, squareMessageSchema } from "./square.schema";
import { ApiError } from "../../utils/ApiError";

export const squareController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createSquareSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }

    const square = await squareService.createSquare(req.user!.userId, parsed.data);
    res.status(201).json({ success: true, data: square });
  }),

  getActive: asyncHandler(async (req: Request, res: Response) => {
    const squares = await squareService.getActiveSquares();
    res.json({ success: true, data: squares });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const square = await squareService.getSquareById(req.params.id as string);
    if (!square) throw ApiError.notFound("Square not found");
    res.json({ success: true, data: square });
  }),

  join: asyncHandler(async (req: Request, res: Response) => {
    const participant = await squareService.joinSquare(req.params.id as string, req.user!.userId);
    res.json({ success: true, data: participant });
  }),

  leave: asyncHandler(async (req: Request, res: Response) => {
    await squareService.leaveSquare(req.params.id as string, req.user!.userId);
    res.json({ success: true, message: "Left square" });
  }),

  toggleStage: asyncHandler(async (req: Request, res: Response) => {
    const { targetUserId, status } = req.body;
    const participant = await squareService.toggleStage(req.params.id as string, req.user!.userId, targetUserId, status);
    res.json({ success: true, data: participant });
  }),

  raiseHand: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const participant = await squareService.raiseHand(req.params.id as string, req.user!.userId, status);
    res.json({ success: true, data: participant });
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const parsed = squareMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }

    const message = await squareService.sendMessage(req.params.id as string, req.user!.userId, parsed.data.content);
    res.status(201).json({ success: true, data: message });
  }),

  getMyActive: asyncHandler(async (req: Request, res: Response) => {
    const participation = await squareService.getUserActiveSquare(req.user!.userId);
    res.json({ success: true, data: participation });
  }),

  end: asyncHandler(async (req: Request, res: Response) => {
    const squareId = req.params.id as string;
    await squareService.endSquare(squareId, req.user!.userId);
    
    // Emit event to all users in the room
    const io = req.app.get("io");
    io.to(`square:${squareId}`).emit("square-ended");
    
    res.json({ success: true, message: "Square ended" });
  }),
};
