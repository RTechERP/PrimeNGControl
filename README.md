# 📊 Custom Table Component — Hướng dẫn sử dụng

Component `app-custom-table` là một wrapper bọc ngoài PrimeNG `p-table`, cung cấp **24 tính năng** có thể cấu hình qua `@Input()`.

---

## 📦 Import

```typescript
import { CustomTable } from './components/custom-table/custom-table';
import { ColumnDef } from './components/custom-table/column-def.model';
```

Thêm `CustomTable` vào `imports` của component:

```typescript
@Component({
  imports: [CustomTable],
  // ...
})
```

---

## 📝 ColumnDef Interface

Mỗi cột được định nghĩa bởi interface `ColumnDef`:

```typescript
interface ColumnDef {
  field: string;             // Tên property trong data object
  header: string;            // Tiêu đề hiển thị
  width?: string;            // Độ rộng: '200px' hoặc '25%'
  filterType?: string;       // Loại filter: 'text' | 'numeric' | 'date'
  filterMode?: string;       // Giao diện filter: 'input' | 'dropdown' | 'multiselect'
  filterOptions?: array;     // Tùy chọn filter thủ công: [{ label, value }]
  sortable?: boolean;        // Cho phép sắp xếp cột
  frozen?: boolean;          // Đóng băng cột (cố định khi cuộn ngang)
  alignFrozen?: string;      // Hướng đóng băng: 'left' | 'right'
  textWrap?: boolean;        // Wrap text hay truncate (mỗi cột riêng)
  editable?: boolean;        // Cho phép sửa inline
}
```

---

## 🔧 Tổng hợp tất cả @Input()

| Input | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `data` | `any[]` | `[]` | Dữ liệu hiển thị |
| `columns` | `ColumnDef[]` | `[]` | Định nghĩa các cột |
| `dataKey` | `string` | `''` | Key duy nhất cho mỗi dòng (bắt buộc cho selection) |
| `loading` | `boolean` | `false` | Hiển thị loading spinner |
| `title` | `string` | `''` | Tiêu đề bảng |
| `showGlobalFilter` | `boolean` | `false` | Hiện ô tìm kiếm toàn bảng |
| `globalFilterFields` | `string[]` | `[]` | Các field được tìm kiếm global |
| `resizable` | `boolean` | `true` | Cho phép kéo resize cột |
| `resizeMode` | `string` | `'fit'` | Chế độ resize: `'fit'` hoặc `'expand'` |
| `showGridlines` | `boolean` | `true` | Hiện đường kẻ ô |
| `showColumnFilter` | `boolean` | `true` | Hiện hàng filter dưới header |
| `textWrap` | `boolean` | `false` | Wrap text toàn bảng (false = truncate ...) |
| `stripedRows` | `boolean` | `false` | Dòng xen kẽ màu nền |
| `scrollable` | `boolean` | `false` | Bật cuộn ngang/dọc |
| `scrollHeight` | `string` | `'400px'` | Chiều cao vùng cuộn |
| `virtualScroll` | `boolean` | `false` | Cuộn ảo cho dữ liệu lớn |
| `virtualScrollItemSize` | `number` | `46` | Chiều cao mỗi dòng (px) cho virtual scroll |
| `paginator` | `boolean` | `false` | Bật phân trang |
| `rows` | `number` | `10` | Số dòng mỗi trang |
| `rowsPerPageOptions` | `number[]` | `[10,20,50]` | Các lựa chọn số dòng/trang |
| `sortMode` | `string` | `'single'` | Chế độ sort: `'single'` hoặc `'multiple'` |
| `selectionMode` | `string\|null` | `null` | Chế độ chọn: `'single'`, `'multiple'`, `null` |
| `selection` | `any` | `null` | Dòng đang chọn (two-way binding) |
| `contextMenuItems` | `MenuItem[]` | `[]` | Menu chuột phải trên dòng |
| `reorderableColumns` | `boolean` | `false` | Kéo thả đổi chỗ cột |
| `reorderableRows` | `boolean` | `false` | Kéo thả đổi chỗ dòng |
| `expandable` | `boolean` | `false` | Cho phép mở rộng dòng xem chi tiết |
| `rowExpandMode` | `string` | `'multiple'` | Mở rộng `'single'` hoặc `'multiple'` dòng |
| `editMode` | `string\|undefined` | `undefined` | Chế độ sửa: `'cell'` hoặc `'row'` |
| `exportable` | `boolean` | `false` | Hiện nút Export CSV |
| `exportFilename` | `string` | `'download'` | Tên file khi export |
| `rowGroupMode` | `string\|undefined` | `undefined` | Nhóm dòng: `'subheader'` hoặc `'rowspan'` |
| `groupRowsBy` | `string` | `''` | Field để nhóm dòng |
| `expandableRowGroups` | `boolean` | `false` | Cho phép thu gọn/mở rộng nhóm |
| `stateKey` | `string\|undefined` | `undefined` | Key lưu trạng thái bảng |
| `stateStorage` | `string` | `'local'` | Nơi lưu: `'local'` hoặc `'session'` |

