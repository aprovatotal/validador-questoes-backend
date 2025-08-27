import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformData(data))
    );
  }

  private transformData(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformData(item));
    }

    if (typeof obj === 'object') {
      const transformed: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Transform database field names to camelCase
          let transformedKey = key;
          if (key === 'created_at') {
            transformedKey = 'createdAt';
          } else if (key === 'updated_at') {
            transformedKey = 'updatedAt';
          } else if (key === 'approved_at') {
            transformedKey = 'approvedAt';
          } else if (key === 'migrated_at') {
            transformedKey = 'migratedAt';
          } else if (key === 'email_verified_at') {
            transformedKey = 'emailVerifiedAt';
          } else if (key === 'last_login_at') {
            transformedKey = 'lastLoginAt';
          }
          
          transformed[transformedKey] = this.transformData(obj[key]);
        }
      }
      return transformed;
    }

    return obj;
  }
}