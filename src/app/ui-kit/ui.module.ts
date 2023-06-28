import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ButtonComponent} from "./button/button.component";
import {InputComponent} from "./input/input.component";
import {RadioComponent} from "./radio/radio.component";
import {SwitcherComponent} from "./switcher/switcher.component";
import {ProgressBarComponent} from "./progress-bar/progress-bar.component";
import {PaginationComponent} from "./pagination/pagination.component";
import {TagComponent} from "./tag/tag.component";
import {NavigateButtonComponent} from "./navigate-button/navigate-button.component";
import {AccordionComponent} from "./accordion/accordion.component";
import {AccordionGroupComponent} from "./accordion-group/accordion-group.component";
import {ListComponent} from "./list/list.component";
import {SearchableSelectComponent} from "./searchable-select/searchable-select.component";
import {FormsModule} from "@angular/forms";
import {ClickOutsideModule} from "ng-click-outside";
import {ModalComponent} from "./modal/modal.component";
import {ReactiveFormsModule} from "@angular/forms";
import {FileInputComponent} from "./file-input/file-input.component";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {environment} from "../../environments/environment";
import {NgxMaskModule} from "ngx-mask";
import {CheckboxComponent} from "./checkbox/checkbox.component";
import {RouterModule} from "@angular/router";
import {IconsModule} from "../shared/icons/icons.module";
import {TranslateModule} from "@ngx-translate/core";
import {LetDirective} from "../shared/directive/ng-let.directive";
import {ShowPasswordComponent} from "./show-password/show-password.component";
import {JobStatisticsComponent} from "./job-statistics/job-statistics.component";
import {JobDescriptionComponent} from "./job-description/job-description.component";
import {RemoveTagPipe} from "./pipe/remove-tag.pipe";
import {JobSkillsComponent} from "./job-skills/job-skills.component";
import {ParsePipe} from "./pipe/parse-pipe";
import {ObjectValuePipe} from "./pipe/object-value.pipe";
import {PrintComponent} from "./print/print.component";
import {HrLoaderComponent} from "./hr-loader/hr-loader.component";
import {MessageCodeComponent} from "./message-code/message-code.component";
import {MessageTimeComponent} from "./message-time/message-time.component";
import {FieldDirective} from "./directive/field-directive";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ToastsComponent} from "./toasts/toasts.component";
import {TooltipModule} from "ng2-tooltip-directive-ng13fix";
import {SearchSelectComponent} from "./search-select/search-select.component";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {TariffComponent} from "./tariff/tariff.component";
import {TariffListComponent} from "./tariff/tariff-list/tariff-list.component";
import {SliderComponent} from "./slider/slider.component";
import {ImageCropperModule} from "ngx-image-cropper";
import {EmptyContentComponent} from "./empty-content/empty-content.component";
import {GoBackComponent} from "./go-back/go-back.component";
import {DrawerComponent} from "./drawer/drawer.component";
import {SpecialistsProgressBarComponent} from "./specialists-progress-bar/specialists-progress-bar.component";
import {UserLoadSkeletonComponent} from "./user-load-skeleton/user-load-skeleton.component";
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";
import { UserCardComponent } from "./user-card/user-card.component";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    RadioComponent,
    SwitcherComponent,
    ProgressBarComponent,
    PaginationComponent,
    TagComponent,
    NavigateButtonComponent,
    AccordionComponent,
    AccordionGroupComponent,
    ListComponent,
    SearchableSelectComponent,
    ModalComponent,
    FileInputComponent,
    CheckboxComponent,
    LetDirective,
    JobStatisticsComponent,
    JobDescriptionComponent,
    RemoveTagPipe,
    JobSkillsComponent,
    ParsePipe,
    ObjectValuePipe,
    PrintComponent,
    ShowPasswordComponent,
    HrLoaderComponent,
    MessageCodeComponent,
    MessageTimeComponent,
    FieldDirective,
    ToastsComponent,
    SearchSelectComponent,
    TariffComponent,
    TariffListComponent,
    SliderComponent,
    EmptyContentComponent,
    GoBackComponent,
    DrawerComponent,
    SpecialistsProgressBarComponent,
    UserLoadSkeletonComponent,
    UserCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    ReactiveFormsModule,
    FormsModule,
    ImageCropperModule,
    NgxMaskModule.forRoot(),
    RouterModule,
    IconsModule,
    TranslateModule,
    NgbModule,
    InfiniteScrollModule,
    TooltipModule,
    CdkVirtualScrollViewport,
    ScrollingModule,
    NgxSkeletonLoaderModule,
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    RadioComponent,
    SwitcherComponent,
    ProgressBarComponent,
    PaginationComponent,
    TagComponent,
    NavigateButtonComponent,
    AccordionComponent,
    AccordionGroupComponent,
    ListComponent,
    SearchableSelectComponent,
    ModalComponent,
    FileInputComponent,
    CheckboxComponent,
    JobStatisticsComponent,
    JobDescriptionComponent,
    JobSkillsComponent,
    ParsePipe,
    PrintComponent,
    LetDirective,
    HrLoaderComponent,
    MessageCodeComponent,
    FieldDirective,
    RemoveTagPipe,
    ToastsComponent,
    SearchSelectComponent,
    TariffComponent,
    SliderComponent,
    EmptyContentComponent,
    GoBackComponent,
    DrawerComponent,
    SpecialistsProgressBarComponent,
    UserLoadSkeletonComponent,
    UserCardComponent
  ],
})
export class UiModule {
}
