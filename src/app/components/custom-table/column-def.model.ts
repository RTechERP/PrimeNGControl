export interface EditLookupConfig {
    /** Data source for the lookup table popup */
    data: any[];
    /** Columns displayed in the lookup popup */
    columns: { field: string; header: string; width?: string }[];
    /** Field from selected row to store as the cell value */
    valueField: string;
    /** Field from selected row to display in the cell (defaults to valueField) */
    displayField?: string;
}

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
    /** Enable inline editing for this column */
    editable?: boolean;
    /** Format function for display: (value, rowData?) => string.
     *  Example: (val) => val?.toLocaleString('vi-VN') + ' ₫' */
    format?: (value: any, rowData?: any) => string;
    /** CSS class(es) applied to both header and body cells.
     *  Example: 'text-right font-semibold' */
    cssClass?: string;
    /** Edit input type: 'text' (default) | 'number' | 'date' | 'lookup' | 'table-lookup'.
     *  'date' shows a date picker. 'lookup' shows a searchable dropdown. 'table-lookup' shows a popup table. */
    editType?: 'text' | 'number' | 'date' | 'lookup' | 'table-lookup' | 'textarea';
    /** Date format for date picker (PrimeNG format). Default: 'dd/mm/yy'.
     *  Example: 'dd/mm/yy' → 11/03/2026, 'yy-mm-dd' → 2026-03-11 */
    editDateFormat?: string;
    /** Show time picker along with date picker. Default: false */
    editShowTime?: boolean;
    /** Options for lookup editor. Format: [{label, value}].
     *  Used when editType is 'lookup'. Renders a searchable p-select dropdown. */
    editOptions?: { label: string; value: any }[];
    /** Configuration for table-lookup editor.
     *  Used when editType is 'table-lookup'. Renders a popup overlay with searchable table. */
    editLookupConfig?: EditLookupConfig;
}
