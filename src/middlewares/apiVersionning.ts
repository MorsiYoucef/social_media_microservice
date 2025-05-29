import { NextFunction, Request, Response } from "express";



export const urlVersioning = ( version : string ) => (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(`/api/${version}`)) {
        next();
    }else{
        res.status(404).json({
            success: false,
            error: "API version not found",
        });
    }
}

export const headerVersioning = ( version : string ) => (req: Request, res: Response, next: NextFunction) => {
    if(req.get('Accept-Version') === version) {
        next();
    } else {
        res.status(404).json({
            success: false,
            error: "API version not found",
        });
    }
}

export const contentTypeVersioning = ( version : string ) => (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');
    if (contentType && contentType.startsWith(`application/vnd.api.${version}+json`)) {
        next();
    }else {
        res.status(404).json({
            success: false,
            error: "API version not found",
        });
    }
}