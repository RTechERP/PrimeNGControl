import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, OnInit, SimpleChanges, inject, HostListener, HostBinding, ElementRef } from '@angular/core';
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
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem, FilterService } from 'primeng/api';
import { ColumnDef, EditLookupConfig } from './column-def.model';
import { TableLayoutData, TableColumnLayout } from './table-layout.model';
import { TableLayoutService } from './table-layout.service';

@Component({
    selector: 'app-custom-table',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, InputTextModule,
        SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule,
        ContextMenuModule, PopoverModule, DatePickerModule, TextareaModule, CheckboxModule,
        TabsModule, ProgressBarModule, TagModule, DialogModule, OrderListModule, TooltipModule
    ],
    templateUrl: './custom-table.html',
    styleUrl: './custom-table.css'
})
export class CustomTable implements OnChanges, OnInit {
    @ViewChild('dt') dt!: Table;
    @ViewChild('cm') cm!: ContextMenu;
    @ViewChild('hcm') hcm!: ContextMenu;
    @ViewChild('lookupPanel') lookupPanel!: Popover;

    private el = inject(ElementRef);
    private filterService = inject(FilterService);
    private layoutService = inject(TableLayoutService);
    @HostBinding('attr.tabindex') tabindex = '0';

    constructor() {
        this.filterService.register('dateRange', (value: any, filter: Date[]) => {
            if (!filter || !filter[0]) return true;
            if (value == null) return false;
            const date = new Date(value);
            date.setHours(0, 0, 0, 0);
            const start = new Date(filter[0]);
            start.setHours(0, 0, 0, 0);
            if (!filter[1]) return date.getTime() >= start.getTime();
            const end = new Date(filter[1]);
            end.setHours(23, 59, 59, 999);
            return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
        });
    }

    // --- Highlighting State ---
    globalFilterValue: string = '';

    // --- Excel Filter State ---
    excelFilterSearchText: { [field: string]: string } = {};
    activeFilterTab: { [field: string]: string } = {};
    customFilterMatchMode: { [field: string]: string } = {};
    customFilterValue: { [field: string]: any } = {};

    // --- DateTime Filter State ---
    dateFilterMode: { [field: string]: 'single' | 'range' } = {};
    dateRangeFilter: { [field: string]: Date[] } = {};
    dateSingleFilter: { [field: string]: Date | null } = {};

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

    // --- Cell Value Cache (performance: avoid re-calling format() on every CD cycle) ---
    private cellValueCache = new Map<string, string>();

    // --- Cell Focus State ---
    focusedCell: { rowData: any, colField: string } | null = null;
    private lookupDebounceTimer: any = null;

    // --- Data ---
    private _originalData: any[] = [];
    private _data: any[] = [];

    @Input() set data(val: any[]) {
        this._originalData = val ?? [];
        this._data = val ?? [];
        this.cellValueCache.clear();
        this.scheduleBuildFilterOptionsCache();
    }
    get data(): any[] {
        return this._data;
    }
    @Input() columns: ColumnDef[] = [];
    @Input() dataKey: string = '';
    @Input() loading: boolean = false;

    // --- Layout Persistence ---
    /** Unique key identifying this table for layout storage (e.g. 'product-table').
     *  When set, layout save/load UI becomes available and auto-load fires on init. */
    @Input() layoutKey: string = '';
    /** Emitted when user saves a layout. Payload: the full TableLayoutData object. */
    @Output() layoutSave = new EventEmitter<TableLayoutData>();
    /** Emitted when a layout is applied (loaded). Payload: the applied TableLayoutData. */
    @Output() layoutLoad = new EventEmitter<TableLayoutData>();
    /** Emitted when a layout is deleted. Payload: the deleted layout's _id. */
    @Output() layoutDelete = new EventEmitter<string>();

    // --- Caption ---
    @Input() title: string = '';
    @Input() minWidth: string = '50rem';
    @Input() showGlobalFilter: boolean = false;
    @Input() globalFilterFields: string[] = [];

