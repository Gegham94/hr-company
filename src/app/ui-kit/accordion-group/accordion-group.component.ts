import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
} from "@angular/core";
import { AccordionComponent } from "../accordion/accordion.component";

@Component({
  selector: "hr-accordion-group",
  templateUrl: "./accordion-group.component.html",
  styleUrls: ["./accordion-group.component.scss"],
})
export class AccordionGroupComponent implements AfterViewInit {
  @ContentChildren(AccordionComponent)
  public accordionList!: QueryList<AccordionComponent>;
  constructor(private _el: ElementRef) {}

  ngAfterViewInit(): void {
    this.accordionList.forEach((accordions: AccordionComponent, index: number) => {
      accordions.accordionState$.subscribe(() => {
        this.accordionList.forEach((accordionsInner: AccordionComponent, indexInner: number) => {
          if (indexInner !== index) { accordionsInner.setAccordionState = false; }
        });
        this.accordionList.get(index)!.setAccordionState = !this.accordionList.get(index)!.getAccordionState;
      });
    });
  }
}
