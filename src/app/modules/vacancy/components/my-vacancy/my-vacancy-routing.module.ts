import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MyVacancyComponent } from "./my-vacancy.component";

const routes: Routes = [
  {
    path: "",
    component: MyVacancyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyVacancyRoutingModule {
}
