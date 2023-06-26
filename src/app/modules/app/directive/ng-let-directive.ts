import {Directive, Inject, Input, TemplateRef, ViewContainerRef} from "@angular/core";

export class LetContext {
  constructor(private readonly dir: LetDirective) {}

  get ngLet(): any {
    return this.dir.ngLet;
  }
}

@Directive({
  selector:"[ngLet]"
})
export class LetDirective {
  @Input()
  ngLet: any;

  constructor(
    @Inject(ViewContainerRef) viewContainer: ViewContainerRef,
    @Inject(TemplateRef) templateRef: TemplateRef<LetContext>
  ) {
    viewContainer.createEmbeddedView(templateRef, new LetContext(this));
  }
}
