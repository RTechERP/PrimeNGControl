import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableLayoutData } from './table-layout.model';

/** Injection token for the table layout API base URL */
export const TABLE_LAYOUT_API_URL = new InjectionToken<string>('TABLE_LAYOUT_API_URL', {
    providedIn: 'root',
    factory: () => '/api/table-layout'
});

@Injectable({ providedIn: 'root' })
export class TableLayoutService {
    private http = inject(HttpClient);
    private baseUrl = inject(TABLE_LAYOUT_API_URL);

    /**
     * Load all layout presets for a given table key.
     * GET /api/table-layout?layoutKey=xxx
     */
    getLayouts(layoutKey: string): Observable<TableLayoutData[]> {
        return this.http.get<TableLayoutData[]>(this.baseUrl, {
            params: { layoutKey }
        }).pipe(
            catchError((err: any) => {
                console.error('[TableLayoutService] Failed to load layouts:', err);
                return of([]);
            })
        );
    }

    /**
     * Save (create or update) a layout preset.
     * POST /api/table-layout
     */
    saveLayout(layout: TableLayoutData): Observable<TableLayoutData> {
        return this.http.post<TableLayoutData>(this.baseUrl, layout);
    }

    /**
     * Delete a layout preset by its MongoDB _id.
     * DELETE /api/table-layout/:id
     */
    deleteLayout(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Set a layout as the default for its layoutKey.
     * PATCH /api/table-layout/:id/set-default
     */
    setDefault(id: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/${id}/set-default`, {});
    }
}
