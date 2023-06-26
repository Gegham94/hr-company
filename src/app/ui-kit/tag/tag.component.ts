import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TagTypesEnum } from "../../modules/app/constants/tag-types.enum";

@Component({
  selector: "hr-tag",
  templateUrl: "./tag.component.html",
  styleUrls: ["./tag.component.scss"],
})
export class TagComponent {
  @Input("text") public textProps!: string;
  @Input("type") public typeProps: TagTypesEnum = TagTypesEnum.outline;
  @Input()  isRemove?:boolean=true;
  @Output() delete: EventEmitter<string> = new EventEmitter();

  public deleteTag() {
    this.delete.emit();
  }
}
