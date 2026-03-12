import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Popover, PopoverModule } from 'primeng/popover';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MenuItem } from 'primeng/api';
import { ColumnDef, EditLookupConfig } from './column-def.model';

@Component({
    selector: 'app-custom-table',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, InputTextModule,
        SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule,
        ContextMenuModule, PopoverModule, DatePickerModule, TextareaModule
    ],
    templateUrl: './custom-table.html',
    styleUrl: './custom-table.css'
})
export class CustomTable implements OnChanges {
    @ViewChild('dt') dt!: Table;
    @ViewChild('cm') cm!: ContextMenu;
    @ViewChild('hcm') hcm!: ContextMenu;
    @ViewChild('lookupPanel') lookupPanel!: Popover;

    // --- Table Lookup State ---
    lookupSearchText: string = '';
    lookupColFilters: { [field: string]: string } = {};
    lookupFilteredData: any[] = [];
    lookupLoading: boolean = false;
    activeLookupCol: ColumnDef | null = null;
    activeLookupRowData: any = null;
    lookupSelectedRows: any[] = [];
    /** Cache of last-loaded data per field (for formatValue when using loadData) */
    private lookupDataCache: { [field: string]: any[] } = {};
    private lookupDebounceTimer: any = null;

    // --- Data ---
    private _originalData: any[] = [];
    private _data: any[] = [];

    @Input() set data(val: any[]) {
        this._originalData = val ? [...val] : [];
        this._data = val ? [...val] : [];
        this.buildFilterOptionsCache();
    }
    get data(): any[] {
        return this._data;
    }
    @Input() columns: ColumnDef[] = [];
    @Input() dataKey: string = '';
    @Input() loading: boolean = false;

    // --- Caption ---
    @Input() title: string = '';
    @Input() showGlobalFilter: boolean = false;
    @Input() globalFilterFields: string[] = [];

    // --- Layout ---
    @Input() resizable: boolean = true;
    @Input() resizeMode: string = 'fit';
    @Input() showGridlines: boolean = true;
    @Input() showColumnFilter: boolean = true;
    /** 'row' = filter inputs below header (default), 'menu' = filter icon in header opens popup */
    @Input() filterDisplay: 'row' | 'menu' = 'row';
    @Input() textWrap: boolean = false;
    @Input() stripedRows: boolean = false;

    // --- Scrollable ---
    @Input() scrollable: boolean = false;
    @Input() scrollHeight: string = '400px';

    // --- Virtual Scrolling ---
    @Input() virtualScroll: boolean = false;
    @Input() virtualScrollItemSize: number = 46;

    // --- Row Grouping ---
    @Input() rowGroupMode: 'subheader' | 'rowspan' | undefined = undefined;
    @Input() groupRowsBy: string = '';
    @Input() rowGroupShowFooter: boolean = false;
    @Input() expandableRowGroups: boolean = false;
    expandedRowKeys: { [key: string]: boolean } = {};

    // --- Pagination ---
    @Input() paginator: boolean = false;
    @Input() rows: number = 10;
    @Input() rowsPerPageOptions: number[] = [10, 20, 50];

    // --- Sorting ---
    @Input() sortMode: 'single' | 'multiple' = 'single';

    // --- Selection ---
    @Input() selectionMode: 'single' | 'multiple' | null = null;
    @Input() selection: any = null;
    @Output() selectionChange = new EventEmitter<any>();

    // --- Context Menu ---
    @Input() contextMenuItems: MenuItem[] = [];
    @Input() selectedContextRow: any = null;
    @Output() contextMenuSelectionChange = new EventEmitter<any>();

    // --- Column Reorder ---
    @Input() reorderableColumns: boolean = false;

    // --- Row Reorder ---
    @Input() reorderableRows: boolean = false;
    @Output() rowReorder = new EventEmitter<any>();

    // --- Table Lookup ---
    @Output() lookupSelect = new EventEmitter<{ selectedRow: any; field: string; rowData: any }>();

    // --- Row Expansion ---
    @Input() expandable: boolean = false;
    @Input() rowExpandMode: 'single' | 'multiple' = 'multiple';
    expandedRows: { [key: string]: boolean } = {};

