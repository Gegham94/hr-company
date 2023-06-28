import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NoAccessErrorComponent } from "../no-access-error.component";

const routes: Routes = [
  {
    path: "",
    component: NoAccessErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoAccessErrorRoutingModule {
}
