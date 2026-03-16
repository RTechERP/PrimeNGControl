# 📊 Custom Table Component — Hướng dẫn sử dụng

Component `app-custom-table` là một wrapper bọc ngoài PrimeNG `p-table`, cung cấp **32 tính năng** có thể cấu hình qua `@Input()`.

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
  filterLoadOptions?: () => Promise<{label,value}[]>; // Lazy-load options 1 lần khi khởi tạo
  filterVirtualScroll?: boolean;        // Virtual scroll cho multiselect filter
  filterVirtualScrollItemSize?: number; // Chiều cao item (px) khi dùng virtual scroll
  sortable?: boolean;        // Cho phép sắp xếp cột
  frozen?: boolean;          // Đóng băng cột (cố định khi cuộn ngang)
  alignFrozen?: string;      // Hướng đóng băng: 'left' | 'right'
  textWrap?: boolean;        // Wrap text hay truncate (mỗi cột riêng)
  editable?: boolean;        // Cho phép sửa inline
  cssClass?: string;         // Class CSS cho cả header và cell
  format?: (v, row) => str;  // Hàm format hiển thị tùy chỉnh
  editType?: string;         // 'text'|'number'|'date'|'lookup'|'table-lookup'|'textarea'
  editOptions?: {label,value}[]; // Options cho editType='lookup' (p-select dropdown)
  editDateFormat?: string;   // Định dạng PrimeNG cho date picker (vd: 'dd/mm/yy')
  editShowTime?: boolean;    // Hiện bộ chọn giờ cho date picker
  editLookupConfig?: EditLookupConfig; // Cấu hình cho editType='table-lookup'
  footerType?: string;       // Tổng kết footer: 'sum'|'avg'|'count'|'min'|'max'
  footerFormat?: object;     // Intl.NumberFormatOptions cho footerType aggregates
  footer?: string | ((data) => string); // Nội dung footer tùy chỉnh
  footerClass?: string;      // Class CSS riêng cho footer cell
}