    // --- Click Row Select (highlight active row on cell click, always single) ---
    /** Bật highlight dòng khi click bất kỳ cell nào. Luôn là single: click dòng khác → bỏ highlight dòng cũ.
     *  Hoạt động độc lập với selectionMode="multiple" (checkbox multi-select). */
    @Input() clickSelectRow: boolean = false;
    @Output() rowClick = new EventEmitter<any>();
    clickedRowKey: any = null;

    onRowClick(rowData: any) {
        if (!this.clickSelectRow) return;
        this.clickedRowKey = this.dataKey ? rowData[this.dataKey] : rowData;
        this.rowClick.emit(rowData);
    }

    isRowClicked(rowData: any): boolean {
        if (!this.clickSelectRow) return false;
        const key = this.dataKey ? rowData[this.dataKey] : rowData;
        return this.clickedRowKey === key;
    }

    // --- Footer ---
    @Input() showFooter: boolean = false;

    getFooterValue(col: ColumnDef): string {
        if (col.footer) {
            if (typeof col.footer === 'function') return col.footer(this.data);
            return col.footer;
        }
        if (col.footerType) {
            const vals = this.data
                .map(r => r[col.field])
                .filter(v => v != null && !isNaN(Number(v)))
                .map(Number);
            const fmt = col.footerFormat;
            switch (col.footerType) {
                case 'sum': return vals.reduce((s, v) => s + v, 0).toLocaleString(undefined, fmt);
                case 'avg': return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toLocaleString(undefined, fmt) : '';
                case 'count': return this.data.length.toString();
                case 'min': return vals.length ? Math.min(...vals).toLocaleString(undefined, fmt) : '';
                case 'max': return vals.length ? Math.max(...vals).toLocaleString(undefined, fmt) : '';
            }
        }
        return '';
    }

    /** Returns cssClass merged with auto text-align.
     *  Numeric columns → text-right; others → default (left).
     *  If base already contains an explicit alignment class, skip auto-align. */
    getAutoAlignClass(base: string | undefined, col: ColumnDef): string {
        const cls = base || '';
        if (cls.includes('text-right') || cls.includes('text-left') || cls.includes('text-center')) {
            return cls;
        }
        return (cls + (col.filterType === 'numeric' ? ' text-right' : '')).trim();
    }

    // --- Cell Editing ---
    @Input() editMode: 'cell' | 'row' | undefined = undefined;

    // --- CSV Export ---
    @Input() exportable: boolean = false;
    @Input() exportFilename: string = 'download';

    // --- State Persistence ---
    @Input() stateKey: string | undefined = undefined;
    @Input() stateStorage: 'session' | 'local' = 'local';

    // --- Header Context Menu ---
    headerMenuItems: MenuItem[] = [];
    activeSortField: string | null = null;
    private _allColumns: ColumnDef[] = [];
    private _hiddenFields: Set<string> = new Set();

