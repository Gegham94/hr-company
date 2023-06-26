import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SpecialistsComponent} from "./specialists/specialists.component";
import {SpecialistProfileComponent} from "./specialist-profile/specialist-profile.component";
import {TestsComponent} from "./tests/tests.component";
import {TestsListComponent} from "./specialist-profile/analytics/tests-list/tests-list.component";

const routes: Routes = [
  {
    path: "",
    component: SpecialistsComponent
  },
  {
    path: "profile",
    component: SpecialistProfileComponent
  },
  {
    path: "profile/tests",
    component: TestsListComponent
  },
  {
    path: "profile/tests/test",
    component: TestsComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialistsRoutingModule {
}
