import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateVacancyInformationComponent } from "./create-vacancy-information.component";

const routes: Routes = [
  {
    path: "",
    component: CreateVacancyInformationComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVacancyInformationRoutingModule {
}
