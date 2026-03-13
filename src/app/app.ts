import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MenuItem, TreeNode } from 'primeng/api';
import { CustomTable } from './components/custom-table/custom-table';
import { ColumnDef } from './components/custom-table/column-def.model';
import { CustomTreeTable } from './components/custom-tree-table/custom-tree-table';
import { TreeColumnDef } from './components/custom-tree-table/tree-column-def.model';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ButtonModule, CardModule, CustomTable, CustomTreeTable, SplitterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'TestAllPrimeNG';

  // ==========================================
  // Table 1: Products — Frozen, Sort, Context Menu, Expansion, Export, Striped
  // ==========================================
  productColumns: ColumnDef[] = [
    { field: 'code', header: 'Code', width: '150px', sortable: true, frozen: true },
    { field: 'name', header: 'Name', width: '250px', sortable: true, textWrap: true },
    {
      field: 'category', header: 'Category', width: '200px', sortable: true, filterMode: 'dropdown',
      // filterLoadOptions: lazy-load filter options (simulated 600ms API delay)
      filterLoadOptions: () => new Promise<{ label: string; value: any }[]>(resolve =>
        setTimeout(() => resolve([
          { label: 'Accessories', value: 'Accessories' },
          { label: 'Clothing', value: 'Clothing' },
          { label: 'Fitness', value: 'Fitness' },
          { label: 'Nutrition', value: 'Nutrition' },
        ]), 600)
      )
    },
    { field: 'inventoryStatus', header: 'Status', width: '200px', filterMode: 'dropdown', cssClass: 'text-center' },
    {
      field: 'quantity', header: 'Quantity', width: '150px', sortable: true, filterType: 'numeric',
      footerType: 'sum'
    },
    {
      field: 'price', header: 'Price', width: '150px', sortable: true, filterType: 'numeric',
      cssClass: 'font-semibold',
      format: (val: number) => val != null ? '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '',
      footerType: 'avg', footerFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    },
  ];

  products = [
    { id: '1000', code: 'f230fh0g3', name: 'Bamboo Watch (Premium Edition with Extra Long Name for Testing)', category: 'Accessories', quantity: 24, price: 65, inventoryStatus: 'INSTOCK' },
    { id: '1001', code: 'nvklal433', name: 'Black Watch', category: 'Accessories', quantity: 61, price: 72, inventoryStatus: 'OUTOFSTOCK' },
    { id: '1002', code: 'zz21cz3c1', name: 'Blue Band', category: 'Fitness', quantity: 2, price: 79, inventoryStatus: 'LOWSTOCK' },
    { id: '1003', code: '244wzx786', name: 'Gold Watch', category: 'Accessories', quantity: 73, price: 42, inventoryStatus: 'INSTOCK' },
    { id: '1004', code: 'h456wer53', name: 'Yoga Mat', category: 'Fitness', quantity: 15, price: 20, inventoryStatus: 'INSTOCK' },
    { id: '1005', code: 'av2231fwg', name: 'Running Shoes', category: 'Clothing', quantity: 0, price: 120, inventoryStatus: 'OUTOFSTOCK' },
    { id: '1006', code: 'bib36pfvm', name: 'Cycling Cap', category: 'Clothing', quantity: 8, price: 35, inventoryStatus: 'LOWSTOCK' },
    { id: '1007', code: 'mbvjkgip5', name: 'Protein Bar', category: 'Nutrition', quantity: 100, price: 5, inventoryStatus: 'INSTOCK' },
  ];

  activeProducts: any[] = [];
  isProductsLoading: boolean = true;
  selectedProduct: any = null;

  productContextMenu: MenuItem[] = [
    { label: 'View Details', icon: 'pi pi-eye', command: () => alert('View: ' + this.selectedProduct?.name) },
    { label: 'Edit', icon: 'pi pi-pencil', command: () => alert('Edit: ' + this.selectedProduct?.name) },
    { separator: true },
    { label: 'Delete', icon: 'pi pi-trash', command: () => alert('Delete: ' + this.selectedProduct?.name) },
  ];

  ngOnInit() {
    setTimeout(() => {
      this.activeProducts = [...this.products];
      this.isProductsLoading = false;
    }, 2000);
  }

  // ==========================================
  // Table 2: Users — Row Grouping, Multi-Select, Expandable Groups
  // ==========================================
  userColumns: ColumnDef[] = [
    { field: 'name', header: 'Full Name', width: '25%', sortable: true },
    { field: 'email', header: 'Email', width: '25%', sortable: true },
    { field: 'role', header: 'Role', width: '20%', sortable: true, filterMode: 'dropdown' },
    { field: 'department', header: 'Department', width: '15%', filterMode: 'dropdown' },
    { field: 'status', header: 'Status', width: '45%', filterMode: 'dropdown' },
  ];

  users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', department: 'IT', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', department: 'Sales', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', department: 'Marketing', status: 'Inactive' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', department: 'IT', status: 'Active' },
    { id: 5, name: 'Eve Wilson', email: 'eve@example.com', role: 'User', department: 'HR', status: 'Active' },
    { id: 6, name: 'Frank Lee', email: 'frank@example.com', role: 'Editor', department: 'Marketing', status: 'Inactive' },
    { id: 7, name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', department: 'Engineering', status: 'Active' },
    { id: 8, name: 'Hank Pym', email: 'hank@example.com', role: 'User', department: 'R&D', status: 'Inactive' },
    { id: 9, name: 'Ivy Pepper', email: 'ivy@example.com', role: 'User', department: 'Sales', status: 'Active' },
    { id: 10, name: 'Jack Reacher', email: 'jack@example.com', role: 'Editor', department: 'Operations', status: 'Active' },
    { id: 11, name: 'Kevin Flynn', email: 'kevin@example.com', role: 'Admin', department: 'IT', status: 'Inactive' },
    { id: 12, name: 'Laura Croft', email: 'laura@example.com', role: 'User', department: 'Exploration', status: 'Active' },
    { id: 13, name: 'Mike Ross', email: 'mike@example.com', role: 'User', department: 'Legal', status: 'Active' },
    { id: 14, name: 'Nancy Drew', email: 'nancy@example.com', role: 'Editor', department: 'Investigation', status: 'Active' },
    { id: 15, name: 'Oscar Isaac', email: 'oscar@example.com', role: 'User', department: 'Acting', status: 'Active' },
  ].sort((a, b) => a.department.localeCompare(b.department));

  selectedUsers: any[] = [];

  onButtonClick() {
    alert('Selected users: ' + this.selectedUsers.map((u: any) => u.name).join(', '));
  }

  // ==========================================
  // Table 2b: filterDisplay="menu" — text + numeric + dropdown + multiselect
  // ==========================================
  menuFilterColumns: ColumnDef[] = [
    { field: 'code', header: 'Code', width: '150px', sortable: true },
    { field: 'name', header: 'Name', width: '250px', sortable: true },
    { field: 'category', header: 'Category', width: '180px', sortable: true, filterMode: 'dropdown' },
    { field: 'inventoryStatus', header: 'Status', width: '180px', filterMode: 'multiselect', cssClass: 'text-center' },
    {
      field: 'quantity', header: 'Quantity', width: '130px', sortable: true,
      filterType: 'numeric'
    },
    {
      field: 'price', header: 'Price', width: '130px', sortable: true,
      filterType: 'numeric', cssClass: 'font-semibold',
      format: (val: number) => val != null ? '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''
    },
  ];

  // ==========================================
  // Table 2c: Users — filterDisplay="menu" + multiselect (per column)
  // ==========================================
  menuFilterUserColumns: ColumnDef[] = [
    { field: 'name', header: 'Full Name', width: '25%', sortable: true },
    { field: 'email', header: 'Email', width: '25%', sortable: true },
    { field: 'role', header: 'Role', width: '20%', sortable: true, filterMode: 'multiselect' },
    { field: 'department', header: 'Department', width: '15%', filterMode: 'multiselect' },
    { field: 'status', header: 'Status', width: '15%', filterMode: 'multiselect' },
  ];

  // ==========================================
  // Table 2d: Click Row Select demo
  // ==========================================
  clickSelectColumns: ColumnDef[] = [
    { field: 'name', header: 'Full Name', width: '25%' },
    { field: 'email', header: 'Email', width: '30%' },
    { field: 'role', header: 'Role', width: '20%' },
    { field: 'department', header: 'Department', width: '15%' },
    { field: 'status', header: 'Status', width: '10%' },
  ];
  selectedClickRow: any = null;
  selectedClickRowsMulti: any[] = [];

  // ==========================================
  // Table 3: Tasks — Cell Editing, Row Reorder, Column Reorder, Export
  // ==========================================
  taskColumns: ColumnDef[] = [
    {
      field: 'title', header: 'Task Title', width: '25%', editable: true,
      footer: (data) => `Tổng: ${data.length} tasks`,
    },
    {
      field: 'assignee', header: 'Assignee', width: '12%', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { name: 'Alice', role: 'Frontend Developer', department: 'Engineering', email: 'alice@company.com' },
          { name: 'Bob', role: 'Backend Developer', department: 'Engineering', email: 'bob@company.com' },
          { name: 'Charlie', role: 'QA Engineer', department: 'Quality', email: 'charlie@company.com' },
          { name: 'Diana', role: 'DevOps Engineer', department: 'Infrastructure', email: 'diana@company.com' },
          { name: 'Eve', role: 'UI/UX Designer', department: 'Design', email: 'eve@company.com' },
          { name: 'Frank', role: 'DBA', department: 'Engineering', email: 'frank@company.com' },
          { name: 'Grace', role: 'Tech Writer', department: 'Documentation', email: 'grace@company.com' },
          { name: 'Hank', role: 'Team Lead', department: 'Engineering', email: 'hank@company.com' },
        ],
        columns: [
          { field: 'name', header: 'Name', width: '120px' },
          { field: 'role', header: 'Role', width: '160px' },
          { field: 'department', header: 'Department', width: '120px' },
        ],
        valueField: 'name',
        displayField: 'name',
        multiSelect: false,   // single: click dòng → chọn & đóng
      }
    },
    {
      field: 'reviewers', header: 'Reviewers', width: '15%', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { name: 'Alice', role: 'Frontend Developer', department: 'Engineering', email: 'alice@company.com' },
          { name: 'Bob', role: 'Backend Developer', department: 'Engineering', email: 'bob@company.com' },
          { name: 'Charlie', role: 'QA Engineer', department: 'Quality', email: 'charlie@company.com' },
          { name: 'Diana', role: 'DevOps Engineer', department: 'Infrastructure', email: 'diana@company.com' },
          { name: 'Eve', role: 'UI/UX Designer', department: 'Design', email: 'eve@company.com' },
          { name: 'Frank', role: 'DBA', department: 'Engineering', email: 'frank@company.com' },
          { name: 'Grace', role: 'Tech Writer', department: 'Documentation', email: 'grace@company.com' },
          { name: 'Hank', role: 'Team Lead', department: 'Engineering', email: 'hank@company.com' },
        ],
        columns: [
          { field: 'name', header: 'Name', width: '120px' },
          { field: 'role', header: 'Role', width: '160px' },
          { field: 'department', header: 'Department', width: '120px' },
        ],
        valueField: 'name',
        displayField: 'name',
        multiSelect: true,    // multi: checkbox + Xác nhận
      }
    },
    {
      field: 'priority', header: 'Priority', width: '15%', editable: true,
      editType: 'lookup',
      editOptions: [
        { label: 'Critical', value: 'Critical' },
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
      ],
      cssClass: 'text-center',
      footer: (data) => {
        const counts: Record<string, number> = {};
        data.forEach(r => counts[r.priority] = (counts[r.priority] || 0) + 1);
        return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' | ');
      },
      footerClass: 'text-center',
    },
    {
      field: 'status', header: 'Status', width: '15%', editable: true,
      editType: 'lookup',
      editOptions: [
        { label: 'To Do', value: 'To Do' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Done', value: 'Done' },
        { label: 'Blocked', value: 'Blocked' },
      ],
      cssClass: 'text-center',
      footer: (data) => `Done: ${data.filter(r => r.status === 'Done').length} / ${data.length}`,
      footerClass: 'text-center',
    },
    { field: 'dueDate', header: 'Due Date', width: '15%', editable: true, editType: 'date' },
    {
      field: 'project', header: 'Project', width: '15%', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        // loadData: lazy-load from API (simulated 400ms delay, server-side search)
        loadData: (query: string) => new Promise<any[]>(resolve =>
          setTimeout(() => {
            const all = [
              { code: 'PRJ-001', name: 'Website Redesign', client: 'Acme Corp' },
              { code: 'PRJ-002', name: 'Mobile App v2', client: 'TechStart' },
              { code: 'PRJ-003', name: 'API Gateway', client: 'Internal' },
              { code: 'PRJ-004', name: 'Data Pipeline', client: 'BigData Inc' },
            ];
            const q = query.toLowerCase();
            resolve(q ? all.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(q))) : all);
          }, 400)
        ),
        columns: [
          { field: 'code', header: 'Mã DA', width: '100px' },
          { field: 'name', header: 'Tên dự án', width: '180px' },
          { field: 'client', header: 'Khách hàng', width: '120px' },
        ],
        valueField: 'code',
        displayField: 'name'
      }
    },
    { field: 'description', header: 'Notes', width: '20%', editable: true, editType: 'textarea' },
  ];

  tasks = [
    { id: 1, title: 'Design Landing Page', assignee: 'Alice', reviewers: ['Bob', 'Eve'], priority: 'High', status: 'In Progress', dueDate: '2026-03-15', project: 'PRJ-001', description: 'Need to focus on mobile responsiveness and modern animations.' },
    { id: 2, title: 'Implement User Auth', assignee: 'Bob', reviewers: ['Charlie', 'Diana'], priority: 'Critical', status: 'To Do', dueDate: '2026-03-10', project: 'PRJ-002', description: 'Using JWT and refresh tokens.' },
    { id: 3, title: 'Write Unit Tests', assignee: 'Charlie', reviewers: [], priority: 'Medium', status: 'To Do', dueDate: '2026-03-20', project: 'PRJ-003', description: 'Coverage target: 80%.' },
    { id: 4, title: 'Deploy to Staging', assignee: 'Diana', reviewers: ['Hank'], priority: 'High', status: 'Done', dueDate: '2026-03-08', project: 'PRJ-001', description: 'Check environment variables.' },
    { id: 5, title: 'Fix CSS Bug', assignee: 'Eve', reviewers: ['Alice', 'Bob', 'Frank'], priority: 'Low', status: 'In Progress', dueDate: '2026-03-12', project: 'PRJ-002', description: 'Fixing Safari specific alignment issues.' },
    { id: 6, title: 'Database Migration', assignee: 'Frank', reviewers: ['Charlie'], priority: 'Critical', status: 'To Do', dueDate: '2026-03-09', project: 'PRJ-004', description: 'Upgrading to PostgreSQL 15.' },
    { id: 7, title: 'API Documentation', assignee: 'Grace', reviewers: [], priority: 'Medium', status: 'Done', dueDate: '2026-03-18', project: 'PRJ-003', description: 'Updating Swagger definitions.' },
    { id: 8, title: 'Performance Audit', assignee: 'Hank', reviewers: ['Alice', 'Diana'], priority: 'High', status: 'In Progress', dueDate: '2026-03-22', project: 'PRJ-004', description: 'Identifying slow queries.' },
  ];

  onRowReorder(event: any) {
    // The table updates its internal order automatically
  }

  // ==========================================
  // Table 3b: Lookup Demo — Single & Multi-Select
  // ==========================================
  lookupDemoColumns: ColumnDef[] = [
    { field: 'orderNo', header: 'Order No', width: '120px' },
    {
      field: 'product', header: 'Product (Single Select)', width: '220px', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { code: 'f230fh0g3', name: 'Bamboo Watch', category: 'Accessories', price: 65 },
          { code: 'nvklal433', name: 'Black Watch', category: 'Accessories', price: 72 },
          { code: 'zz21cz3c1', name: 'Blue Band', category: 'Fitness', price: 79 },
          { code: '244wzx786', name: 'Gold Watch', category: 'Accessories', price: 42 },
          { code: 'h456wer53', name: 'Yoga Mat', category: 'Fitness', price: 20 },
          { code: 'av2231fwg', name: 'Running Shoes', category: 'Clothing', price: 120 },
          { code: 'bib36pfvm', name: 'Cycling Cap', category: 'Clothing', price: 35 },
          { code: 'mbvjkgip5', name: 'Protein Bar', category: 'Nutrition', price: 5 },
        ],
        columns: [
          { field: 'code', header: 'Code', width: '110px' },
          { field: 'name', header: 'Name', width: '160px' },
          { field: 'category', header: 'Category', width: '120px' },
          { field: 'price', header: 'Price ($)', width: '80px' },
        ],
        valueField: 'code',
        displayField: 'name',
        multiSelect: false,   // click bất kỳ cell → chọn & đóng popup
      }
    },
    {
      field: 'tags', header: 'Tags (Multi Select)', width: '220px', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { tag: 'urgent', description: 'Cần xử lý ngay' },
          { tag: 'vip', description: 'Khách hàng VIP' },
          { tag: 'fragile', description: 'Hàng dễ vỡ' },
          { tag: 'bulk', description: 'Số lượng lớn' },
          { tag: 'express', description: 'Giao hàng nhanh' },
          { tag: 'return', description: 'Hoàn trả hàng' },
        ],
        columns: [
          { field: 'tag', header: 'Tag', width: '100px' },
          { field: 'description', header: 'Mô tả', width: '180px' },
        ],
        valueField: 'tag',
        displayField: 'tag',
        multiSelect: true,    // tick checkbox → bấm Xác nhận để lưu
      }
    },
    { field: 'qty', header: 'Qty', width: '80px', filterType: 'numeric' },
    { field: 'status', header: 'Status', width: '120px', filterMode: 'dropdown' },
  ];

  lookupDemoData = [
    { id: 1, orderNo: 'ORD-001', product: 'f230fh0g3', qty: 3, status: 'Pending', tags: [] },
    { id: 2, orderNo: 'ORD-002', product: 'nvklal433', qty: 1, status: 'Confirmed', tags: ['vip'] },
    { id: 3, orderNo: 'ORD-003', product: 'zz21cz3c1', qty: 5, status: 'Shipped', tags: ['urgent', 'express'] },
    { id: 4, orderNo: 'ORD-004', product: 'h456wer53', qty: 2, status: 'Pending', tags: ['fragile'] },
    { id: 5, orderNo: 'ORD-005', product: 'av2231fwg', qty: 1, status: 'Confirmed', tags: [] },
  ];

  // Handle table-lookup selections from any column
  onLookupSelect(event: { selectedRow: any; field: string; rowData: any }) {
    switch (event.field) {
      case 'assignee':
        // Ví dụ: khi chọn assignee, tự động fill email
        console.log(`Assigned to: ${event.selectedRow.name} (${event.selectedRow.email})`);
        break;
      case 'project':
        // Ví dụ: khi chọn project, log client info
        console.log(`Project: ${event.selectedRow.name}, Client: ${event.selectedRow.client}`);
        break;
      case 'owner':
        console.log(`Owner selected for TreeTable: ${event.selectedRow.name}, Role: ${event.selectedRow.role}`);
        break;
      default:
        console.log('Lookup selected:', event);
    }
  }

  // ==========================================
  // TreeTable 1: File System — Sort, Filter, Selection, Export
  // ==========================================
  fileColumns: TreeColumnDef[] = [
    { field: 'name', header: 'Name', width: '30%', sortable: true, editable: true },
    { field: 'size', header: 'Size', width: '15%', sortable: true },
    { field: 'type', header: 'Type', width: '15%', sortable: true, filterMode: 'dropdown' },
    { field: 'modified', header: 'Modified', width: '20%', sortable: true, editable: true, editType: 'date', editDateFormat: 'dd/mm/yy' },
    {
      field: 'owner', header: 'Owner', width: '20%', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { name: 'System', role: 'Administrator' },
          { name: 'Alice', role: 'Staff' },
          { name: 'Bob', role: 'Manager' },
        ],
        columns: [
          { field: 'name', header: 'User', width: '100px' },
          { field: 'role', header: 'Role', width: '100px' },
        ],
        valueField: 'name',
        displayField: 'name'
      }
    },
    { field: 'notes', header: 'Notes', width: '20%', editable: true, editType: 'textarea' }
  ];

  fileSystem: TreeNode[] = [
    {
      data: { name: 'Documents', size: '—', type: 'Folder', modified: new Date(2026, 2, 1), owner: 'System', notes: 'Core system folder.' },
      expanded: true,
      children: [
        {
          data: { name: 'Work', size: '—', type: 'Folder', modified: new Date(2026, 2, 1), owner: 'Alice', notes: 'Work project documents.' },
          expanded: true,
          children: [
            { data: { name: 'Report.docx', size: '120 KB', type: 'Document', modified: new Date(2026, 1, 28), owner: 'Alice', notes: 'Monthly report draft.' }, leaf: true },
            { data: { name: 'Proposal.pdf', size: '450 KB', type: 'PDF', modified: new Date(2026, 1, 25), owner: 'Alice', notes: 'Client proposal v1.' }, leaf: true },
            { data: { name: 'Budget.xlsx', size: '85 KB', type: 'Spreadsheet', modified: new Date(2026, 2, 1), owner: 'Alice', notes: 'Q1 budget planning.' }, leaf: true },
          ]
        },
        {
          data: { name: 'Personal', size: '—', type: 'Folder', modified: new Date(2026, 1, 15), owner: 'Bob', notes: 'Personal storage.' },
          children: [
            { data: { name: 'Resume.pdf', size: '80 KB', type: 'PDF', modified: new Date(2026, 0, 10), owner: 'Bob', notes: 'Updated resume Jan 2026.' }, leaf: true },
            { data: { name: 'CoverLetter.docx', size: '35 KB', type: 'Document', modified: new Date(2026, 0, 12), owner: 'Bob', notes: 'Standard cover letter.' }, leaf: true },
          ]
        }
      ]
    },
    {
      data: { name: 'Pictures', size: '—', type: 'Folder', modified: new Date(2026, 1, 20), owner: 'System' },
      children: [
        { data: { name: 'Vacation.jpg', size: '3.2 MB', type: 'Image', modified: new Date(2026, 1, 18), owner: 'Alice' }, leaf: true },
        { data: { name: 'Family.png', size: '2.1 MB', type: 'Image', modified: new Date(2026, 1, 20), owner: 'Alice' }, leaf: true },
        { data: { name: 'Screenshot.png', size: '450 KB', type: 'Image', modified: new Date(2026, 2, 5), owner: 'Alice' }, leaf: true },
      ]
    },
    {
      data: { name: 'Downloads', size: '—', type: 'Folder', modified: new Date(2026, 2, 8), owner: 'System' },
      children: [
        { data: { name: 'Setup.exe', size: '15 MB', type: 'Application', modified: new Date(2026, 2, 8), owner: 'Bob' }, leaf: true },
        { data: { name: 'Driver.zip', size: '8.5 MB', type: 'Archive', modified: new Date(2026, 2, 6), owner: 'System' }, leaf: true },
      ]
    }
  ];

  selectedFile: TreeNode | null = null;

  // ==========================================
  // TreeTable 2: Organization — Checkbox, Edit, Context Menu
  // ==========================================
  orgColumns: TreeColumnDef[] = [
    { field: 'name', header: 'Name', width: '30%', sortable: true, editable: true },
    { field: 'role', header: 'Role', width: '25%', editable: true, filterMode: 'dropdown' },
    { field: 'email', header: 'Email', width: '25%', editable: true },
    { field: 'status', header: 'Status', width: '20%', filterMode: 'dropdown' },
  ];

  orgData: TreeNode[] = [
    {
      data: { name: 'Engineering', role: 'Department', email: '—', status: 'Active' },
      expanded: true,
      children: [
        {
          data: { name: 'Frontend Team', role: 'Team', email: '—', status: 'Active' },
          expanded: true,
          children: [
            { data: { name: 'Alice Johnson', role: 'Senior Dev', email: 'alice@company.com', status: 'Active' }, leaf: true },
            { data: { name: 'Bob Smith', role: 'Junior Dev', email: 'bob@company.com', status: 'Active' }, leaf: true },
            { data: { name: 'Carol White', role: 'Intern', email: 'carol@company.com', status: 'On Leave' }, leaf: true },
          ]
        },
        {
          data: { name: 'Backend Team', role: 'Team', email: '—', status: 'Active' },
          children: [
            { data: { name: 'Charlie Brown', role: 'Lead', email: 'charlie@company.com', status: 'Active' }, leaf: true },
            { data: { name: 'Diana Prince', role: 'Senior Dev', email: 'diana@company.com', status: 'Active' }, leaf: true },
          ]
        }
      ]
    },
    {
      data: { name: 'Marketing', role: 'Department', email: '—', status: 'Active' },
      children: [
        {
          data: { name: 'Content Team', role: 'Team', email: '—', status: 'Active' },
          children: [
            { data: { name: 'Eve Wilson', role: 'Writer', email: 'eve@company.com', status: 'Active' }, leaf: true },
            { data: { name: 'Frank Lee', role: 'Designer', email: 'frank@company.com', status: 'Inactive' }, leaf: true },
          ]
        }
      ]
    },
    {
      data: { name: 'HR', role: 'Department', email: '—', status: 'Active' },
      children: [
        { data: { name: 'Grace Hopper', role: 'HR Manager', email: 'grace@company.com', status: 'Active' }, leaf: true },
      ]
    }
  ];

  selectedOrgNodes: TreeNode[] = [];

  orgContextMenu: MenuItem[] = [
    { label: 'View Profile', icon: 'pi pi-eye', command: () => console.log('View:', this.selectedOrgNodes) },
    { label: 'Edit', icon: 'pi pi-pencil', command: () => console.log('Edit:', this.selectedOrgNodes) },
    { separator: true },
    { label: 'Remove', icon: 'pi pi-trash', command: () => console.log('Remove:', this.selectedOrgNodes) },
  ];

  // ==========================================
  // Frozen Columns + Gridlines Demo
  // ==========================================
  frozenDemoColumns: ColumnDef[] = [
    { field: 'id', header: 'ID', width: '70px', frozen: true, alignFrozen: 'left', sortable: true },
    { field: 'name', header: 'Họ tên', width: '180px', sortable: true },
    { field: 'department', header: 'Phòng ban', width: '150px', sortable: true, filterMode: 'dropdown' },
    { field: 'role', header: 'Vai trò', width: '160px', filterMode: 'dropdown' },
    { field: 'email', header: 'Email', width: '210px' },
    { field: 'phone', header: 'Điện thoại', width: '140px' },
    { field: 'location', header: 'Địa điểm', width: '120px', filterMode: 'dropdown' },
    { field: 'project', header: 'Dự án', width: '180px' },
    {
      field: 'salary', header: 'Lương (USD)', width: '140px', filterType: 'numeric',
      frozen: true, alignFrozen: 'right',
      format: (val: number) => val != null ? '$' + val.toLocaleString('en-US') : '',
      footerType: 'avg', footerFormat: { maximumFractionDigits: 0 }
    },
  ];

  frozenDemoData = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', role: 'Frontend Dev', email: 'alice@company.com', phone: '090-1234-567', location: 'Hà Nội', project: 'Website Redesign', salary: 2800 },
    { id: 2, name: 'Bob Smith', department: 'Engineering', role: 'Backend Dev', email: 'bob@company.com', phone: '090-2345-678', location: 'HCM', project: 'API Gateway', salary: 3200 },
    { id: 3, name: 'Charlie Brown', department: 'Quality', role: 'QA Engineer', email: 'charlie@company.com', phone: '090-3456-789', location: 'Đà Nẵng', project: 'Website Redesign', salary: 2400 },
    { id: 4, name: 'Diana Prince', department: 'Infrastructure', role: 'DevOps Engineer', email: 'diana@company.com', phone: '090-4567-890', location: 'Hà Nội', project: 'Data Pipeline', salary: 3500 },
    { id: 5, name: 'Eve Wilson', department: 'Design', role: 'UI/UX Designer', email: 'eve@company.com', phone: '090-5678-901', location: 'HCM', project: 'Website Redesign', salary: 2600 },
    { id: 6, name: 'Frank Lee', department: 'Engineering', role: 'Full Stack Dev', email: 'frank@company.com', phone: '090-6789-012', location: 'Đà Nẵng', project: 'Mobile App v2', salary: 3100 },
    { id: 7, name: 'Grace Hopper', department: 'Management', role: 'Tech Lead', email: 'grace@company.com', phone: '090-7890-123', location: 'Hà Nội', project: 'API Gateway', salary: 4200 },
    { id: 8, name: 'Hank Pym', department: 'Engineering', role: 'Data Engineer', email: 'hank@company.com', phone: '090-8901-234', location: 'HCM', project: 'Data Pipeline', salary: 3000 },
  ];
}
