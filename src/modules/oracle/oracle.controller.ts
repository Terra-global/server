import { Request, Response } from "express";
import { analyzeField } from "@terra-oracle/terra-oracle";

// Helper to wrap the analyzeField logic so it's the exact same function for all routes
const fetchOracleAnalysis = async (req: Request, defaultCategory: 'PLANT' | 'ANIMAL', defaultSubject: string) => {
  const subject = (req.query.subject as string) || defaultSubject;
  const category = (req.query.category as 'PLANT' | 'ANIMAL') || defaultCategory;
  
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
  
  const manualCoords = (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon))
    ? { lat, lon }
    : undefined;

  return await analyzeField({
    subject,
    category,
    config: {
      includeForecast: true,
      includeSeasonal: true,
      includeHistory: true,
      includeProjections: true
    },
    manualCoords
  });
};

/**
 * GET /api/oracle/weather
 */
export const getWeather = async (req: Request, res: Response) => {
  try {
    const data = await fetchOracleAnalysis(req, 'PLANT', 'Weather Overview');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(502).json({ success: false, message: "Failed to fetch weather from Oracle", error: error.message });
  }
};

/**
 * GET /api/oracle/crop
 */
export const getCropData = async (req: Request, res: Response) => {
  try {
    const data = await fetchOracleAnalysis(req, 'PLANT', 'Maize');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(502).json({ success: false, message: "Failed to fetch crop data from Oracle", error: error.message });
  }
};

/**
 * GET /api/oracle/animal
 */
export const getAnimalData = async (req: Request, res: Response) => {
  try {
    const data = await fetchOracleAnalysis(req, 'ANIMAL', 'Poultry');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(502).json({ success: false, message: "Failed to fetch animal data from Oracle", error: error.message });
  }
};

/**
 * GET /api/oracle/target
 */
export const getTargetThreshold = async (req: Request, res: Response) => {
  try {
    // Thermal threshold / target analysis
    const data = await fetchOracleAnalysis(req, 'PLANT', 'Thermal Target');
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(502).json({ success: false, message: "Failed to fetch thermal target from Oracle", error: error.message });
  }
};
