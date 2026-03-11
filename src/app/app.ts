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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ButtonModule, CardModule, CustomTable, CustomTreeTable],
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
    { field: 'category', header: 'Category', width: '200px', sortable: true, filterMode: 'dropdown' },
    { field: 'inventoryStatus', header: 'Status', width: '200px', filterMode: 'dropdown', cssClass: 'text-center' },
    { field: 'quantity', header: 'Quantity', width: '150px', sortable: true, filterType: 'numeric', cssClass: 'text-right' },
    {
      field: 'price', header: 'Price', width: '150px', sortable: true, filterType: 'numeric',
      cssClass: 'text-right font-semibold',
      format: (val: number) => val != null ? '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''
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
    { field: 'status', header: 'Status', width: '15%', filterMode: 'dropdown' },
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
  // Table 3: Tasks — Cell Editing, Row Reorder, Column Reorder, Export
  // ==========================================
  taskColumns: ColumnDef[] = [
    { field: 'title', header: 'Task Title', width: '25%', editable: true },
    {
      field: 'assignee', header: 'Assignee', width: '15%', editable: true,
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
        displayField: 'name'
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
      cssClass: 'text-center'
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
      cssClass: 'text-center'
    },
    { field: 'dueDate', header: 'Due Date', width: '15%', editable: true, editType: 'date' },
    {
      field: 'project', header: 'Project', width: '15%', editable: true,
      editType: 'table-lookup',
      editLookupConfig: {
        data: [
          { code: 'PRJ-001', name: 'Website Redesign', client: 'Acme Corp' },
          { code: 'PRJ-002', name: 'Mobile App v2', client: 'TechStart' },
          { code: 'PRJ-003', name: 'API Gateway', client: 'Internal' },
          { code: 'PRJ-004', name: 'Data Pipeline', client: 'BigData Inc' },
        ],
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
    { id: 1, title: 'Design Landing Page', assignee: 'Alice', priority: 'High', status: 'In Progress', dueDate: '2026-03-15', project: 'PRJ-001', description: 'Need to focus on mobile responsiveness and modern animations.' },
    { id: 2, title: 'Implement User Auth', assignee: 'Bob', priority: 'Critical', status: 'To Do', dueDate: '2026-03-10', project: 'PRJ-002', description: 'Using JWT and refresh tokens.' },
    { id: 3, title: 'Write Unit Tests', assignee: 'Charlie', priority: 'Medium', status: 'To Do', dueDate: '2026-03-20', project: 'PRJ-003', description: 'Coverage target: 80%.' },
    { id: 4, title: 'Deploy to Staging', assignee: 'Diana', priority: 'High', status: 'Done', dueDate: '2026-03-08', project: 'PRJ-001', description: 'Check environment variables.' },
    { id: 5, title: 'Fix CSS Bug', assignee: 'Eve', priority: 'Low', status: 'In Progress', dueDate: '2026-03-12', project: 'PRJ-002', description: 'Fixing Safari specific alignment issues.' },
    { id: 6, title: 'Database Migration', assignee: 'Frank', priority: 'Critical', status: 'To Do', dueDate: '2026-03-09', project: 'PRJ-004', description: 'Upgrading to PostgreSQL 15.' },
    { id: 7, title: 'API Documentation', assignee: 'Grace', priority: 'Medium', status: 'Done', dueDate: '2026-03-18', project: 'PRJ-003', description: 'Updating Swagger definitions.' },
    { id: 8, title: 'Performance Audit', assignee: 'Hank', priority: 'High', status: 'In Progress', dueDate: '2026-03-22', project: 'PRJ-004', description: 'Identifying slow queries.' },
  ];

  onRowReorder(event: any) {
    // The table updates its internal order automatically
  }

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
}