    get actualGlobalFilterFields(): string[] {
        if (this.globalFilterFields && this.globalFilterFields.length > 0) {
            return this.globalFilterFields;
        }
        return this.columns ? this.columns.filter(c => c.field).map(c => c.field) : [];
    }

    // --- Layout ---
    @Input() height: string = '';
    @HostBinding('style.height') get hostHeight() { return this.height || null; }
    @HostBinding('style.display') get hostDisplay() { return this.height ? 'flex' : null; }
    @HostBinding('style.flexDirection') get hostFlexDir() { return this.height ? 'column' : null; }
    @HostBinding('style.minHeight') get hostMinHeight() { return this.height ? '0' : null; }
    @HostBinding('style.overflow') get hostOverflow() { return this.height ? 'hidden' : null; }
    @Input() resizable: boolean = true;
    @Input() resizeMode: string = 'expand';
    @Input() showGridlines: boolean = true;
    @Input() fontSize: string = '10px';
    @HostBinding('style.--table-font-size') get tableFontSizeVar() { return this.fontSize; }
    @HostBinding('style.--virtual-row-height') get virtualRowHeightVar() { return this.virtualScroll ? this.virtualScrollItemSize + 'px' : null; }
    @HostBinding('class.vs-active') get vsActiveClass() { return this.virtualScroll; }
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
    @Output() selectedContextRowChange = new EventEmitter<any>();
    @Output() contextMenuSelectionChange = new EventEmitter<any>();

    // --- Column Reorder ---
    @Input() reorderableColumns: boolean = false;

    // --- Row Reorder ---
    @Input() reorderableRows: boolean = false;
    @Output() rowReorder = new EventEmitter<any>();

    // --- Table Lookup ---
    @Output() lookupSelect = new EventEmitter<{ selectedRow: any; field: string; rowData: any }>();

    // --- Cell Action (fired for clickable columns, e.g. delete icon) ---
    @Output() cellAction = new EventEmitter<{ field: string; rowData: any }>();

    // --- Header Cell Action (fired for headerClickable columns, e.g. upload button in header) ---
    @Output() headerCellAction = new EventEmitter<{ field: string }>();

    @Output() rowDblClick = new EventEmitter<any>();

    onRowDblClick(rowData: any) {
        this.rowDblClick.emit(rowData);
    }

    onHeaderCellClick(event: Event, col: ColumnDef) {
        event.stopPropagation();
        if (col.headerClickable) {
            this.headerCellAction.emit({ field: col.field });
        }
    }

    // --- Row Expansion ---
    @Input() expandable: boolean = false;
    @Input() rowExpandMode: 'single' | 'multiple' = 'multiple';
    expandedRows: { [key: string]: boolean } = {};

    // --- Click Row Select (highlight active row on cell click, always single) ---
    /** Bật highlight dòng khi click bất kỳ cell nào. Luôn là single: click dòng khác → bỏ highlight dòng cũ.
     *  Hoạt động độc lập với selectionMode="multiple" (checkbox multi-select). */
    @Input() clickSelectRow: boolean = false;
    // --- Styling ---
    @Input() rowClass: ((rowData: any) => string | string[] | Set<string> | { [klass: string]: any }) | null = null;
    @Input() headerGroups: any[][] = [];

    // --- Column Chooser ---
    showColumnChooser: boolean = false;
    chooserColumns: ColumnDef[] = [];
    @Output() rowClick = new EventEmitter<any>();
    @Output() rowDoubleClick = new EventEmitter<any>();
    clickedRowKey: any = null;

    onRowClick(rowData: any) {
        if (this.clickSelectRow) {
            const newKey = this.dataKey ? rowData[this.dataKey] : rowData;
            if (this.clickedRowKey !== newKey) {
                const focusedKey = this.focusedCell
                    ? (this.dataKey ? this.focusedCell.rowData[this.dataKey] : this.focusedCell.rowData)
                    : null;
                if (focusedKey !== newKey) {
                    this.focusedCell = null;
                }
            }
            this.clickedRowKey = newKey;
        }
        this.rowClick.emit(rowData);
    }

