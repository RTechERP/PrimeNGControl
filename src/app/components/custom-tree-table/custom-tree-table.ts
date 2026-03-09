import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule, TreeTable } from 'primeng/treetable';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem, TreeNode } from 'primeng/api';
import { TreeColumnDef } from './tree-column-def.model';

@Component({
    selector: 'app-custom-tree-table',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TreeTableModule, InputTextModule,
        SelectModule, MultiSelectModule, ButtonModule, IconFieldModule, InputIconModule,
        ContextMenuModule
    ],
    templateUrl: './custom-tree-table.html',
    styleUrl: './custom-tree-table.css'
})
export class CustomTreeTable implements OnChanges {
    @ViewChild('tt') tt!: TreeTable;
    @ViewChild('cm') cm!: ContextMenu;
    @ViewChild('hcm') hcm!: ContextMenu;

    // --- Data ---
    private _originalData: TreeNode[] = [];
    private _data: TreeNode[] = [];

    @Input() set data(val: TreeNode[]) {
        this._originalData = this.deepCloneNodes(val || []);
        this._data = val || [];
        this.buildFilterOptionsCache();
    }
    get data(): TreeNode[] {
        return this._data;
    }
    @Input() columns: TreeColumnDef[] = [];
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

    // --- Scrollable ---
    @Input() scrollable: boolean = false;
    @Input() scrollHeight: string = '400px';

    // --- Virtual Scrolling ---
    @Input() virtualScroll: boolean = false;
    @Input() virtualScrollItemSize: number = 46;

    // --- Pagination ---
    @Input() paginator: boolean = false;
    @Input() rows: number = 10;
    @Input() rowsPerPageOptions: number[] = [10, 20, 50];

    // --- Sorting ---
    @Input() sortMode: 'single' | 'multiple' = 'single';

    // --- Selection ---
    @Input() selectionMode: 'single' | 'multiple' | 'checkbox' | null = null;
    @Input() selection: any = null;
    @Output() selectionChange = new EventEmitter<any>();

    // --- Context Menu ---
    @Input() contextMenuItems: MenuItem[] = [];
    selectedContextNode: any = null;

    // --- Column Reorder ---
    @Input() reorderableColumns: boolean = false;

    // --- Cell Editing ---
    @Input() editMode: 'cell' | undefined = undefined;

    // --- CSV Export ---
    @Input() exportable: boolean = false;
    @Input() exportFilename: string = 'download';

    // --- Header Context Menu ---
    headerMenuItems: MenuItem[] = [
        { label: 'Clear Sort', icon: 'pi pi-sort-alt-slash', command: () => this.clearSort() }
    ];
    activeSortField: string | null = null;

    // --- Filter Options Cache ---
    filterOptionsCache: { [field: string]: { label: string; value: any }[] } = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['columns'] || changes['data']) {
            this.buildFilterOptionsCache();
        }
    }

    private buildFilterOptionsCache(): void {
        this.filterOptionsCache = {};
        const flatData = this.flattenNodes(this.data);
        for (const col of this.columns) {
            if (col.filterMode === 'dropdown' || col.filterMode === 'multiselect') {
                if (col.filterOptions && col.filterOptions.length > 0) {
                    this.filterOptionsCache[col.field] = col.filterOptions;
                } else {
                    const unique = [...new Set(flatData.map(d => d[col.field]).filter(v => v != null))];
                    this.filterOptionsCache[col.field] = unique.map(v => ({ label: String(v), value: v }));
                }
            }
        }
    }

    private flattenNodes(nodes: TreeNode[]): any[] {
        let result: any[] = [];
        for (const node of nodes) {
            if (node.data) result.push(node.data);
            if (node.children) result = result.concat(this.flattenNodes(node.children));
        }
        return result;
    }

    getFilterOptions(col: TreeColumnDef): { label: string; value: any }[] {
        return this.filterOptionsCache[col.field] || [];
    }

    onGlobalFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.tt.filterGlobal(value, 'contains');
    }

    onSelectionChange(value: any) {
        this.selection = value;
        this.selectionChange.emit(value);
    }

    onContextMenuSelect(event: any) {
        this.selectedContextNode = event.node;
    }

    onHeaderContextMenu(event: any, field: string) {
        this.activeSortField = field;
        this.hcm.show(event);
        event.preventDefault();
        event.stopPropagation();
    }

    clearSort() {
        this.tt.sortOrder = 0;
        this.tt.sortField = undefined;
        this.tt.multiSortMeta = [];
        this.activeSortField = null;
        this._data = this.deepCloneNodes(this._originalData);
        this.tt.value = this._data;
        if (this.tt.tableService) {
            this.tt.tableService.onSort(null);
        }
    }

    private deepCloneNodes(nodes: TreeNode[]): TreeNode[] {
        return nodes.map(node => ({
            ...node,
            data: node.data ? { ...node.data } : undefined,
            children: node.children ? this.deepCloneNodes(node.children) : undefined
        }));
    }

    exportCSV() {
        const flatData = this.flattenNodes(this.data);
        if (!flatData.length || !this.columns.length) return;

        const headers = this.columns.map(c => c.header);
        const rows = flatData.map(row =>
            this.columns.map(c => {
                const val = row[c.field];
                const str = val != null ? String(val) : '';
                return '"' + str.replace(/"/g, '""') + '"';
            }).join(',')
        );

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (this.exportFilename || 'download') + '.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