---

## 📖 Hướng dẫn từng tính năng

---

### 1. 📋 Bảng cơ bản

Hiển thị bảng với dữ liệu và cột tối thiểu.

```html
<app-custom-table
  [data]="products"
  [columns]="productColumns"
  dataKey="id">
</app-custom-table>
```

```typescript
productColumns: ColumnDef[] = [
  { field: 'code', header: 'Mã SP' },
  { field: 'name', header: 'Tên SP' },
  { field: 'price', header: 'Giá', filterType: 'numeric' },
];

products = [
  { id: 1, code: 'SP001', name: 'Sản phẩm A', price: 100 },
  { id: 2, code: 'SP002', name: 'Sản phẩm B', price: 200 },
];
```

---

### 2. 🔍 Tìm kiếm toàn bảng (Global Search)

```html
<app-custom-table
  [data]="products"
  [columns]="productColumns"
  [showGlobalFilter]="true"
  [globalFilterFields]="['name', 'code', 'category']"
  title="Danh sách sản phẩm">
</app-custom-table>
```

> **Lưu ý:** `globalFilterFields` phải là mảng các field name trong data.

---

### 3. 🔽 Bộ lọc cột (Column Filters)

#### Filter dạng text (mặc định):
```typescript
{ field: 'name', header: 'Tên', filterType: 'text' }
```

#### Filter dạng dropdown:
```typescript
{ field: 'status', header: 'Trạng thái', filterMode: 'dropdown' }
// Tự động tạo danh sách từ data, hoặc chỉ định thủ công:
{
  field: 'status', header: 'Trạng thái',
  filterMode: 'dropdown',
  filterOptions: [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ]
}
```

#### Filter dạng multiselect:
```typescript
{ field: 'category', header: 'Danh mục', filterMode: 'multiselect' }
```

Ẩn hàng filter:
```html
<app-custom-table [showColumnFilter]="false" ...>
```

---

### 4. ↕️ Sắp xếp (Sorting)

```typescript
// Bật sortable từng cột:
{ field: 'name', header: 'Tên', sortable: true }
```

```html
<!-- Sort 1 cột -->
<app-custom-table sortMode="single" ...>

<!-- Sort nhiều cột cùng lúc (giữ Ctrl + click) -->
<app-custom-table sortMode="multiple" ...>
```

**Xóa sort:** Click chuột phải vào header cột → chọn "Clear Sort".

---

### 5. ❄️ Đóng băng cột (Frozen Columns)

Cố định cột khi cuộn ngang. **Yêu cầu:** `scrollable` phải bật.

```typescript
{ field: 'code', header: 'Mã', frozen: true, alignFrozen: 'left' }
{ field: 'actions', header: 'Thao tác', frozen: true, alignFrozen: 'right' }
```

```html
<app-custom-table [scrollable]="true" scrollHeight="400px" ...>
```

---

### 6. ✅ Chọn dòng (Row Selection)

#### Chọn 1 dòng:
```html
<app-custom-table
  selectionMode="single"
  dataKey="id"
  [(selection)]="selectedItem">
</app-custom-table>
```

#### Chọn nhiều dòng (có checkbox):
```html
<app-custom-table
  selectionMode="multiple"
  dataKey="id"
  [(selection)]="selectedItems">
</app-custom-table>
```

```typescript
selectedItem: any = null;
selectedItems: any[] = [];
```

> **Quan trọng:** `dataKey` phải được set khi dùng selection.

---

