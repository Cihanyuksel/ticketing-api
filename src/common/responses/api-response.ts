import { Response } from "express";

export class ApiResponse {
  //Success Response (200 OK)
  static success(res: Response, data: any, message?: string) {
    return res.status(200).json({
      success: true,
      message: message || "İşlem başarılı",
      data,
    });
  }

  //Created Response (201 Created)
  static created(res: Response, data: any, message?: string) {
    return res.status(201).json({
      success: true,
      message: message || "Kayıt başarıyla oluşturuldu",
      data,
    });
  }

  //No Content Response (204 No Content)
  static noContent(res: Response) {
    return res.status(204).send();
  }

  //Paginated Response
  static paginated(
    res: Response,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ) {
    return res.status(200).json({
      success: true,
      message: message || "Liste getirildi",
      data,
      pagination,
    });
  }

  //Custom Response
  static custom(
    res: Response,
    statusCode: number,
    data: any,
    message?: string
  ) {
    return res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
    });
  }
}