    // --- Filter Options Cache ---
    filterOptionsCache: { [field: string]: { label: string; value: any }[] } = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] || changes['columns']) {
            this.buildFilterOptionsCache();
        }
        if (changes['columns'] && this.columns) {
            this._allColumns = [...this.columns];
        }
    }

    get visibleColumns(): ColumnDef[] {
        return this._allColumns.filter(c => !this._hiddenFields.has(c.field));
    }

    // --- Filter Options (auto-populated from data, or lazy-loaded) ---
    buildFilterOptionsCache() {
        this.filterOptionsCache = {};
        if (!this.columns?.length) return;
        for (const col of this.columns) {
            if (col.filterLoadOptions) {
                Promise.resolve(col.filterLoadOptions()).then(opts => {
                    this.filterOptionsCache[col.field] = opts;
                });
            } else if (col.filterOptions) {
                this.filterOptionsCache[col.field] = col.filterOptions;
            } else if ((col.filterMode === 'dropdown' || col.filterMode === 'multiselect') && this._data?.length) {
                const unique = [...new Set(this._data.map(d => d[col.field]).filter(v => v != null))];
                this.filterOptionsCache[col.field] = unique.map(v => ({ label: String(v), value: v }));
            }
        }
    }

    getFilterOptions(col: ColumnDef): { label: string; value: any }[] {
        return this.filterOptionsCache[col.field] || [];
    }


    onGlobalFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.dt.filterGlobal(value, 'contains');
    }

    onSelectionChange(selection: any) {
        this.selection = selection;
        this.selectionChange.emit(selection);
    }

    toggleGroup(group: string) {
        if (this.expandedRows[group]) {
            delete this.expandedRows[group];
        } else {
            this.expandedRows[group] = true;
        }
    }

    isGroupExpanded(group: string): boolean {
        return !!this.expandedRows[group];
    }

    onContextMenuSelect(event: any) {
        this.selectedContextRow = event.data;
        this.contextMenuSelectionChange.emit(event.data);
        if (this.selectionMode) {
            if (Array.isArray(this.selection)) {
                if (!this.selection.includes(event.data)) {
                    this.selection = [...this.selection, event.data];
                    this.selectionChange.emit(this.selection);
                }
            } else {
                this.selection = [event.data];
                this.selectionChange.emit(this.selection);
            }
        }
    }

    formatValue(col: ColumnDef, rowData: any): string {
        const val = rowData[col.field];
        if (col.format) {
            return col.format(val, rowData);
        }
        if (col.editType === 'date' && val instanceof Date) {
            return this.formatDate(val, col.editDateFormat || 'dd/mm/yy', col.editShowTime);
        }
        if (col.editType === 'lookup' && col.editOptions) {
            const opt = col.editOptions.find(o => o.value === val);
            if (opt) return opt.label;
        }
        if (col.editType === 'table-lookup' && col.editLookupConfig) {
            const cfg = col.editLookupConfig;
            const source = cfg.data || this.lookupDataCache[col.field] || [];
            if (cfg.multiSelect && Array.isArray(val)) {
                return val.map(v => {
                    const r = source.find(d => d[cfg.valueField] === v);
                    return r ? r[cfg.displayField || cfg.valueField] : v;
                }).join(', ');
            }
            const row = source.find(d => d[cfg.valueField] === val);
            if (row) return row[cfg.displayField || cfg.valueField];
        }
        return val != null ? val : '';
    }

    private formatDate(date: Date, fmt: string, showTime?: boolean): string {
        const pad = (n: number) => n < 10 ? '0' + n : '' + n;
        const dd = pad(date.getDate());
        const mm = pad(date.getMonth() + 1);
        const yy = date.getFullYear().toString();
        let result = fmt
            .replace('dd', dd)
            .replace('mm', mm)
            .replace('yy', yy);
        if (showTime) {
            result += ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
        }
        return result;
    }

    async openTableLookup(event: Event, col: ColumnDef, rowData: any) {
        this.activeLookupCol = col;
        this.activeLookupRowData = rowData;
        this.lookupSearchText = '';
        this.lookupColFilters = {};
        this.lookupSelectedRows = [];
        clearTimeout(this.lookupDebounceTimer);

        const cfg = col.editLookupConfig!;

        // Show panel immediately (may show loading spinner)
        this.lookupPanel.hide();
        setTimeout(() => this.lookupPanel.show(event));

        if (cfg.loadData) {
            this.lookupLoading = true;
            this.lookupFilteredData = [];
            try {
                const result = await Promise.resolve(cfg.loadData(''));
                this.lookupFilteredData = result;
                this.lookupDataCache[col.field] = result; // cache for formatValue
            } finally {
                this.lookupLoading = false;
            }
        } else {
            this.lookupFilteredData = cfg.data || [];
        }

        // Init selected rows after data is available
        if (cfg.multiSelect) {
            const currentVal: any[] = rowData[col.field] ?? [];
            this.lookupSelectedRows = this.lookupFilteredData.filter(r => currentVal.includes(r[cfg.valueField]));
        }
    }

    filterLookupData() {
        const cfg = this.activeLookupCol?.editLookupConfig;
        if (!cfg) return;

        if (cfg.loadData) {
            // Debounce API calls by 300ms
            clearTimeout(this.lookupDebounceTimer);
            this.lookupDebounceTimer = setTimeout(async () => {
                this.lookupLoading = true;
                try {
                    const result = await Promise.resolve(cfg.loadData!(this.lookupSearchText));
                    // Apply column-level filters client-side on returned data
                    this.lookupFilteredData = this.applyLookupColFilters(cfg, result);
                } finally {
                    this.lookupLoading = false;
                }
            }, 300);
            return;
        }

        // Static data: filter client-side
        const globalTerm = this.lookupSearchText.toLowerCase();
        this.lookupFilteredData = (cfg.data || []).filter(row => {
            if (globalTerm) {
                const matchesGlobal = cfg.columns.some(c => {
                    const val = row[c.field];
                    return val != null && String(val).toLowerCase().includes(globalTerm);
                });
                if (!matchesGlobal) return false;
            }
            return this.applyLookupColFilters(cfg, [row]).length > 0;
        });
    }

    private applyLookupColFilters(cfg: EditLookupConfig, data: any[]): any[] {
        return data.filter(row =>
            cfg.columns.every((c: { field: string }) => {
                const colTerm = (this.lookupColFilters[c.field] || '').toLowerCase();
                if (!colTerm) return true;
                const val = row[c.field];
                return val != null && String(val).toLowerCase().includes(colTerm);
            })
        );
    }

    /** Single-select: click any cell → select and close */
    selectLookupRow(row: any) {
        if (!this.activeLookupCol || !this.activeLookupRowData) return;
        const cfg = this.activeLookupCol.editLookupConfig!;
        if (cfg.multiSelect) return; // handled by toggleLookupRow
        this.activeLookupRowData[this.activeLookupCol.field] = row[cfg.valueField];
        this.lookupSelect.emit({ selectedRow: row, field: this.activeLookupCol.field, rowData: this.activeLookupRowData });
        this.lookupPanel.hide();
        this.activeLookupCol = null;
        this.activeLookupRowData = null;
    }

    /** Multi-select: click checkbox to toggle row */
    toggleLookupRow(row: any) {
        const cfg = this.activeLookupCol?.editLookupConfig;
        if (!cfg) return;
        const idx = this.lookupSelectedRows.findIndex(r => r[cfg.valueField] === row[cfg.valueField]);
        if (idx >= 0) {
            this.lookupSelectedRows = this.lookupSelectedRows.filter((_, i) => i !== idx);
        } else {
            this.lookupSelectedRows = [...this.lookupSelectedRows, row];
        }
    }

    /** Multi-select: confirm button → apply and close */
    confirmLookupSelection() {
        if (!this.activeLookupCol || !this.activeLookupRowData) return;
        const cfg = this.activeLookupCol.editLookupConfig!;
        this.activeLookupRowData[this.activeLookupCol.field] =
            this.lookupSelectedRows.map(r => r[cfg.valueField]);
        this.lookupSelect.emit({
            selectedRow: this.lookupSelectedRows,
            field: this.activeLookupCol.field,
            rowData: this.activeLookupRowData
        });
        this.lookupPanel.hide();
        this.activeLookupCol = null;
        this.activeLookupRowData = null;
    }

    isLookupRowSelected(row: any): boolean {
        const cfg = this.activeLookupCol?.editLookupConfig;
        if (!cfg) return false;
        if (cfg.multiSelect) {
            return this.lookupSelectedRows.some(r => r[cfg.valueField] === row[cfg.valueField]);
        }
        if (!this.activeLookupRowData) return false;
        const cur = this.activeLookupRowData[this.activeLookupCol!.field];
        return cur === row[cfg.valueField];
    }

    // =============================================
    // Header Context Menu (DevExpress-style)
    // =============================================
    onHeaderContextMenu(event: any, field: string) {
        this.activeSortField = field;
        const col = this._allColumns.find(c => c.field === field);

        this.headerMenuItems = [];

        // --- Sort ---
        if (col?.sortable) {
            this.headerMenuItems.push(
                { label: 'Sắp xếp tăng', icon: 'pi pi-sort-amount-up', command: () => this.sortAscending() },
                { label: 'Sắp xếp giảm', icon: 'pi pi-sort-amount-down', command: () => this.sortDescending() },
                { label: 'Bỏ sắp xếp', icon: 'pi pi-sort-alt-slash', command: () => this.clearSort() },
                { separator: true }
            );
        }

        // --- Column Visibility ---
        this.headerMenuItems.push(
            { label: 'Ẩn cột này', icon: 'pi pi-eye-slash', command: () => this.hideColumn(field) },
            {
                label: 'Hiện/Ẩn cột', icon: 'pi pi-eye',
                items: this._allColumns.map(c => ({
                    label: c.header,
                    icon: this._hiddenFields.has(c.field) ? 'pi pi-square' : 'pi pi-check-square',
                    command: () => this.toggleColumnVisible(c.field)
                }))
            },
            { separator: true }
        );

        // --- Column Sizing ---
        this.headerMenuItems.push(
            { label: 'Tự động co cột', icon: 'pi pi-arrows-h', command: () => this.autoFitColumn(field) },
            { label: 'Tự động co tất cả cột', icon: 'pi pi-arrows-alt', command: () => this.autoFitAllColumns() },
            { separator: true }
        );

        // --- Filter & Search Toggles ---
        this.headerMenuItems.push(
            {
                label: this.showColumnFilter ? 'Ẩn lọc dữ liệu' : 'Hiển thị lọc dữ liệu',
                icon: 'pi pi-filter',
                command: () => { this.showColumnFilter = !this.showColumnFilter; }
            },
            {
                label: this.showGlobalFilter ? 'Ẩn thanh tìm kiếm' : 'Hiển thị thanh tìm kiếm',
                icon: 'pi pi-search',
                command: () => { this.showGlobalFilter = !this.showGlobalFilter; }
            }
        );

        this.hcm.show(event);
        event.preventDefault();
        event.stopPropagation();
    }

    sortAscending() {
        if (!this.activeSortField) return;
        this.dt.sortField = this.activeSortField;
        this.dt.sortOrder = 1;
        this.dt.sortSingle();
    }

    sortDescending() {
        if (!this.activeSortField) return;
        this.dt.sortField = this.activeSortField;
        this.dt.sortOrder = -1;
        this.dt.sortSingle();
    }

    clearSort() {
        this.dt.sortOrder = 0;
        this.dt.sortField = undefined;
        this.dt.multiSortMeta = [];
        this.activeSortField = null;
        this._data = [...this._originalData];
        this.dt.value = this._data;
        if (this.dt.tableService) {
            this.dt.tableService.onSort(null);
        }
    }

    hideColumn(field: string) {
        this._hiddenFields.add(field);
        this.columns = this.visibleColumns;
    }

    toggleColumnVisible(field: string) {
        if (this._hiddenFields.has(field)) {
            this._hiddenFields.delete(field);
        } else {
            if (this.visibleColumns.length <= 1) return;
            this._hiddenFields.add(field);
        }
        this.columns = this.visibleColumns;
    }

    autoFitColumn(field: string) {
        const col = this.columns.find(c => c.field === field);
        if (col) {
            col.width = 'auto';
        }
    }

    autoFitAllColumns() {
        this.columns.forEach(c => c.width = 'auto');
    }

    onRowReorder(event: any) {
        this.rowReorder.emit(event);
    }

    onColResize() {
        // After resize, recalculate sticky left offsets for frozen columns.
        // PrimeNG doesn't re-run initFrozenColumns on resize in v21.
        setTimeout(() => this.recalcFrozenPositions());
    }

    private recalcFrozenPositions() {
        const host = (this.dt as any).el?.nativeElement as HTMLElement;
        if (!host) return;
        ['thead', 'tbody', 'tfoot'].forEach(section => {
            const rows = host.querySelectorAll<HTMLTableRowElement>(`${section} tr`);
            rows.forEach(row => {
                let offset = 0;
                const cells = row.querySelectorAll<HTMLElement>(
                    '.p-datatable-frozen-column:not(.p-datatable-frozen-column-right)'
                );
                cells.forEach(cell => {
                    cell.style.left = offset + 'px';
                    offset += cell.offsetWidth;
                });
            });
        });
    }

    onCellEditComplete(_event: any) {
        // Cell edit is handled inline by PrimeNG
    }

    exportCSV() {
        this.dt.exportCSV();
    }
}
