export interface ColumnDef {
    /** The property name in the data object */
    field: string;
    /** Display name for the column header */
    header: string;
    /** Column width, e.g. '25%' or '200px' */
    width?: string;
    /** PrimeNG filter type: 'text' | 'numeric' | 'date'. Default: 'text' */
    filterType?: string;
    /** Filter UI mode: 'input' | 'dropdown' | 'multiselect'. Default: 'input' */
    filterMode?: 'input' | 'dropdown' | 'multiselect';
    /** Manual filter options. If empty, auto-populated from data. Format: [{label, value}] */
    filterOptions?: { label: string; value: any }[];
    /** Enable sorting on this column */
    sortable?: boolean;
    /** Freeze this column */
    frozen?: boolean;
    /** Freeze direction: 'left' or 'right'. Default: 'left' */
    alignFrozen?: 'left' | 'right';
    /** Whether to wrap text or truncate with ellipsis. Default: false (truncate) */
    textWrap?: boolean;
}
