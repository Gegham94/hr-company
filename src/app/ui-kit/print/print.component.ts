import {Component, ElementRef, Input, OnInit} from "@angular/core";
import html2canvas from "html2canvas";

import {jsPDF} from "jspdf";

@Component({
  selector: "hr-print",
  templateUrl: "./print.component.html",
  styleUrls: ["./print.component.scss"]
})
export class PrintComponent implements OnInit {
  @Input() pdfTable!: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  public convertToPdf():void {
    html2canvas(this.pdfTable?.nativeElement).then(canvas => {
      const imgWidth = 208;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      const contentDataURL = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const position = 0;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      pdf.save("vacancy.pdf");
    });
  }

}
