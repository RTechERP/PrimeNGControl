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
import { MenuItem } from 'primeng/api';
import { ColumnDef } from './column-def.model';

@Component({
    selector: 'app-custom-table',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, InputTextModule,
        SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule,
        ContextMenuModule
    ],
    templateUrl: './custom-table.html',
    styleUrl: './custom-table.css'
})
export class CustomTable implements OnChanges {
    @ViewChild('dt') dt!: Table;
    @ViewChild('cm') cm!: ContextMenu;
    @ViewChild('hcm') hcm!: ContextMenu;

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
    @Input() loading: boolean = false; // New property for loading state

    // --- Caption ---
    @Input() title: string = '';
    @Input() showGlobalFilter: boolean = false;
    @Input() globalFilterFields: string[] = [];

    // --- Layout ---
    @Input() resizable: boolean = true;
    @Input() resizeMode: string = 'fit';
    @Input() showGridlines: boolean = true;
    @Input() showColumnFilter: boolean = true;
    @Input() textWrap: boolean = false; // Global flag for text wrapping

    // --- Scrollable ---
    @Input() scrollable: boolean = false;
    @Input() scrollHeight: string = '400px';

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

    headerMenuItems: MenuItem[] = [
        { label: 'Clear Sort', icon: 'pi pi-sort-alt-slash', command: () => this.clearSort() }
    ];
    activeSortField: string | null = null;

    // --- Filter Options Cache ---
    filterOptionsCache: { [field: string]: { label: string; value: any }[] } = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['columns']) {
            this.buildFilterOptionsCache();
        }
        // Initialize all row groups as expanded when data or groupRowsBy changes
        if ((changes['data'] || changes['groupRowsBy']) && this.expandableRowGroups && this.groupRowsBy) {
            this.initExpandedGroups();
        }
    }

    initExpandedGroups() {
        if (!this.data || !this.groupRowsBy) return;
        const groups = new Set(this.data.map((row: any) => row[this.groupRowsBy]));
        this.expandedRowKeys = {};
        groups.forEach(g => this.expandedRowKeys[g] = true);
    }

    toggleGroup(groupValue: string) {
        if (this.expandedRowKeys[groupValue]) {
            delete this.expandedRowKeys[groupValue];
        } else {
            this.expandedRowKeys[groupValue] = true;
        }
        // Trigger change detection by reassigning the object
        this.expandedRowKeys = { ...this.expandedRowKeys };
    }

    isGroupExpanded(groupValue: string): boolean {
        return !!this.expandedRowKeys[groupValue];
    }

    private buildFilterOptionsCache(): void {
        this.filterOptionsCache = {};
        for (const col of this.columns) {
            if (col.filterMode === 'dropdown' || col.filterMode === 'multiselect') {
                if (col.filterOptions && col.filterOptions.length > 0) {
                    this.filterOptionsCache[col.field] = col.filterOptions;
                } else {
                    const unique = [...new Set(this.data.map(row => row[col.field]).filter(v => v != null))];
                    this.filterOptionsCache[col.field] = unique.map(v => ({ label: String(v), value: v }));
                }
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

    onSelectionChange(value: any) {
        this.selection = value;
        this.selectionChange.emit(value);
    }

    onContextMenuSelect(event: any) {
        this.selectedContextRow = event.data;
        this.contextMenuSelectionChange.emit(this.selectedContextRow);

        // Ensure the right-clicked row becomes the focused selection for actions
        if (this.selectionMode === 'single') {
            this.selection = event.data;
            this.selectionChange.emit(this.selection);
        } else if (this.selectionMode === 'multiple') {
            // For multiple selection, if the clicked row isn't already selected, select it exclusively
            if (!this.selection || !this.selection.includes(event.data)) {
                this.selection = [event.data];
                this.selectionChange.emit(this.selection);
            }
        }
    }

    onHeaderContextMenu(event: any, field: string) {
        this.activeSortField = field;
        this.hcm.show(event);
        event.preventDefault();
        event.stopPropagation();
    }

    clearSort() {
        this.dt.sortOrder = 0;
        this.dt.sortField = undefined;
        this.dt.multiSortMeta = [];
        this.activeSortField = null;

        // Restore original order.
        this._data = [...this._originalData];

        // Notify the table service to update the sort icons in the UI headers
        if (this.dt.tableService) {
            this.dt.tableService.onSort(null);
        }
    }
}