    onRowDoubleClick(rowData: any) {
        this.rowDoubleClick.emit(rowData);
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

    // --- State Persistence (PrimeNG built-in) ---
    @Input() stateKey: string | undefined = undefined;
    @Input() stateStorage: 'session' | 'local' = 'local';

    // --- Layout Dialog State ---
    showLayoutDialog: boolean = false;
    layoutDialogTab: string = '0';
    layoutList: TableLayoutData[] = [];
    layoutNameInput: string = '';
    layoutSaving: boolean = false;
    layoutLoading: boolean = false;
    private _initialColumns: ColumnDef[] = [];
    private _initialShowColumnFilter: boolean = true;
    private _initialShowGlobalFilter: boolean = false;
    private _initialFontSize: string = '10px';
    private _initialTextWrap: boolean = false;
    private _layoutInitDone: boolean = false;

    // --- Header Context Menu ---
    headerMenuItems: MenuItem[] = [];
    activeSortField: string | null = null;
    private _allColumns: ColumnDef[] = [];
    private _hiddenFields: Set<string> = new Set();

    // --- Filter Options Cache ---
    filterOptionsCache: { [field: string]: { label: string; value: any }[] } = {};
    private _cacheScheduleId: any = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['columns'] && this.columns) {
            // Backup initial columns on first set (before any layout is applied)
            if (!this._layoutInitDone) {
                this._initialColumns = this.columns.map(c => ({ ...c }));
                this._initialShowColumnFilter = this.showColumnFilter;
                this._initialShowGlobalFilter = this.showGlobalFilter;
                this._initialFontSize = this.fontSize;
                this._initialTextWrap = this.textWrap;
            }
            this._allColumns = [...this.columns];
            this.scheduleBuildFilterOptionsCache();
        }
    }

    ngOnInit(): void {
        // Auto-load default layout when layoutKey is provided
        if (this.layoutKey) {
            this.autoLoadDefaultLayout();
        }
    }

    get visibleColumns(): ColumnDef[] {
        return this._allColumns.filter(c => !this._hiddenFields.has(c.field));
    }

    // --- Filter Options (auto-populated from data, or lazy-loaded) ---
    scheduleBuildFilterOptionsCache() {
        if (this._cacheScheduleId != null) return;
        this._cacheScheduleId = setTimeout(() => {
            this._cacheScheduleId = null;
            this.buildFilterOptionsCache();
        }, 0);
    }

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

    // --- TrackBy ---
    trackByField(_: number, col: ColumnDef): string { return col.field; }
    trackByIndex(i: number): number { return i; }


    onGlobalFilter(event: Event) {
        this.globalFilterValue = (event.target as HTMLInputElement).value;
        this.cellValueCache.clear();
        this.dt.filterGlobal(this.globalFilterValue, 'contains');
    }

    getHighlightedText(text: any): string {
        if (!this.globalFilterValue || text == null) return String(text || '');
        const str = String(text);
        const term = this.globalFilterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${term})`, 'gi');
        return str.replace(regex, '<mark>$1</mark>');
    }

    /** Memoized cell value: gọi formatValue + getHighlightedText đúng 1 lần/cell, cache lại cho các CD cycle tiếp theo */
    getCellValue(col: ColumnDef, rowData: any): string {
        const rowKey = this.dataKey ? rowData[this.dataKey] : null;
        const cacheKey = rowKey != null
            ? `${col.field}__${rowKey}__${this.globalFilterValue}`
            : null;
        if (cacheKey) {
            const cached = this.cellValueCache.get(cacheKey);
            if (cached !== undefined) return cached;
        }
        const result = this.getHighlightedText(this.formatValue(col, rowData));
        if (cacheKey) this.cellValueCache.set(cacheKey, result);
        return result;
    }

    isFilterSelected(value: any[], val: any): boolean {
        return !!(value && value.includes(val));
    }

    toggleFilter(value: any[], val: any, filterCallback: (v: any) => void) {
        const current = value || [];
        if (current.includes(val)) {
            filterCallback(current.filter(v => v !== val));
        } else {
            filterCallback([...current, val]);
        }
    }

    selectAllFilter(col: ColumnDef, filterCallback: (v: any) => void) {
        const options = this.getFilterOptions(col);
        filterCallback(options.map(o => o.value));
    }

    clearFilter(filterCallback: (v: any) => void) {
        filterCallback(null);
    }

    isAllFilterSelected(value: any[], col: ColumnDef): boolean {
        const options = this.getFilterOptions(col);
        if (!options.length) return false;
        return !!(value && value.length === options.length);
    }

    toggleAllFilter(value: any[], col: ColumnDef, filterCallback: (v: any) => void) {
        if (this.isAllFilterSelected(value, col)) {
            filterCallback(null);
        } else {
            const options = this.getFilterOptions(col);
            filterCallback(options.map(o => o.value));
        }
    }

    getDefaultMatchMode(filterType: string = 'text'): string {
        if (filterType === 'numeric') return 'equals';
        if (filterType === 'date') return 'dateIs';
        return 'startsWith';
    }

    getMatchMode(field: string, filterType: string = 'text'): string {
        if (this.activeFilterTab[field] === '1') {
            return this.customFilterMatchMode[field] || this.getDefaultMatchMode(filterType);
        }
        return 'in';
    }

    getCustomFilterMatchModes(filterType: string = 'text'): any[] {
        if (filterType === 'numeric') {
            return [
                { label: 'Equals', value: 'equals' },
                { label: 'Not Equals', value: 'notEquals' },
                { label: 'Less Than', value: 'lt' },
                { label: 'Less Than or Equal To', value: 'lte' },
                { label: 'Greater Than', value: 'gt' },
                { label: 'Greater Than or Equal To', value: 'gte' }
            ];
        } else if (filterType === 'date') {
            return [
                { label: 'Is', value: 'dateIs' },
                { label: 'Is Not', value: 'dateIsNot' },
                { label: 'Before', value: 'dateBefore' },
                { label: 'After', value: 'dateAfter' }
            ];
        }
        return [
            { label: 'Begins With', value: 'startsWith' },
            { label: 'Contains', value: 'contains' },
            { label: 'Ends With', value: 'endsWith' },
            { label: 'Equals', value: 'equals' },
            { label: 'Not Equals', value: 'notEquals' }
        ];
    }

    applyCustomFilter(field: string, checkboxValue: any, filterCallback: Function) {
        if (this.activeFilterTab[field] === '1') {
            filterCallback(this.customFilterValue[field]);
        } else {
            filterCallback(checkboxValue);
        }
    }

    clearCustomFilter(field: string, filterCallback: Function) {
        this.customFilterValue[field] = null;
        filterCallback(null);
    }



    getFilteredOptions(col: ColumnDef): { label: string; value: any }[] {

        const options = this.getFilterOptions(col);
        const term = (this.excelFilterSearchText[col.field] || '').toLowerCase();
        if (!term) return options;
        return options.filter(o => o.label.toLowerCase().includes(term));
    }

    onSelectionChange(selection: any) {
        this.selection = selection;
        this.selectionChange.emit(selection);
        this.focusedCell = null;
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
        if (this.contextMenuItems) {
            this.contextMenuItems.forEach(item => (item as any).data = event.data);
        }
        this.selectedContextRowChange.emit(event.data);
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
    toggleAllLookupRows() {
        if (this.lookupSelectedRows.length === this.lookupFilteredData.length) {
            this.lookupSelectedRows = [];
        } else {
            this.lookupSelectedRows = [...this.lookupFilteredData];
        }
    }

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
            { label: 'Cột nâng cao', icon: 'pi pi-list', command: () => this.openColumnChooser() },
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

        // --- Layout Save/Load (only when layoutKey is set) ---
        if (this.layoutKey) {
            this.headerMenuItems.push(
                { separator: true },
                { label: 'Lưu layout hiện tại', icon: 'pi pi-save', command: () => this.openLayoutDialog('0') },
                { label: 'Quản lý layout', icon: 'pi pi-cog', command: () => this.openLayoutDialog('1') },
                { label: 'Reset layout mặc định', icon: 'pi pi-refresh', command: () => this.resetLayout() }
            );
        }

        // Tính không gian còn lại bên dưới vị trí click để submenu không tràn viewport
        const availableBelow = window.innerHeight - (event.clientY ?? 0) - 12;
        document.documentElement.style.setProperty(
            '--tbl-submenu-max-height',
            Math.max(Math.min(availableBelow, 240), 80) + 'px'
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

    // =============================================
    // Column Chooser (Advanced)
    // =============================================
    openColumnChooser() {
        // Deep copy the internal visible columns
        this.chooserColumns = [...this.columns];
        // Append hidden columns at the end
        const visibleFields = new Set(this.columns.map(c => c.field));
        this._allColumns.forEach(c => {
            if (!visibleFields.has(c.field)) {
                this.chooserColumns.push(c);
            }
        });
        this.showColumnChooser = true;
    }

    private _syncChooserToColumns() {
        this.columns = this.chooserColumns.filter(c => !this._hiddenFields.has(c.field));
        const chosenFields = new Set(this.columns.map(c => c.field));
        const newAllColumns = [...this.columns];
        this._allColumns.forEach(c => {
            if (!chosenFields.has(c.field)) newAllColumns.push(c);
        });
        this._allColumns = newAllColumns;
    }

    applyColumnChooser() {
        this._syncChooserToColumns();
        this.showColumnChooser = false;
    }

    closeColumnChooser() {
        this.showColumnChooser = false;
    }

    isColumnHidden(field: string): boolean {
        return this._hiddenFields.has(field);
    }

    toggleChooserColumnVisible(event: any, field: string) {
        event?.originalEvent?.stopPropagation();
        this.toggleColumnVisible(field);
        this._syncChooserToColumns();
    }

    // =============================================
    // Cell Focus & Copy
    // =============================================
    onCellClick(event: MouseEvent, col: ColumnDef, rowData: any) {
        // Set focus state
        this.focusedCell = { rowData, colField: col.field };

        // Ensure this component host gets browser focus for keyboard events
        this.el.nativeElement.focus();

        // Handle original table-lookup click behavior
        if (col.editType === 'table-lookup' && col.editable && this.editMode) {
            this.openTableLookup(event, col, rowData);
        } else if (col.clickable) {
            this.cellAction.emit({ field: col.field, rowData });
        }
    }

    isCellFocused(rowData: any, colField: string): boolean {
        return this.focusedCell?.rowData === rowData && this.focusedCell?.colField === colField;
    }

    // =============================================
    // DateTime Filter
    // =============================================
    toggleDateFilterMode(field: string, filterCallback: Function) {
        this.dateFilterMode[field] = this.dateFilterMode[field] === 'range' ? 'single' : 'range';
        this.dateRangeFilter[field] = [];
        this.dateSingleFilter[field] = null;
        filterCallback(null);
    }

    onDateRangeChange(field: string, value: Date[], filterCallback: Function) {
        this.dateRangeFilter[field] = value;
        if (value && value.length >= 2 && value[0] && value[1]) {
            filterCallback(value);
        } else if (!value || value.length === 0) {
            filterCallback(null);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            if (this.focusedCell) {
                // Determine the cell value
                const colDef = this.columns.find(c => c.field === this.focusedCell?.colField);
                let textToCopy = '';
                if (colDef) {
                    const rawValue = this.focusedCell.rowData[colDef.field];
                    textToCopy = colDef.format ? colDef.format(rawValue, this.focusedCell.rowData) : rawValue;
                }

                if (textToCopy !== undefined && textToCopy !== null) {
                    navigator.clipboard.writeText(String(textToCopy)).catch(err => {
                        console.error('Failed to copy cell text: ', err);
                    });
                }
            }
        }
    }

    // =============================================
    // Layout Persistence — Save / Load / Reset
    // =============================================

    /** Collect current table state into a serializable layout object */
    getLayoutData(layoutName: string = 'Untitled'): TableLayoutData {
        const columnsLayout: TableColumnLayout[] = this._allColumns.map((col, idx) => ({
            field: col.field,
            width: col.width,
            hidden: this._hiddenFields.has(col.field),
            order: idx,
            frozen: col.frozen,
            alignFrozen: col.alignFrozen
        }));

        // Capture actual widths from DOM if available (after user resizes columns)
        const host = (this.dt as any)?.el?.nativeElement as HTMLElement;
        if (host) {
            const headerCells = host.querySelectorAll<HTMLElement>('.p-datatable-thead > tr:not(.filter-header-row) > th');
            // Skip control columns (reorder, expand, checkbox)
            let offset = 0;
            if (this.reorderableRows) offset++;
            if (this.expandable) offset++;
            if (this.selectionMode === 'multiple') offset++;

            // Also skip the hidden sizing row — get only the main header row
            const mainRow = host.querySelectorAll<HTMLElement>('.p-datatable-thead > tr');
            let visibleHeaderCells: HTMLElement[] = [];
            mainRow.forEach(row => {
                if (row.style.height !== '0px' && row.querySelectorAll('th').length > 0) {
                    // this is a real header row
                    const cells = row.querySelectorAll<HTMLElement>('th');
                    if (cells.length > visibleHeaderCells.length) {
                        visibleHeaderCells = Array.from(cells);
                    }
                }
            });

            const visibleCols = this.columns;
            for (let i = 0; i < visibleCols.length; i++) {
                const cellIdx = i + offset;
                const cell = visibleHeaderCells[cellIdx];
                if (cell) {
                    const layoutCol = columnsLayout.find(c => c.field === visibleCols[i].field);
                    if (layoutCol) {
                        layoutCol.width = cell.offsetWidth + 'px';
                    }
                }
            }
        }

        return {
            layoutKey: this.layoutKey,
            layoutName,
            columns: columnsLayout,
            showColumnFilter: this.showColumnFilter,
            showGlobalFilter: this.showGlobalFilter,
            sortField: this.dt?.sortField as string | undefined,
            sortOrder: this.dt?.sortOrder,
            fontSize: this.fontSize,
            textWrap: this.textWrap
        };
    }

    /** Apply a layout preset to the table */
    applyLayout(layout: TableLayoutData): void {
        if (!layout?.columns?.length) return;

        // Build a map of original column definitions (from _initialColumns)
        const colDefMap = new Map<string, ColumnDef>();
        this._initialColumns.forEach(c => colDefMap.set(c.field, { ...c }));
        // Also include any columns that were added dynamically
        this._allColumns.forEach(c => {
            if (!colDefMap.has(c.field)) colDefMap.set(c.field, { ...c });
        });

        // Sort by layout order
        const sortedLayout = [...layout.columns].sort((a, b) => a.order - b.order);

        // Rebuild _allColumns in the layout order, applying width/frozen settings
        const newAllColumns: ColumnDef[] = [];
        const newHiddenFields = new Set<string>();

        for (const lc of sortedLayout) {
            const def = colDefMap.get(lc.field);
            if (!def) continue; // Column no longer exists in definition
            def.width = lc.width;
            def.frozen = lc.frozen;
            def.alignFrozen = lc.alignFrozen;
            newAllColumns.push(def);
            if (lc.hidden) newHiddenFields.add(lc.field);
        }

        // Add any columns missing from layout (new columns added since layout was saved)
        colDefMap.forEach((def, field) => {
            if (!sortedLayout.some(lc => lc.field === field)) {
                newAllColumns.push(def);
            }
        });

        this._allColumns = newAllColumns;
        this._hiddenFields = newHiddenFields;
        this.columns = this.visibleColumns;

        // Apply table-level settings
        this.showColumnFilter = layout.showColumnFilter;
        this.showGlobalFilter = layout.showGlobalFilter;
        if (layout.fontSize) this.fontSize = layout.fontSize;
        if (layout.textWrap !== undefined) this.textWrap = layout.textWrap;

        // Apply sort
        if (layout.sortField && this.dt) {
            this.dt.sortField = layout.sortField;
            this.dt.sortOrder = layout.sortOrder || 1;
            this.dt.sortSingle();
        }

        // Recalculate frozen positions
        setTimeout(() => this.recalcFrozenPositions());

        this.layoutLoad.emit(layout);
    }

    /** Reset to the original column definitions */
    resetLayout(): void {
        this._hiddenFields.clear();
        this._allColumns = this._initialColumns.map(c => ({ ...c }));
        this.columns = [...this._allColumns];
        this.showColumnFilter = this._initialShowColumnFilter;
        this.showGlobalFilter = this._initialShowGlobalFilter;
        this.fontSize = this._initialFontSize;
        this.textWrap = this._initialTextWrap;

        // Clear sort
        if (this.dt) {
            this.dt.sortField = undefined;
            this.dt.sortOrder = 0;
            this.dt.multiSortMeta = [];
            this._data = [...this._originalData];
            this.dt.value = this._data;
            if (this.dt.tableService) {
                this.dt.tableService.onSort(null);
            }
        }

        this.scheduleBuildFilterOptionsCache();
        setTimeout(() => this.recalcFrozenPositions());
    }

    /** Auto-load default layout from API on component init */
    private autoLoadDefaultLayout(): void {
        this.layoutService.getLayouts(this.layoutKey).subscribe((layouts: TableLayoutData[]) => {
            this.layoutList = layouts;
            const defaultLayout = layouts.find((l: TableLayoutData) => l.isDefault);
            if (defaultLayout) {
                // Defer to next tick to ensure columns are initialized
                setTimeout(() => {
                    this.applyLayout(defaultLayout);
                    this._layoutInitDone = true;
                });
            } else {
                this._layoutInitDone = true;
            }
        });
    }

    // --- Layout Dialog ---

    openLayoutDialog(tab: string = '0'): void {
        this.layoutDialogTab = tab;
        this.layoutNameInput = '';
        this.showLayoutDialog = true;
        this.refreshLayoutList();
    }

    refreshLayoutList(): void {
        if (!this.layoutKey) return;
        this.layoutLoading = true;
        this.layoutService.getLayouts(this.layoutKey).subscribe({
            next: (layouts: TableLayoutData[]) => {
                this.layoutList = layouts;
                this.layoutLoading = false;
            },
            error: () => {
                this.layoutLoading = false;
            }
        });
    }

    saveCurrentLayout(): void {
        const name = this.layoutNameInput?.trim();
        if (!name) return;

        const layout = this.getLayoutData(name);
        this.layoutSaving = true;

        this.layoutService.saveLayout(layout).subscribe({
            next: (saved: TableLayoutData) => {
                this.layoutSaving = false;
                this.layoutNameInput = '';
                this.layoutSave.emit(saved);
                this.refreshLayoutList();
            },
            error: (err: any) => {
                this.layoutSaving = false;
                console.error('[CustomTable] Failed to save layout:', err);
            }
        });
    }

    loadLayout(layout: TableLayoutData): void {
        this.applyLayout(layout);
        this.showLayoutDialog = false;
    }

    deleteLayoutItem(layout: TableLayoutData): void {
        if (!layout._id) return;
        this.layoutService.deleteLayout(layout._id).subscribe({
            next: () => {
                this.layoutDelete.emit(layout._id);
                this.refreshLayoutList();
            },
            error: (err: any) => {
                console.error('[CustomTable] Failed to delete layout:', err);
            }
        });
    }

    setDefaultLayout(layout: TableLayoutData): void {
        if (!layout._id) return;
        this.layoutService.setDefault(layout._id).subscribe({
            next: () => {
                // Update local list
                this.layoutList.forEach(l => l.isDefault = (l._id === layout._id));
            },
            error: (err: any) => {
                console.error('[CustomTable] Failed to set default layout:', err);
            }
        });
    }
}