interface EditLookupConfig {
  data?: any[];              // Dữ liệu tĩnh (tùy chọn nếu dùng loadData)
  loadData?: (query: string) => any[] | Promise<any[]>; // Lazy-load khi mở popup
  columns: {field, header, width?}[]; // Các cột hiển thị trong popup
  valueField: string;        // Field lấy giá trị để lưu
  displayField?: string;     // Field hiển thị lại trong cell (mặc định = valueField)
  multiSelect?: boolean;     // true = checkbox + nút Xác nhận; false = click chọn ngay
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
| `showFooter` | `boolean` | `false` | Hiển thị hàng tổng kết (footer) |
| `clickSelectRow` | `boolean` | `false` | Click vào cell để highlight dòng (single active row) |
| `filterDisplay` | `string` | `'row'` | Kiểu hiển thị filter: `'row'` hoặc `'menu'` |
| `rowGroupShowFooter` | `boolean` | `false` | Hiện footer trong mỗi nhóm (khi dùng row grouping) |
| `headerGroups` | `any[][]` | `[]` | Nhóm tiêu đề nhiều cấp (Banded Columns) |

---

## 📤 @Output()

| Output | Kiểu event | Mô tả |
|--------|-----------|-------|
| `rowClick` | `any` | Phát ra khi click vào dòng (khi `clickSelectRow=true`) |
| `lookupSelect` | `{selectedRow, field, rowData}` | Phát ra khi chọn xong từ table-lookup |
| `rowReorder` | PrimeNG event | Phát ra khi kéo thả đổi thứ tự dòng |

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

Cố định cột khi cuộn ngang. **Yêu cầu:** `[scrollable]="true"` và `[showGridlines]="true"` phải bật.

```typescript
// Cột cố định bên trái
{ field: 'id', header: 'ID', width: '70px', frozen: true, alignFrozen: 'left' }

// Cột cố định bên phải
{ field: 'salary', header: 'Lương', width: '120px', frozen: true, alignFrozen: 'right' }

// Cột cuộn bình thường (đặt đủ nhiều để cần cuộn ngang)
{ field: 'name', header: 'Họ tên', width: '180px' }
{ field: 'department', header: 'Phòng ban', width: '150px' }
// ... các cột khác ...
```

```html
<app-custom-table
  [scrollable]="true"
  scrollHeight="350px"
  [showGridlines]="true"
  dataKey="id"
  ...>
</app-custom-table>
```

> **Lưu ý:** Không cần set `alignFrozen` nếu đã là `'left'` (mặc định). Nên dùng `width` dạng `px` cho frozen columns để tránh layout shift.

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

Kéo thả **header cột** để đổi vị trí. Vị trí cột chỉ ảnh hưởng UI, không thay đổi mảng `columns`.

> **Lưu ý:**
> - Cột `frozen` không thể kéo ra khỏi vị trí fixed của nó
> - Kết hợp `stateKey` để lưu thứ tự cột sau khi reload trang

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

### 16. ✏️ Sửa trực tiếp (Inline Editing Types)

Component hỗ trợ nhiều loại editor qua thuộc tính `editType`:

#### Bùn/Text/Number (Mặc định):
```typescript
{ field: 'name', header: 'Tên', editable: true, editType: 'text' }
{ field: 'age', header: 'Tuổi', editable: true, editType: 'number' }
```

#### 📅 Date Picker:
Cho phép gõ trực tiếp hoặc chọn từ lịch.
```typescript
{ 
  field: 'dueDate', header: 'Ngày hết hạn', 
  editable: true, 
  editType: 'date',
  editDateFormat: 'dd/mm/yy', // Định dạng hiển thị
  editShowTime: true          // Hiện bộ chọn giờ (nếu cần)
}
```

#### 📝 Textarea:
Dùng cho văn bản dài, tự động co giãn chiều cao.
```typescript
{ field: 'notes', header: 'Ghi chú', editable: true, editType: 'textarea' }
```

#### 🔍 Table-Lookup:
Mở một popup bảng để chọn dữ liệu phức tạp.
```typescript
{
  field: 'projectId', header: 'Dự án', 
  editable: true, 
  editType: 'table-lookup',
  editLookupConfig: {
    data: projectsData,       // Mảng dữ liệu nguồn
    columns: [                // Các cột hiển thị trong popup
      { field: 'code', header: 'Mã' },
      { field: 'name', header: 'Tên DA' }
    ],
    valueField: 'id',         // Field lấy giá trị để lưu
    displayField: 'name'      // Field hiển thị lại sau khi chọn
  }
}
```

---

### 17. 🖱️ Menu chuột phải Header (Header Context Menu)

Chuột phải vào **bất kỳ header nào** để mở menu quản lý bảng (DevExpress style):
- **Sắp xếp**: Tăng dần, Giảm dần hoặc Bỏ sắp xếp.
- **Ẩn/Hiện cột**: Ẩn cột hiện tại hoặc bật tắt danh sách tất cả các cột.
- **Tự động co cột**: Đặt lại width thành 'auto' cho cột này hoặc tất cả cột.
- **Bật/Tắt Filter**: Hiện/Ẩn hàng lọc dữ liệu hoặc ô tìm kiếm toàn bảng.

---

### 18. 📥 Xuất CSV (Export)

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

### 24. ⏳ Lazy loading dữ liệu bảng chính

Component nhận dữ liệu qua `[data]`. Để lazy load từ API, dùng `[loading]` kết hợp với async binding:

```html
<app-custom-table
  [data]="tableData"
  [loading]="isLoading"
  [columns]="columns"
  dataKey="id">
</app-custom-table>
```

```typescript
tableData: any[] = [];
isLoading = true;

ngOnInit() {
  this.apiService.getProducts().subscribe(data => {
    this.tableData = data;
    this.isLoading = false;
  });
}
```

> **Khi `[loading]="true"`**, bảng hiển thị skeleton spinner thay cho dữ liệu.

---

### 25. 🔄 Lazy loading popup Table-Lookup (`loadData`)

Thay vì truyền `data` tĩnh, dùng `loadData` để gọi API mỗi khi mở popup và khi người dùng tìm kiếm.

```typescript
{
  field: 'projectId',
  header: 'Dự án',
  editable: true,
  editType: 'table-lookup',
  editLookupConfig: {
    // loadData được gọi: (1) khi mở popup với query='', (2) khi gõ tìm kiếm
    loadData: (query: string) => new Promise<any[]>(resolve =>
      setTimeout(() => {
        const all = [
          { code: 'PRJ-001', name: 'Website Redesign', client: 'Acme Corp' },
          { code: 'PRJ-002', name: 'Mobile App v2', client: 'TechStart' },
        ];
        const q = query.toLowerCase();
        resolve(q ? all.filter(p =>
          Object.values(p).some(v => String(v).toLowerCase().includes(q))
        ) : all);
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
}
```

> **Cơ chế:**
> - Khi mở popup → gọi `loadData('')` → hiện spinner → load xong hiện bảng
> - Khi gõ tìm kiếm → debounce 300ms → gọi `loadData(query)` → cập nhật kết quả
> - Có thể dùng cả `data` (fallback) và `loadData` cùng lúc

---

### 26. 📋 Lazy loading options Select Filter (`filterLoadOptions`)

Lazy-load danh sách option cho filter `dropdown`/`multiselect` — gọi 1 lần khi khởi tạo.

```typescript
{
  field: 'category',
  header: 'Danh mục',
  filterMode: 'dropdown',
  // Không cần filterOptions thủ công — gọi API 1 lần khi init
  filterLoadOptions: () => this.apiService.getCategories().then(cats =>
    cats.map(c => ({ label: c.name, value: c.id }))
  )
}
```

Hoặc với `Promise`:
```typescript
filterLoadOptions: () => new Promise(resolve =>
  setTimeout(() => resolve([
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Fitness', value: 'Fitness' },
  ]), 500)
)
```

> **Lưu ý:** `filterLoadOptions` không nhận query — dùng `filterVirtualScroll: true` cho danh sách lớn.

---

### 27. 📊 Footer tổng kết (Footer)

#### Bật footer:
```html
<app-custom-table [showFooter]="true" ...>
```

#### Footer tự động (built-in aggregates):
```typescript
// Tổng
{ field: 'quantity', header: 'SL', filterType: 'numeric', footerType: 'sum' }

// Trung bình (có format số)
{
  field: 'price', header: 'Giá',
  filterType: 'numeric',
  footerType: 'avg',
  footerFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
}

// Đếm số dòng
{ field: 'name', header: 'Tên', footerType: 'count' }

// Min / Max
{ field: 'score', header: 'Điểm', footerType: 'min' }
{ field: 'score', header: 'Điểm', footerType: 'max' }
```

> `footerType` dùng `Intl.NumberFormat` — `footerFormat` nhận `Intl.NumberFormatOptions`.

#### Footer tùy chỉnh (custom function):
```typescript
// Static text
{ field: 'name', header: 'Tên', footer: 'Tổng cộng' }

// Dynamic — nhận toàn bộ data
{
  field: 'status', header: 'Trạng thái',
  footer: (data) => `Done: ${data.filter(r => r.status === 'Done').length} / ${data.length}`,
  footerClass: 'text-center font-semibold'
}
```

> **Ưu tiên:** `footer` (custom) > `footerType` (built-in). Nếu cả hai được set, `footer` thắng.

---

### 28. 🖱️ Click Row Select kết hợp Multi-Select Checkbox

Kết hợp `[clickSelectRow]` với `selectionMode="multiple"` để có **2 hành vi độc lập**:
- **Click vào cell** → highlight dòng đó (single active row, bỏ highlight dòng cũ)
- **Tick checkbox** → multi-select checkbox (độc lập với click)

```html
<app-custom-table
  [data]="users"
  [columns]="columns"
  dataKey="id"
  [clickSelectRow]="true"
  (rowClick)="activeRow = $event"
  selectionMode="multiple"
  [(selection)]="checkedRows">
</app-custom-table>
```

```typescript
activeRow: any = null;       // Dòng đang được highlight (click)
checkedRows: any[] = [];     // Các dòng đang được tick checkbox
```

> **Use case:** Highlight dòng đang làm việc (sửa, xem chi tiết) trong khi vẫn cho phép chọn nhiều dòng để xóa hàng loạt.
---

### 29. 🧱 Cột nhóm (Banded Columns)

Cho phép gộp nhóm các tiêu đề cột thành nhiều cấp.

```html
<app-custom-table
  [columns]="columns"
  [headerGroups]="headerGroups">
</app-custom-table>
```

```typescript
headerGroups: any[][] = [
  [
    { header: 'Nhóm A', colspan: 2, cssClass: 'bg-blue-100' },
    { header: 'Nhóm B', colspan: 2, cssClass: 'bg-green-100' }
  ]
];
```

> **Lưu ý:** Các cột điều khiển (checkbox, expand) sẽ tự động được giãn dòng (`rowspan`) để khớp với số cấp của headerGroups.

---

### 30. 🎯 Cell Focus & Highlighting

Click vào bất kỳ ô nào để highlight ô đó.

- **Tự động focus**: Khi click vào cell, bảng sẽ nhận focus từ trình duyệt để sẵn sàng nhận lệnh bàn phím.
- **Styling**: Ô được chọn sẽ có viền dày màu xanh (Primary color) đặc trưng.

---

### 31. 📋 Cell Copy (Ctrl + C)

Khi một ô đang được focus, nhấn **Ctrl + C** (hoặc **Cmd + C**) để copy nội dung của ô đó vào clipboard.
- **Format**: Dữ liệu copy sẽ giữ nguyên định dạng hiển thị (respect `format` function).
- **Multi-table**: Hỗ trợ nhiều bảng trên cùng một trang, chỉ bảng đang active mới thực hiện lệnh copy.

---

### 32. 🛠️ Cột nâng cao (Column Chooser)

Chuột phải vào header → chọn **"Cột nâng cao"** để mở dialog quản lý cột.
- **Kéo thả**: Thay đổi thứ tự cột trực quan.
- **Ẩn/Hiện**: Bật tắt nhanh các cột qua checkbox.

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

---
---

# 🌳 Custom TreeTable Component — Hướng dẫn sử dụng

Component `app-custom-tree-table` là wrapper bọc ngoài PrimeNG `p-treeTable`, dùng cho **dữ liệu phân cấp (hierarchical/tree)** với **21 tính năng** configurable.

---

## 📦 Import

```typescript
import { CustomTreeTable } from './components/custom-tree-table/custom-tree-table';
import { TreeColumnDef } from './components/custom-tree-table/tree-column-def.model';
import { TreeNode } from 'primeng/api';
```

```typescript
@Component({
  imports: [CustomTreeTable],
})
```

---

## 📝 TreeColumnDef Interface

```typescript
interface TreeColumnDef {
  field: string;             // Property name trong node.data
  header: string;            // Tiêu đề hiển thị
  width?: string;            // '200px' hoặc '25%'
  sortable?: boolean;        // Cho phép sort
  frozen?: boolean;          // Đóng băng cột
  alignFrozen?: string;      // 'left' | 'right'
  filterType?: string;       // 'text' | 'numeric' | 'date'
  filterMode?: string;       // 'input' | 'dropdown' | 'multiselect'
  filterOptions?: array;     // [{label, value}]
  editable?: boolean;        // Cho phép sửa inline
  cssClass?: string;         // Class CSS
  format?: (v, row) => str;  // Hàm format
  editType?: string;         // 'text'|'number'|'date'|'lookup'|'table-lookup'|'textarea'
  editDateFormat?: string;
  editShowTime?: boolean;
}
```

---

## 📊 Cấu trúc dữ liệu TreeNode

PrimeNG TreeTable sử dụng `TreeNode<T>`:

```typescript
import { TreeNode } from 'primeng/api';

const data: TreeNode[] = [
  {
    data: { name: 'Documents', size: '—', type: 'Folder' },
    expanded: true,      // Mở rộng mặc định
    children: [
      {
        data: { name: 'Report.docx', size: '120KB', type: 'File' },
        leaf: true       // Node lá (không có con)
      }
    ]
  }
];
```

> **Lưu ý:** Dữ liệu nằm trong `node.data`, không phải trực tiếp trên node.

---

## 🔧 Tổng hợp @Input()

| Input | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `data` | `TreeNode[]` | `[]` | Dữ liệu cây phân cấp |
| `columns` | `TreeColumnDef[]` | `[]` | Định nghĩa cột |
| `dataKey` | `string` | `''` | Key duy nhất cho selection |
| `loading` | `boolean` | `false` | Loading spinner |
| `title` | `string` | `''` | Tiêu đề bảng |
| `showGlobalFilter` | `boolean` | `false` | Hiện ô tìm kiếm |
| `globalFilterFields` | `string[]` | `[]` | Các field tìm kiếm |
| `resizable` | `boolean` | `true` | Kéo resize cột |
| `resizeMode` | `string` | `'fit'` | `'fit'` hoặc `'expand'` |
| `showGridlines` | `boolean` | `true` | Đường kẻ ô |
| `showColumnFilter` | `boolean` | `true` | Hàng filter |
| `textWrap` | `boolean` | `false` | Wrap text toàn bảng |
| `scrollable` | `boolean` | `false` | Bật cuộn |
| `scrollHeight` | `string` | `'400px'` | Chiều cao cuộn |
| `virtualScroll` | `boolean` | `false` | Cuộn ảo |
| `virtualScrollItemSize` | `number` | `46` | Chiều cao dòng (px) |
| `paginator` | `boolean` | `false` | Phân trang |
| `rows` | `number` | `10` | Số dòng/trang |
| `rowsPerPageOptions` | `number[]` | `[10,20,50]` | Lựa chọn số dòng |
| `sortMode` | `string` | `'single'` | `'single'` hoặc `'multiple'` |
| `selectionMode` | `string\|null` | `null` | `'single'`, `'multiple'`, `'checkbox'` |
| `selection` | `any` | `null` | Node đang chọn (two-way) |
| `contextMenuItems` | `MenuItem[]` | `[]` | Menu chuột phải trên node |
| `reorderableColumns` | `boolean` | `false` | Kéo thả đổi chỗ cột |
| `editMode` | `string\|undefined` | `undefined` | `'cell'` |
| `exportable` | `boolean` | `false` | Nút export CSV |
| `exportFilename` | `string` | `'download'` | Tên file CSV |
| `headerGroups` | `any[][]` | `[]` | Nhóm tiêu đề nhiều cấp (Banded Columns) |

---

## 📖 Hướng dẫn từng tính năng

---

### 1. 🌳 Bảng cây cơ bản

```html
<app-custom-tree-table
  [data]="fileSystem"
  [columns]="fileColumns"
  dataKey="name">
</app-custom-tree-table>
```

```typescript
fileColumns: TreeColumnDef[] = [
  { field: 'name', header: 'Tên', sortable: true },
  { field: 'size', header: 'Kích thước' },
  { field: 'type', header: 'Loại' },
];

fileSystem: TreeNode[] = [
  {
    data: { name: 'Documents', size: '—', type: 'Folder' },
    expanded: true,
    children: [
      { data: { name: 'Report.docx', size: '120KB', type: 'File' }, leaf: true },
    ]
  }
];
```

> Node có `expanded: true` sẽ mở sẵn. Node có `leaf: true` không hiển thị nút toggle.

---

### 2. ↕️ Sắp xếp (Sorting)

```typescript
{ field: 'name', header: 'Tên', sortable: true }
```

```html
<app-custom-tree-table sortMode="single" ...>
<app-custom-tree-table sortMode="multiple" ...>
```

**Xóa sort:** Click chuột phải vào header cột → "Clear Sort".

---

### 3. ✅ Chọn node — Single

```html
<app-custom-tree-table
  selectionMode="single"
  dataKey="name"
  [(selection)]="selectedFile">
</app-custom-tree-table>
```

---

### 4. ☑️ Chọn node — Checkbox (có cascade)

Chọn node cha sẽ tự động chọn tất cả node con.

```html
<app-custom-tree-table
  selectionMode="checkbox"
  dataKey="name"
  [(selection)]="selectedNodes">
</app-custom-tree-table>
```

```typescript
selectedNodes: TreeNode[] = [];
```

> **Lưu ý:** Khi dùng `selectionMode="checkbox"`, cột đầu tiên sẽ không cho phép cell edit để tránh xung đột UI.

---

### 5. 🔍 Tìm kiếm toàn bảng (Global Search)

```html
<app-custom-tree-table
  [showGlobalFilter]="true"
  [globalFilterFields]="['name', 'type']"
  title="File Explorer">
</app-custom-tree-table>
```

> TreeTable filter mode mặc định là `lenient` — hiện cả node cha nếu node con khớp.

---

### 6. 🔽 Bộ lọc cột (Column Filters)

```typescript
// Text filter (mặc định)
{ field: 'name', header: 'Tên' }

// Dropdown filter
{ field: 'type', header: 'Loại', filterMode: 'dropdown' }

// Multiselect filter
{ field: 'status', header: 'Trạng thái', filterMode: 'multiselect' }
```

Filter options tự tạo từ toàn bộ tree data (đệ quy flatten).

---

### 7. 📃 Phân trang (Pagination)

```html
<app-custom-tree-table [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 20]">
```

---

### 8. 📜 Cuộn & Cuộn ảo (Scrollable / Virtual Scroll)

```html
<app-custom-tree-table [scrollable]="true" scrollHeight="400px">

<!-- Virtual scroll cho tree lớn -->
<app-custom-tree-table [scrollable]="true" scrollHeight="400px"
  [virtualScroll]="true" [virtualScrollItemSize]="46">
```

---

### 9. ✏️ Sửa ô (Cell Editing)

```html
<app-custom-tree-table editMode="cell" dataKey="name">
</app-custom-tree-table>
```

```typescript
columns: TreeColumnDef[] = [
  { field: 'name', header: 'Tên', editable: true },
  { field: 'role', header: 'Vai trò', editable: true },
  { field: 'status', header: 'Trạng thái' },  // Không sửa được
];
```

---

### 10. 🖱️ Menu chuột phải (Context Menu)

```html
<app-custom-tree-table
  [contextMenuItems]="menuItems"
  selectionMode="single"
  dataKey="name">
</app-custom-tree-table>
```

```typescript
menuItems: MenuItem[] = [
  { label: 'View', icon: 'pi pi-eye', command: () => ... },
  { label: 'Delete', icon: 'pi pi-trash', command: () => ... },
];
```

---

### 11. 📥 Xuất CSV (Export)

```html
<app-custom-tree-table [exportable]="true" exportFilename="file_system">
```

> TreeTable export tự viết — flatten toàn bộ tree → CSV. Hỗ trợ UTF-8 BOM cho Excel.

---

### 12. 🔀 Kéo thả đổi chỗ cột (Column Reorder)

```html
<app-custom-tree-table [reorderableColumns]="true">
```

---

### 13–17. Các tính năng khác

| Tính năng | Cách dùng |
|-----------|-----------|
| Resizable columns | `[resizable]="true"` (mặc định) |
| Gridlines | `[showGridlines]="true"` (mặc định) |
| Loading | `[loading]="isLoading"` |
| Text wrap | `[textWrap]="true"` hoặc per-column `textWrap: true` |
| Clear Sort | Click phải vào header cột sortable |

---

### 18. 🧱 Cột nhóm (Banded Columns)

Tương tự `CustomTable`, hỗ trợ tiêu đề nhiều cấp cho TreeTable.

---

### 19. 🎯 Cell Focus & Highlighting

Click vào ô để highlight với viền xanh.

---

### 20. 📋 Cell Copy (Ctrl + C)

Hỗ trợ copy nội dung ô đang focus bằng phím tắt.

---

## 🎯 Ví dụ tổng hợp

```html
<app-custom-tree-table
  [data]="fileSystem"
  [columns]="fileColumns"
  dataKey="name"
  title="File Explorer"

  [showGlobalFilter]="true"
  [globalFilterFields]="['name', 'type']"
  [showColumnFilter]="true"
  [resizable]="true"
  [showGridlines]="true"

  [scrollable]="true"
  scrollHeight="400px"

  sortMode="single"
  selectionMode="single"
  [(selection)]="selectedFile"
  [contextMenuItems]="menuItems"

  [exportable]="true"
  exportFilename="file_export"
  [reorderableColumns]="true">
</app-custom-tree-table>
```

---

## 📂 Cấu trúc file

```
src/app/components/
├── custom-table/                # Bảng phẳng (flat data)
│   ├── column-def.model.ts
│   ├── custom-table.ts
│   ├── custom-table.html
│   └── custom-table.css
└── custom-tree-table/           # Bảng cây (hierarchical data)
    ├── tree-column-def.model.ts
    ├── custom-tree-table.ts
    ├── custom-tree-table.html
    └── custom-tree-table.css
```