### 7. 📃 Phân trang (Pagination)

```html
<app-custom-table
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[5, 10, 20, 50]">
</app-custom-table>
```

---

### 8. 📜 Cuộn bảng (Scrollable)

```html
<!-- Cuộn với chiều cao cố định -->
<app-custom-table [scrollable]="true" scrollHeight="350px" ...>

<!-- Cuộn chiều cao linh hoạt -->
<app-custom-table [scrollable]="true" scrollHeight="flex" ...>
```

---

### 9. ⚡ Cuộn ảo (Virtual Scrolling)

Dùng cho bảng có hàng ngàn dòng — chỉ render các dòng hiển thị trên màn hình.

```html
<app-custom-table
  [scrollable]="true"
  scrollHeight="400px"
  [virtualScroll]="true"
  [virtualScrollItemSize]="46">
</app-custom-table>
```

> **Lưu ý:** `virtualScrollItemSize` là chiều cao (px) mỗi dòng. Set chính xác để scroll mượt.

---

### 10. ⏳ Trạng thái tải (Loading)

```html
<app-custom-table [loading]="isLoading" ...>
```

```typescript
isLoading = true;

ngOnInit() {
  this.apiService.getData().subscribe(data => {
    this.tableData = data;
    this.isLoading = false;
  });
}
```

---

### 11. 📝 Wrap text / Truncate

#### Toàn bảng:
```html
<!-- Truncate (dấu ...) - mặc định -->
<app-custom-table [textWrap]="false" ...>

<!-- Wrap xuống dòng -->
<app-custom-table [textWrap]="true" ...>
```

#### Từng cột riêng (ưu tiên cao hơn global):
```typescript
{ field: 'description', header: 'Mô tả', textWrap: true }
{ field: 'code', header: 'Mã', textWrap: false }
```

---

### 12. 🖱️ Menu chuột phải (Context Menu)

```html
<app-custom-table
  [contextMenuItems]="menuItems"
  [(selection)]="selectedItem"
  selectionMode="single"
  dataKey="id">
</app-custom-table>
```

```typescript
import { MenuItem } from 'primeng/api';

selectedItem: any = null;

menuItems: MenuItem[] = [
  {
    label: 'Xem chi tiết',
    icon: 'pi pi-eye',
    command: () => console.log('View:', this.selectedItem)
  },
  {
    label: 'Sửa',
    icon: 'pi pi-pencil',
    command: () => console.log('Edit:', this.selectedItem)
  },
  { separator: true },
  {
    label: 'Xóa',
    icon: 'pi pi-trash',
    command: () => console.log('Delete:', this.selectedItem)
  },
];
```

---

### 13. 🔀 Kéo thả đổi chỗ cột (Column Reorder)

```html
<app-custom-table [reorderableColumns]="true" ...>
```

Kéo thả header cột để đổi vị trí.

---

### 14. ↕️ Kéo thả đổi chỗ dòng (Row Reorder)

```html
<app-custom-table
  [reorderableRows]="true"
  (rowReorder)="onRowReorder($event)">
</app-custom-table>
```

Một icon ≡ sẽ xuất hiện ở cột đầu tiên — kéo icon này để đổi thứ tự dòng.

```typescript
onRowReorder(event: any) {
  // event.dragIndex: vị trí cũ
  // event.dropIndex: vị trí mới
  console.log('Moved from', event.dragIndex, 'to', event.dropIndex);
}
```

---

### 15. 🔎 Mở rộng dòng (Row Expansion)

Click nút ▶ để xem chi tiết bên dưới mỗi dòng.

```html
<app-custom-table
  [expandable]="true"
  rowExpandMode="multiple"
  dataKey="id">
</app-custom-table>
```

- `rowExpandMode="single"` — Chỉ mở rộng 1 dòng cùng lúc
- `rowExpandMode="multiple"` — Mở rộng nhiều dòng cùng lúc

> Chi tiết hiển thị mặc định là liệt kê tất cả field:value. Có thể tuỳ chỉnh template trong `custom-table.html` tại `pTemplate="rowexpansion"`.

---

### 16. ✏️ Sửa trực tiếp trong ô (Cell Editing)

```html
<app-custom-table
  editMode="cell"
  dataKey="id">
</app-custom-table>
```

