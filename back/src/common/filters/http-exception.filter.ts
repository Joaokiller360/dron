import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Nest/Express default texts (status reasons and built-in exceptions) in Spanish */
const SPANISH: Record<string, string> = {
  'Bad Request': 'Solicitud no válida',
  Unauthorized: 'Tu sesión no es válida o expiró. Inicia sesión de nuevo.',
  Forbidden: 'No tienes permiso para hacer esto',
  'Forbidden resource': 'No tienes permiso para hacer esto',
  'Not Found': 'No encontrado',
  Conflict: 'Conflicto con los datos actuales',
  'Payload Too Large': 'El contenido enviado es demasiado grande',
  'Too Many Requests': 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  'ThrottlerException: Too Many Requests':
    'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  'Internal Server Error': 'Error interno del servidor',
  'Internal server error': 'Error interno del servidor',
  'Bad Gateway': 'Un servicio externo no respondió',
  'Service Unavailable': 'Servicio no disponible',
};

const es = (text: string) =>
  SPANISH[text] ?? (/^Cannot [A-Z]+ \//.test(text) ? 'La ruta solicitada no existe' : text);

/** Translates the default strings inside an exception body, keeping its shape */
function toSpanish(body: string | object): string | object {
  if (typeof body === 'string') return es(body);
  const b = body as { message?: unknown; error?: unknown };
  return {
    ...b,
    ...(typeof b.message === 'string' && { message: es(b.message) }),
    ...(typeof b.error === 'string' && { error: es(b.error) }),
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? toSpanish(exception.getResponse())
        : 'Error interno del servidor';

    this.logger.error(
      `${request.method} ${request.url} -> ${status}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
