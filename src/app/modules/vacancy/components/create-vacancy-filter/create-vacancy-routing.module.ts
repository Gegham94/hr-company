import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateVacancyFilterComponent } from "./create-vacancy-filter.component";

const routes: Routes = [
  {
    path: "",
    component: CreateVacancyFilterComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVacancyRoutingModule {
}
