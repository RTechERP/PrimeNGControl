import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { CustomTable } from './components/custom-table/custom-table';
import { ColumnDef } from './components/custom-table/column-def.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ButtonModule, CardModule, CustomTable],
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
    { field: 'inventoryStatus', header: 'Status', width: '200px', filterMode: 'dropdown' },
    { field: 'quantity', header: 'Quantity', width: '150px', sortable: true, filterType: 'numeric' },
    { field: 'price', header: 'Price', width: '150px', sortable: true, filterType: 'numeric' },
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
    { field: 'title', header: 'Task Title', width: '30%', editable: true },
    { field: 'assignee', header: 'Assignee', width: '20%', editable: true },
    { field: 'priority', header: 'Priority', width: '15%', editable: true },
    { field: 'status', header: 'Status', width: '15%', editable: true },
    { field: 'dueDate', header: 'Due Date', width: '20%', editable: true },
  ];

  tasks = [
    { id: 1, title: 'Design Landing Page', assignee: 'Alice', priority: 'High', status: 'In Progress', dueDate: '2026-03-15' },
    { id: 2, title: 'Implement User Auth', assignee: 'Bob', priority: 'Critical', status: 'To Do', dueDate: '2026-03-10' },
    { id: 3, title: 'Write Unit Tests', assignee: 'Charlie', priority: 'Medium', status: 'To Do', dueDate: '2026-03-20' },
    { id: 4, title: 'Deploy to Staging', assignee: 'Diana', priority: 'High', status: 'Done', dueDate: '2026-03-08' },
    { id: 5, title: 'Fix CSS Bug', assignee: 'Eve', priority: 'Low', status: 'In Progress', dueDate: '2026-03-12' },
    { id: 6, title: 'Database Migration', assignee: 'Frank', priority: 'Critical', status: 'To Do', dueDate: '2026-03-09' },
    { id: 7, title: 'API Documentation', assignee: 'Grace', priority: 'Medium', status: 'Done', dueDate: '2026-03-18' },
    { id: 8, title: 'Performance Audit', assignee: 'Hank', priority: 'High', status: 'In Progress', dueDate: '2026-03-22' },
  ];

  onRowReorder(event: any) {
    // The table updates its internal order automatically
  }
}
