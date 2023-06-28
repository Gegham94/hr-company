import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SpecialistsComponent } from "../specialists/specialists.component";
import { SpecialistProfileComponent } from "../specialist-profile/specialist-profile.component";
import { TestsListComponent } from "../specialist-profile/analytics/tests-list/tests-list.component";

const routes: Routes = [
  {
    path: "",
    component: SpecialistsComponent,
  },
  {
    path: "profile",
    component: SpecialistProfileComponent,
  },
  {
    path: "profile/tests",
    component: TestsListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecialistsRoutingModule {}
