import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Observable, Subscriber, Subscription } from "rxjs";

@Component({
  selector: "hr-accordion",
  templateUrl: "./accordion.component.html",
  styleUrls: ["./accordion.component.scss"],
})
export class AccordionComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input("head-text") public headTextProps!: string;
  @Input("is-open") public isOpen?: boolean;
  @Input("vacancyUuId") public vacancyUuId?: string;

  private isAccordionOpen: boolean = this.isOpen ? this.isOpen : false;
  private accordionSubscriber!: Subscriber<boolean>;
  public accordionStateSubscription!: Subscription;
  public accordionState$: Observable<boolean>;

  constructor(private _changeDetectionRef: ChangeDetectorRef) {
    this.accordionState$ = new Observable((subscriber: Subscriber<boolean>) => {
      this.accordionSubscriber = subscriber;
    });
  }

  public accordionToggle(): void {
    this.accordionSubscriber.next(this.getAccordionState);
  }

  public set setAccordionState(status: boolean) {
    this.isAccordionOpen = status;
  }

  public get getAccordionState() {
    return this.isAccordionOpen;
  }

  ngAfterViewInit(): void {
    this.accordionStateSubscription = this.accordionState$.subscribe();
  }

  ngOnDestroy(): void {
    this.accordionStateSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (this.vacancyUuId) {
      this.isAccordionOpen = true;
    }
  }
}
