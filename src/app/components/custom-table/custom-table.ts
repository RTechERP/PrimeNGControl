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
import { ColumnDef } from './column-def.model';

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
    lookupFilteredData: any[] = [];
    activeLookupCol: ColumnDef | null = null;
    activeLookupRowData: any = null;

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
        if (changes['data']) {
            this.buildFilterOptionsCache();
        }
        if (changes['columns'] && this.columns) {
            this._allColumns = [...this.columns];
        }
    }

    get visibleColumns(): ColumnDef[] {
        return this._allColumns.filter(c => !this._hiddenFields.has(c.field));
    }

    // --- Filter Options (auto-populated from data) ---
    buildFilterOptionsCache() {
        this.filterOptionsCache = {};
        if (!this._data?.length || !this.columns?.length) return;
        for (const col of this.columns) {
            if (col.filterOptions) {
                this.filterOptionsCache[col.field] = col.filterOptions;
            } else if (col.filterMode === 'dropdown' || col.filterMode === 'multiselect') {
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
            const row = cfg.data.find(d => d[cfg.valueField] === val);
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

    openTableLookup(event: Event, col: ColumnDef, rowData: any) {
        this.activeLookupCol = col;
        this.activeLookupRowData = rowData;
        this.lookupSearchText = '';
        this.lookupFilteredData = col.editLookupConfig?.data || [];
        this.lookupPanel.show(event);
    }

    filterLookupData() {
        const cfg = this.activeLookupCol?.editLookupConfig;
        if (!cfg) return;
        const term = this.lookupSearchText.toLowerCase();
        if (!term) {
            this.lookupFilteredData = cfg.data;
            return;
        }
        this.lookupFilteredData = cfg.data.filter(row =>
            cfg.columns.some(c => {
                const val = row[c.field];
                return val != null && String(val).toLowerCase().includes(term);
            })
        );
    }

    selectLookupRow(row: any) {
        if (this.activeLookupCol && this.activeLookupRowData) {
            const cfg = this.activeLookupCol.editLookupConfig!;
            this.activeLookupRowData[this.activeLookupCol.field] = row[cfg.valueField];
            this.lookupSelect.emit({
                selectedRow: row,
                field: this.activeLookupCol.field,
                rowData: this.activeLookupRowData
            });
        }
        this.lookupPanel.hide();
        this.activeLookupCol = null;
        this.activeLookupRowData = null;
    }

    isLookupRowSelected(row: any): boolean {
        if (!this.activeLookupCol || !this.activeLookupRowData) return false;
        const cfg = this.activeLookupCol.editLookupConfig;
        if (!cfg) return false;
        return this.activeLookupRowData[this.activeLookupCol.field] === row[cfg.valueField];
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

    onCellEditComplete(event: any) {
        // Cell edit is handled inline by PrimeNG
    }

    exportCSV() {
        this.dt.exportCSV();
    }
}
