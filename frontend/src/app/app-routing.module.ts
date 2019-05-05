import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueComponent } from './issue/issue.component';
import { PatchComponent } from './patch/patch.component';
import { ReleaseComponent } from './release/release.component';
import { ReleaseDetailComponent } from './release/release-detail.component';
import { ReleaseCompareComponent } from './release-compare/release-compare.component';
import { PatchDetailComponent } from './patch/patch-detail.component';
import { PageNotFoundComponent } from './misc/page-not-found.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'patches', component: PatchComponent },
    { path: 'patch/:version/:sequence/:view', component: PatchDetailComponent },
    { path: 'patch/:version/:sequence', component: PatchDetailComponent },
    { path: 'releases', component: ReleaseComponent },
    { path: 'release/:version/:view', component: ReleaseDetailComponent },
    { path: 'release/:version', component: ReleaseDetailComponent },
    { path: 'issues', component: IssueComponent },
    { path: 'compare/:fromVersion/:toVersion', component: ReleaseCompareComponent },
    { path: 'compare/:fromVersion', component: ReleaseCompareComponent },
    { path: 'compare', component: ReleaseCompareComponent },
    { path: '**', component: PageNotFoundComponent }
];


@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