```typescript
columns: ColumnDef[] = [
  { field: 'name', header: 'Tên', editable: true },
  { field: 'price', header: 'Giá', editable: true },
  { field: 'code', header: 'Mã', editable: false }, // Không cho sửa
];
```

**Cách sử dụng:**
1. Click vào ô có `editable: true` → chuyển sang chế độ sửa
2. Nhập giá trị mới
3. Nhấn **Enter** hoặc click ra ngoài → lưu
4. Nhấn **Escape** → huỷ thay đổi

---

### 17. 📥 Xuất CSV (Export)

```html
<app-custom-table
  [exportable]="true"
  exportFilename="bao_cao_san_pham">
</app-custom-table>
```

Nút **"Export CSV"** sẽ xuất hiện ở phần caption bar. Click để tải file CSV.

---

### 18. 🦓 Dòng xen kẽ màu (Striped Rows)

```html
<app-custom-table [stripedRows]="true" ...>
```

---

### 19. 👥 Nhóm dòng (Row Grouping)

Gộp các dòng cùng giá trị vào 1 nhóm với header riêng.

```html
<app-custom-table
  rowGroupMode="subheader"
  groupRowsBy="department"
  [rowGroupShowFooter]="false">
</app-custom-table>
```

> **⚠️ Quan trọng:** Dữ liệu **phải được sort** theo field nhóm trước khi truyền vào:

```typescript
users = [...].sort((a, b) => a.department.localeCompare(b.department));
```

---

### 20. 📂 Thu gọn/mở rộng nhóm (Expandable Row Groups)

```html
<app-custom-table
  rowGroupMode="subheader"
  groupRowsBy="department"
  [expandableRowGroups]="true">
</app-custom-table>
```

Click nút ▶/▼ bên cạnh tên nhóm để thu gọn/mở rộng. Mặc định tất cả nhóm được mở.

---

### 21. 💾 Lưu trạng thái bảng (State Persistence)

Tự động lưu và khôi phục trạng thái sort, filter, pagination khi reload trang.

```html
<!-- Lưu vào localStorage -->
<app-custom-table
  stateKey="my-products-table"
  stateStorage="local">
</app-custom-table>

<!-- Lưu vào sessionStorage (mất khi đóng tab) -->
<app-custom-table
  stateKey="my-products-table"
  stateStorage="session">
</app-custom-table>
```

> **Lưu ý:** Mỗi bảng cần `stateKey` duy nhất. Nếu không set `stateKey`, tính năng này sẽ tắt.

---

### 22. 📏 Kéo rộng cột (Resizable Columns)

```html
<!-- Bật resize (mặc định đã bật) -->
<app-custom-table [resizable]="true" resizeMode="fit" ...>
```

- `resizeMode="fit"` — Tổng chiều rộng bảng không đổi, cột bên cạnh co lại
- `resizeMode="expand"` — Bảng mở rộng khi kéo rộng cột

---

### 23. 📐 Kẻ ô (Gridlines)

```html
<app-custom-table [showGridlines]="true" ...>
```

---

## 🎯 Ví dụ tổng hợp

```html
<!-- Bảng đầy đủ tính năng -->
<app-custom-table
  [data]="products"
  [columns]="productColumns"
  dataKey="id"
  title="Danh sách sản phẩm"

  [loading]="isLoading"
  [showGlobalFilter]="true"
  [globalFilterFields]="['name', 'code']"
  [showColumnFilter]="true"
  [resizable]="true"
  [showGridlines]="true"
  [stripedRows]="true"

  [scrollable]="true"
  scrollHeight="400px"

  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[5, 10, 20]"

  sortMode="multiple"
  selectionMode="single"
  [(selection)]="selectedProduct"
  [contextMenuItems]="menuItems"

  [expandable]="true"
  rowExpandMode="multiple"
  editMode="cell"

  [exportable]="true"
  exportFilename="products"
  stateKey="products-table"

  [reorderableColumns]="true">
</app-custom-table>
```

---

## 📂 Cấu trúc file

```
src/app/components/custom-table/
├── column-def.model.ts     # Interface định nghĩa cột
├── custom-table.ts          # Component logic + @Input/@Output
├── custom-table.html        # Template PrimeNG p-table
└── custom-table.css         # CSS (truncate, wrap styles)
```
