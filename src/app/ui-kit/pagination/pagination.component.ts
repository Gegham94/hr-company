import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from "@angular/core";

@Component({
  selector: "hr-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent implements OnChanges {
  private _currentPage: number = 1;
  public maxShowPageProps: number = 3;
  public minSizeDevice: boolean = false;

  @Input() set currentPage(value: number) {
    this._currentPage = value;
  }

  public get currentPage(): number {
    return this._currentPage;
  }

  @Input("total-page-count") public totalPageCountProps: number = 0;
  @Output() selectPagination: EventEmitter<number> = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges) {
    this.minSizeDevice = window.innerWidth <= 600;
  }

  @HostListener("window:resize")
  public onResize(): void {
    this.minSizeDevice = window.innerWidth <= 600;
  }

  public nextPage(): void {
    this.currentPage =
      this.currentPage >= this.totalPageCountProps
        ? this.totalPageCountProps
        : (this.currentPage += 1);
    this.changeMaxShowPage();
    this.selectPagination.emit(this.currentPage);
  }

  public prevPage(): void {
    this.currentPage = this.currentPage <= 1 ? 1 : (this.currentPage -= 1);
    this.changeMaxShowPage();
    this.selectPagination.emit(this.currentPage);
  }

 public get pages():number[] {
    let start;
    let end;
    const ret = [];
    if (this.currentPage < this.maxShowPageProps / 2) {
      start = 1;
      end = Math.min(
        start + this.maxShowPageProps - 1,
        this.totalPageCountProps
      );
    } else if (
      this.currentPage >
      this.totalPageCountProps - this.maxShowPageProps / 2
    ) {
      start = Math.max(1, this.totalPageCountProps - this.maxShowPageProps + 1);
      end = this.totalPageCountProps;
    } else {
      start = Math.max(
        1,
        this.currentPage - Math.floor(this.maxShowPageProps / 2)
      );
      end = this.currentPage + Math.floor(this.maxShowPageProps / 2);
    }
    for (let i = start; i <= end; i++) {
      ret.push(i);
    }
    return ret;
  }

  public selectedPage(selectedPageNumber: number): void {
    this.currentPage = selectedPageNumber;
    this.changeMaxShowPage();
    this.selectPagination.emit(selectedPageNumber);
  }

  public changeMaxShowPage(): void {
    if (this.totalPageCountProps > 4) {
      this.maxShowPageProps = (this.currentPage === 4 || this.currentPage === this.totalPageCountProps - 3)
        ? 4
        : 3;
    }
  }
}
