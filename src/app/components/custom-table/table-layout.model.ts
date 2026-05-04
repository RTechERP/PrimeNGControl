/**
 * Layout metadata for a single column — serializable to MongoDB.
 * Functions (format, cellClass, etc.) are NOT stored; they come from the
 * original ColumnDef definitions supplied by the parent component.
 */
export interface TableColumnLayout {
    /** Column field name — used to match back to ColumnDef */
    field: string;
    /** Current width (e.g. '200px', '25%', 'auto') */
    width?: string;
    /** Whether the column is hidden */
    hidden: boolean;
    /** Display order (0-based) */
    order: number;
    /** Whether the column is frozen */
    frozen?: boolean;
    /** Frozen alignment */
    alignFrozen?: 'left' | 'right';
}

/**
 * Complete table layout preset — the shape of the document stored in MongoDB.
 */
export interface TableLayoutData {
    /** Unique identifier for this layout document (assigned by backend) */
    _id?: string;
    /** Unique key identifying which table this layout belongs to (e.g. 'product-table') */
    layoutKey: string;
    /** Human-readable preset name (e.g. 'Mặc định', 'Layout gọn') */
    layoutName: string;
    /** Whether this is the default layout that auto-loads on init */
    isDefault?: boolean;
    /** Column layout metadata */
    columns: TableColumnLayout[];
    /** Whether column filter row is visible */
    showColumnFilter: boolean;
    /** Whether global search bar is visible */
    showGlobalFilter: boolean;
    /** Current sort field */
    sortField?: string;
    /** Current sort order (1 = asc, -1 = desc) */
    sortOrder?: number;
    /** Table font size */
    fontSize?: string;
    /** Whether text wrapping is enabled */
    textWrap?: boolean;
    /** ISO date string — set by backend */
    createdAt?: string;
    /** ISO date string — set by backend */
    updatedAt?: string;
}
