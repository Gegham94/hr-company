import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList, SimpleChanges,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {BehaviorSubject, debounceTime, distinctUntilChanged, filter, fromEvent, map, Subscription} from "rxjs";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {
  SearchableSelectDataInterface,
  StringOrNumber
} from "../../modules/app/interfaces/searchable-select-data.interface";

@Component({
  selector: "hr-searchable-select",
  templateUrl: "./searchable-select.component.html",
  styleUrls: ["./searchable-select.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SearchableSelectComponent)
    }
  ]
})
export class SearchableSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @ViewChildren("ref", {read: ElementRef}) listItems!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;

  @Input("multi-select") public multiSelectProps?: boolean = false;
  @Input("multi-selected-list") public multiSelectedListProps: string[] = [];
  @Input("label-text") public labelTextProps?: string;
  @Input("default-value") public defaultValueProps?: string;
  @Input("placeholder-text") public placeholderTextProps?: string = "";
  @Input("disabled") public disabledProps: boolean | string = false;
  @Input("search") public isSearch: boolean = false;
  @Input("search-list") public searchListProps!: SearchableSelectDataInterface[] | null;
  @Input("field-name") public fieldName!: string;
  @Input("edit") edit = false;
  @Input("loader") isLoader = false;

  @Output() changes: EventEmitter<string> = new EventEmitter<string>();
  @Output() changeRequest: EventEmitter<string> = new EventEmitter<string>();
  // @ts-ignore
  @Output() changedItemId: EventEmitter<StringOrNumber> = new EventEmitter<StringOrNumber>();
  @Output() uncheckedField: EventEmitter<string> = new EventEmitter<string>();
  @Output() isClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scrollDown: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onInput: EventEmitter<string> = new EventEmitter<string>();
  @Output() clickOutside: EventEmitter<boolean> = new EventEmitter<boolean>();
  public value!: string;
  public isOpen = false;
  public filteredSearchList!: SearchableSelectDataInterface[] | null;
  public currentItemIndex: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public editable = false;
  public startSearch = false;

  public throttle = 150;
  public scrollDistance = 2;
  public direction = "";
  private keyupSub!: Subscription;
  @ViewChild("input") input!: ElementRef;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.keyupSub.unsubscribe();
  }

  onScrollDown() {
    this.scrollDown.emit(true);
    this.direction = "down";
    this.infiniteScroll.ngOnDestroy();
    this.infiniteScroll.setup();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchListProps"] &&
      changes["searchListProps"]?.currentValue?.length === changes["searchListProps"]?.previousValue?.length) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.multiSelectedListProps.length && !this.startSearch) {
      this.value = "";
    }
    this.filteredSearchList = this.searchListProps;
    this.cdr.detectChanges();
  }

  public ngOnInit(): void {
    this.value = this.defaultValueProps ? this.defaultValueProps : "";

    this.keyupSub = fromEvent<KeyboardEvent>(this.input.nativeElement, "keyup")
      .pipe(
        map((event: KeyboardEvent) => {
          return (<HTMLTextAreaElement>event?.target)?.value;
          }),
        filter(res => res.length >= 2),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((val: string) => {
        if (val.trim().length) {
          if (this.multiSelectedListProps.length &&
            val?.length === this.multiSelectedListProps.join(", ").length && val) {
            this.filteredSearchList = this.searchListProps;
            return;
          }

          if (!this.startSearch) {
            if (val.length < this.multiSelectedListProps.join(", ").length) {
              this.startSearch = true;
            } else {
              if (this.multiSelectedListProps.length) {
                val = val.slice(this.multiSelectedListProps.join(", ").length);
              }
              this.startSearch = true;
              this.value = val.trim();
            }
          }
          if (!this.startSearch) {
            this.onChange(val);
          }

          this.onTouch(val);
          this.changeRequest.emit(`${val}`);

          if (this.isSearch && this.searchListProps) {
            if (this.searchListProps && val) {
              this.filteredSearchList = this.searchListProps.filter((item: SearchableSelectDataInterface): boolean =>
                item.value.toLowerCase().includes(val?.toLowerCase().trim()));
            } else {
              this.filteredSearchList = this.searchListProps;
            }
            this.detectValueChanges(val);
          }
        }
      });
  }

  public setSelectState(state?: boolean, isClickOutside: boolean = false): void {
    this.clickOutside.emit(isClickOutside);
    this.value = this.multiSelectedListProps?.join(", ").trim() ?? "";
    if (this.multiSelectProps) {
      this.isOpen = state !== undefined ? state : true;
      if (!this.isOpen) {
        this.isClose.emit(true);
      }
      this.detectValueChanges(this.multiSelectedListProps);
    } else {
      this.isOpen = state !== undefined ? state : !this.isOpen;
      this.detectValueChanges(this.value);
    }

    this.startSearch = false;
    this.filteredSearchList = this.searchListProps;
  }

  public select(ev: Event | boolean, value: string, id: StringOrNumber = 0): void {
    this.multiSelectedListProps = this.multiSelectedListProps ?? [];
    const selectIndexId = this.multiSelectedListProps?.indexOf(value);
    this.changedItemId.emit(id);
    this.updateMultiSelectedListProps(ev, value, selectIndexId);
  }

  public enter(ev: Event) {
    if (!!this.filteredSearchList) {
      this.multiSelectedListProps = this.multiSelectedListProps ?? [];
      const selectedItemValue = this.filteredSearchList[this.currentItemIndex.value].displayName;
      const selectIndexId = this.multiSelectedListProps
        .indexOf(this.filteredSearchList[this.currentItemIndex.value].displayName);
      this.updateMultiSelectedListProps(ev, selectedItemValue, selectIndexId);
    }
  }

  public updateMultiSelectedListProps(ev: Event | boolean, value: string, selectIndexId: number): void {
    if (this.multiSelectProps) {
      if (selectIndexId >= 0) {
        if (this.fieldName === "vacancyLanguage") {
          this.uncheckedField.emit(this.multiSelectedListProps[selectIndexId]);
        }
        this.multiSelectedListProps.splice(selectIndexId, 1);
      } else {
        this.multiSelectedListProps = Object.assign([], this.multiSelectedListProps);
        this.multiSelectedListProps.push(value);
      }
      this.value = this.multiSelectedListProps?.join(", ").trim();
      this.detectValueChanges(this.multiSelectedListProps);
    } else {
      const customEvent = <CustomEvent<MouseEvent>>ev;
      customEvent.preventDefault();
      this.value = value.trim();
      this.multiSelectedListProps = [this.value];
      this.setSelectState(false);
      this.onChange();
      // this.detectValueChanges(this.value);
    }
  }

  public search(val: string) {
    if (val.trim().length < 2 && !!val.trim().length) {
      if (this.multiSelectedListProps.length && val?.length === this.multiSelectedListProps.join(", ").length && val) {
        this.filteredSearchList = this.searchListProps;
        return;
      }

      if (!this.startSearch) {
        if (val.length < this.multiSelectedListProps.join(", ").length) {
          this.startSearch = true;
        } else {
          if (this.multiSelectedListProps.length) {
            val = val.slice(this.multiSelectedListProps.join(", ").length);
          }
          this.startSearch = true;
          this.value = val;
        }
      }

      if(!this.startSearch) {
        this.onChange(val);
      }
      this.onTouch(val);
      this.changeRequest.emit(`${val}`);
      if (this.isSearch && this.searchListProps) {
        if (this.searchListProps && val) {
          this.filteredSearchList = this.searchListProps.filter((item: SearchableSelectDataInterface): boolean =>
            item.value.toLowerCase().includes(val?.toLowerCase().trim()));
        } else {
          this.filteredSearchList = this.searchListProps;
        }
        this.detectValueChanges(val);
      }
    }
  }

  public detectValueChanges(value: string | string[]): void {
    if (!this.startSearch) {
      this.onChange(value);
      this.onTouch(value);
      this.changes.emit(`${value}`);
    }
  }

  public moveDown(): void {
    if (this.filteredSearchList && this.currentItemIndex.value >= this.filteredSearchList.length - 1) {
      this.currentItemIndex.next(0);
    } else {
      this.currentItemIndex.next(this.currentItemIndex.value + 1);
    }
    this.listItems?.get(this.currentItemIndex.value)?.nativeElement
      .scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  }

  public moveUp(): void {
    if (this.filteredSearchList && this.currentItemIndex.value < 0) {
      this.currentItemIndex.next(this.filteredSearchList.length - 1);
    } else {
      this.currentItemIndex.next(this.currentItemIndex.value - 1);
    }
    this.listItems?.get(this.currentItemIndex.value)?.nativeElement
      .scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  }

  public changeSelectedItem(id: number) {
    this.currentItemIndex.next(id);
    this.listItems?.get(this.currentItemIndex.value)?.nativeElement
      .scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  }

  onChange: any = () => {
  }

  onTouch: any = () => {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(selectValue: string | string[]): void {
    if (this.multiSelectProps) {
      if (selectValue) {
        this.multiSelectedListProps = <string[]>selectValue;
        if (this.multiSelectedListProps.length) {
          this.value = this.multiSelectedListProps?.join(", ");
        }
      } else {
        this.value = "";
      }
    } else {
      this.value = (<string>selectValue);
      this.multiSelectedListProps = <string[]>[selectValue];
    }
  }

  public removeInputValue(event: Event): void {
    event.preventDefault();
    this.value = "";
    this.multiSelectedListProps = [];
    this.isOpen = !this.isOpen;
    this.detectValueChanges(this.value);
  }

}
