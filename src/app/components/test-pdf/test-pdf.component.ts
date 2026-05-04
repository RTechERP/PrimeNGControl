import { Component } from '@angular/core';
import { PDFDocument } from 'pdf-lib';

@Component({
    selector: 'app-test-pdf',
    templateUrl: './test-pdf.component.html',
    styleUrls: ['./test-pdf.component.css']
})
export class TestPdfComponent {

    pdfBytesOriginal!: Uint8Array;
    imageBytes!: Uint8Array;

    stampX = 100;
    stampY = 100;
    stampWidth = 120;
    stampHeight = 120;

    async onPdfUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();
        this.pdfBytesOriginal = new Uint8Array(buffer);
    }

    async onImageUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;
        this.imageBytes = new Uint8Array(await file.arrayBuffer());
    }

    onInput(field: 'stampX' | 'stampY' | 'stampWidth' | 'stampHeight', event: any) {
        const val = parseInt(event.target.value, 10);
        if (!isNaN(val)) {
            this[field] = val;
        }
    }

    getImageType(bytes: Uint8Array): 'png' | 'jpg' | 'unknown' {
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
            return 'png';
        }
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return 'jpg';
        }
        return 'unknown';
    }

    async processPdf() {
        if (!this.pdfBytesOriginal || !this.imageBytes) {
            alert('Chưa chọn file PDF hoặc ảnh!');
            return;
        }

        try {
            // Load file PDF
            const pdfDoc = await PDFDocument.load(this.pdfBytesOriginal);
            
            // Embed ảnh dựa trên format (PNG hoặc JPG)
            const imageType = this.getImageType(this.imageBytes);
            let image;
            if (imageType === 'png') {
                image = await pdfDoc.embedPng(this.imageBytes);
            } else if (imageType === 'jpg') {
                image = await pdfDoc.embedJpg(this.imageBytes);
            } else {
                alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh PNG hoặc JPG.');
                return;
            }

            // Lấy tất cả các trang
            const pages = pdfDoc.getPages();
            
            // Lặp qua tất cả các trang và vẽ ảnh lên
            for (const page of pages) {
                const { height } = page.getSize();
                
                // Trong thư viện pdf-lib, gốc tọa độ (0,0) nằm ở góc dưới bên trái của trang.
                // Để mapping tọa độ Y từ trên xuống dưới (top-left) như UI cấu hình:
                const pdfX = this.stampX;
                const pdfY = height - (this.stampY + this.stampHeight);

                page.drawImage(image, {
                    x: pdfX,
                    y: pdfY,
                    width: this.stampWidth,
                    height: this.stampHeight
                });
            }

            // Lưu và view PDF ở tab mới
            const resultBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(resultBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url);
        } catch (error) {
            console.error('Lỗi khi xử lý PDF:', error);
            alert('Có lỗi xảy ra trong quá trình xử lý PDF.');
        }
    }
}