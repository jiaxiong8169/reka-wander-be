import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return { data, total: data.length };
        }
        // in search with pagination, `data` will be the paginated result
        // the actual `total` is obtained from the controller, querying the database
        if (data?.hasOwnProperty('data') && data?.hasOwnProperty('total')) {
          return data;
        }
        if (data) return { data, total: 1 };
        return { data };
      }),
    );
  }
}
